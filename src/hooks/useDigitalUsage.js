import { useMemo, useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { getDigitalPatterns, saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";

import {
    generateAIRecoveryPlan,
    getTodayRecoverySlots,
    updateRecoverySlotNotification,
} from "../api/plans";

// 프론트 표 순서: 일 월 화 수 목 금 토 (Date.getDay()와 동일한 순서라 인덱스로 바로 씀)
const DAY_CODE_MAP = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
];

// 특정 요일의 패턴만 "hour 집합"으로 뽑아서 비교하기 쉬운 형태로 만든다.
function todayHourSet(patterns, todayDayCode) {
    return new Set(
        (patterns ?? [])
            .filter(
                (pattern) =>
                    pattern.day_of_week === todayDayCode &&
                    pattern.is_used
            )
            .map((pattern) => pattern.hour)
    );
}

function hourSetsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const hour of a) {
        if (!b.has(hour)) return false;
    }
    return true;
}

export function useDigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
}) {
    const [isSaving, setIsSaving] =
        useState(false);

    const [schedules, setSchedules] =
        useState([]);

    const [alarmStates, setAlarmStates] =
        useState({});

    const [
        hasGeneratedResult,
        setHasGeneratedResult,
    ] = useState(false);

    const [
        resultVersion,
        setResultVersion,
    ] = useState(0);

    const isResult =
        mode === "result";

    // 시간 포맷
    const formatScheduleTime = (dateTime) => {
        if (!dateTime) return null;

        const date = new Date(dateTime);

        return date.toLocaleTimeString(
            "ko-KR",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }
        );
    };

    // 자동 알림이 켜져 있는 추천 시간만 추출
    const activeRecommendedTimes =
        useMemo(() => {
            return schedules
                .filter(
                    (schedule) =>
                        alarmStates?.[
                        schedule.id
                        ] === true
                )
                .map((schedule) =>
                    formatScheduleTime(
                        schedule.effective_time
                    )
                )
                .filter(Boolean);
        }, [schedules, alarmStates]);

    const toggleCell = (
        rowIndex,
        colIndex
    ) => {
        if (isResult) return;

        const key =
            `${rowIndex}-${colIndex}`;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleRow = (
        rowIndex
    ) => {
        if (isResult) return;

        setSelected((prev) => {
            const rowKeys =
                DAYS.map(
                    (_, colIndex) =>
                        `${rowIndex}-${colIndex}`
                );

            const isAllSelected =
                rowKeys.every(
                    (key) =>
                        !!prev[key]
                );

            const next = {
                ...prev,
            };

            rowKeys.forEach(
                (key) => {
                    next[key] =
                        !isAllSelected;
                }
            );

            return next;
        });
    };

    const resetAll = () => {
        if (isResult) return;

        setSelected({});
    };

    const convertSelectedToPatterns = (
        selectedData
    ) => {
        return Object.entries(
            selectedData
        )
            .filter(
                ([, isSelected]) =>
                    isSelected
            )
            .map(([key]) => {
                const [
                    rowIndex,
                    colIndex,
                ] = key
                    .split("-")
                    .map(Number);

                return {
                    day_of_week:
                        DAY_CODE_MAP[
                        colIndex
                        ],
                    hour: rowIndex,
                    is_used: true,
                };
            });
    };

    const savePatterns =
        async () => {
            try {
                setIsSaving(true);

                const patterns =
                    convertSelectedToPatterns(
                        selected
                    );

                const result =
                    await saveDigitalPatterns(
                        patterns
                    );

                console.log(
                    "PC 사용 패턴 저장 성공:",
                    result
                );

                return true;
            } catch (error) {
                console.error(
                    "PC 사용 패턴 저장 실패:",
                    error
                );

                return false;
            } finally {
                setIsSaving(false);
            }
        };

    const handleTemporarySave =
        async () => {
            await savePatterns();
        };

    // PC 패턴 저장 → (필요할 때만) AI 회복 계획 생성
    //
    // PC 사용 패턴은 요일 7개짜리 주간 반복 템플릿인데, 예전엔 "생성" 버튼을 누르면
    // 어떤 요일을 고쳤든 상관없이 무조건 오늘 회복 계획을 취소하고 새로 만들었다.
    // 그래서 오늘(예: 목요일)과 무관한 다른 요일(예: 월요일) 칸만 고쳐도 오늘 계획이
    // 매번 취소+재생성되고, "Your History"에 취소된 row가 계속 쌓이는 문제가 있었다.
    // 이제 저장 직전에 "오늘 요일" 패턴이 실제로 바뀌었는지 비교해서, 안 바뀌었으면
    // (그리고 오늘 계획이 이미 있으면) 재생성 없이 기존 슬롯을 그대로 보여준다.
    const handleCreate =
        async () => {
            try {
                setIsSaving(true);

                const todayDayCode =
                    DAY_CODE_MAP[
                        new Date().getDay()
                    ];

                // 1. 선택한 PC 패턴 변환
                const patterns =
                    convertSelectedToPatterns(
                        selected
                    );

                // 2. 저장 전 "오늘 요일" 패턴 스냅샷을 미리 떠둔다(저장하면 덮어써지니
                // 비교는 저장 전에 해야 함).
                const previousPatterns =
                    await getDigitalPatterns();
                const previousTodayHours =
                    todayHourSet(
                        Array.isArray(previousPatterns)
                            ? previousPatterns
                            : previousPatterns?.results ?? [],
                        todayDayCode
                    );
                const nextTodayHours =
                    todayHourSet(patterns, todayDayCode);
                const todayPatternChanged =
                    !hourSetsEqual(
                        previousTodayHours,
                        nextTodayHours
                    );

                // 3. PC 패턴 서버 저장(요일 상관없이 전체 저장은 항상 함)
                await saveDigitalPatterns(
                    patterns
                );

                console.log(
                    "PC 패턴 저장 완료"
                );

                // 4. 오늘 이미 활성 계획이 있는지 확인
                const existingSlotsResult =
                    await getTodayRecoverySlots();
                const existingSlots = Array.isArray(
                    existingSlotsResult
                )
                    ? existingSlotsResult
                    : existingSlotsResult?.results ?? [];

                let slots;
                let recoveryPlan;

                if (
                    !todayPatternChanged &&
                    existingSlots.length > 0
                ) {
                    // 오늘 요일 패턴이 안 바뀌었고 오늘 계획도 이미 있으면, 굳이
                    // 다시 만들지 않고 있는 걸 그대로 쓴다.
                    console.log(
                        "오늘 요일 패턴 변경 없음 — 기존 오늘 계획 재사용"
                    );
                    slots = existingSlots;
                } else {
                    // 5. AI 생성에 필요한 오늘 상태/활동 데이터 보장
                    await ensureTodayGenerationInputs();

                    // 6. AI 회복 계획 생성
                    recoveryPlan =
                        await generateAIRecoveryPlan({
                            notificationEnabled:
                                true,
                        });

                    console.log(
                        "AI 오늘 회복 계획:",
                        recoveryPlan
                    );

                    slots =
                        recoveryPlan?.slots ??
                        [];
                }

                // 7. 슬롯 저장
                setSchedules(
                    slots
                );

                // 8. 슬롯의 알림 상태 반영
                const initialAlarmStates =
                    Object.fromEntries(
                        slots.map(
                            (slot) => [
                                slot.id,
                                slot.notification_enabled ??
                                false,
                            ]
                        )
                    );

                setAlarmStates(
                    initialAlarmStates
                );

                // 9. 결과가 존재한다고 표시
                setHasGeneratedResult(
                    true
                );

                // 10. 분석 카드가
                // 새로운 패턴 분석을 다시 조회하도록 버전 증가
                setResultVersion(
                    (prev) =>
                        prev + 1
                );

                // 11. 결과 화면으로 전환
                onCreate();
            } catch (error) {
                console.error(
                    "휴식 타이머 생성 실패:",
                    error
                );
            } finally {
                setIsSaving(false);
            }
        };

    // 자동 알림 ON/OFF
    const toggleAlarm =
        async (slotId) => {
            const current =
                alarmStates[
                slotId
                ] ?? false;

            const next =
                !current;

            // 먼저 UI 변경
            setAlarmStates(
                (prev) => ({
                    ...prev,
                    [slotId]:
                        next,
                })
            );

            try {
                const slot =
                    schedules.find(
                        (item) =>
                            item.id ===
                            slotId
                    );

                await updateRecoverySlotNotification(
                    slotId,
                    {
                        notificationEnabled:
                            next,

                        repeatRule:
                            slot?.repeat_rule ??
                            "",
                    }
                );

                console.log(
                    "알림 설정 변경 성공:",
                    slotId,
                    next
                );
            } catch (error) {
                console.error(
                    "알림 설정 변경 실패:",
                    error
                );

                // 실패 시 원래 상태로 복구
                setAlarmStates(
                    (prev) => ({
                        ...prev,
                        [slotId]:
                            current,
                    })
                );
            }
        };

    return {
        isResult,
        isSaving,

        hasGeneratedResult,
        resultVersion,

        schedules,
        alarmStates,

        // ⭐ 추가
        activeRecommendedTimes,

        toggleCell,
        toggleRow,
        resetAll,
        toggleAlarm,

        handleTemporarySave,
        handleCreate,
    };
}
