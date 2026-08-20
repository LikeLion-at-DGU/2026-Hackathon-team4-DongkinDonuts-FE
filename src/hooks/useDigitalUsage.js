import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { DAYS } from "../config/usageTableConfig";
import { getDigitalPatterns, saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";
import { useDigitalUsageSession } from "./useDigitalUsageSession";

import {
    generateAIRecoveryPlan,
    getRecoverySlotHistory,
    getTodayRecoverySlots,
    updateRecoverySlotNotification,
} from "../api/plans";

function todayDateParam() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// "오늘의 추천 휴식 일정" 카드는 History와 같은 데이터(오늘 슬롯)를 보되, 그중
// "진행 예정"(아직 시작 전)인 것만 보여준다 — 완료/취소/진행중/미완료은 History
// 표 쪽 몫이라 여기선 제외한다.
async function fetchUpcomingTodaySlots() {
    const result = await getRecoverySlotHistory(todayDateParam());
    const slots = Array.isArray(result) ? result : result?.results ?? [];
    return slots.filter(
        (slot) => slot.history_status_label === "진행 예정"
    );
}

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

    const {
        schedules,
        setSchedules,

        alarmStates,
        setAlarmStates,

        hasGeneratedResult,
        setHasGeneratedResult,

        resultVersion,
        setResultVersion,
    } = useDigitalUsageSession();

    const isResult =
        mode === "result";

    // "오늘의 추천 휴식 일정" 카드는 마지막으로 "생성"을 눌렀을 때의 스냅샷을
    // localStorage에 저장해뒀다가 그대로 보여줬는데, 그래서 다른 탭/새로고침
    // 등으로 다시 들어오면 그 사이에 서버에서 실제로 어떤 슬롯이 "진행 예정"인지와
    // 어긋난 오래된 내용이 뜨는 문제가 있었다("Your History"는 매번 서버에서
    // 새로 조회해서 안 그런데 이 카드만 그랬음). 결과 화면이 보일 때마다 서버의
    // 실제 오늘 슬롯 목록으로 다시 맞춘다.
    useEffect(() => {
        if (!isResult) {
            return;
        }

        let cancelled = false;

        const refreshSchedules = async () => {
            try {
                const slots =
                    await fetchUpcomingTodaySlots();

                if (cancelled) {
                    return;
                }

                setSchedules(slots);

                setAlarmStates(
                    Object.fromEntries(
                        slots.map((slot) => [
                            slot.id,
                            slot.notification_enabled ??
                                false,
                        ])
                    )
                );
            } catch (error) {
                console.error(
                    "오늘 회복 슬롯 새로고침 실패:",
                    error
                );
            }
        };

        refreshSchedules();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResult]);

    // 시간 포맷
    const formatScheduleTime = (
        dateTime
    ) => {
        if (!dateTime) {
            return null;
        }

        const date =
            new Date(dateTime);

        return date.toLocaleTimeString(
            "ko-KR",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }
        );
    };

    // 자동 알림이 켜진 추천 시간
    const activeRecommendedTimes =
        useMemo(() => {
            return schedules
                .filter(
                    (schedule) =>
                        alarmStates?.[
                            schedule.id
                        ] === true
                )
                .map(
                    (schedule) =>
                        formatScheduleTime(
                            schedule.effective_time
                        )
                )
                .filter(Boolean);
        }, [
            schedules,
            alarmStates,
        ]);

    // 개별 칸 선택
    const toggleCell = (
        rowIndex,
        colIndex
    ) => {
        if (isResult) {
            return;
        }

        const key =
            `${rowIndex}-${colIndex}`;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // 한 행 전체 선택
    const toggleRow = (
        rowIndex
    ) => {
        if (isResult) {
            return;
        }

        setSelected((prev) => {
            const rowKeys =
                DAYS.map(
                    (
                        _,
                        colIndex
                    ) =>
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

    // 전체 초기화
    const resetAll = () => {
        if (isResult) {
            return;
        }

        setSelected({});
    };

    // selected → 백엔드 요청 데이터
    const convertSelectedToPatterns = (
        selectedData
    ) => {
        return Object.entries(
            selectedData
        )
            .filter(
                (
                    [
                        ,
                        isSelected,
                    ]
                ) =>
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

    // PC 사용 패턴 저장
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

    // 임시 저장
    const handleTemporarySave =
        async () => {
            await savePatterns();
        };

    // PC 패턴 저장 → AI 회복 계획 생성
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

                // 7. 화면에 보여줄 슬롯은 방금 생성/재사용한 결과가 아니라, "오늘의
                // 추천 휴식 일정" 카드와 항상 같은 기준(History API의 "진행 예정"
                // 필터)으로 다시 맞춘다 — 어느 경로로 왔든 카드에 보이는 내용이
                // 항상 서버의 실제 최신 상태와 일치하게 하기 위함. 이 조회가
                // 실패하면 방금 얻은 slots를 그대로 폴백으로 쓴다.
                let displaySlots = slots;

                try {
                    displaySlots =
                        await fetchUpcomingTodaySlots();
                } catch (refreshError) {
                    console.error(
                        "오늘의 추천 휴식 일정 새로고침 실패, 방금 생성한 결과로 대체:",
                        refreshError
                    );
                }

                setSchedules(displaySlots);

                // 8. 슬롯의 알림 상태 반영
                const initialAlarmStates =
                    Object.fromEntries(
                        displaySlots.map(
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

            // UI 먼저 변경
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

                // 실패 시 롤백
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

        activeRecommendedTimes,

        toggleCell,
        toggleRow,
        resetAll,
        toggleAlarm,

        handleTemporarySave,
        handleCreate,
    };
}
