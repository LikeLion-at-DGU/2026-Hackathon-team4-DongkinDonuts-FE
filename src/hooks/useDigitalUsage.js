import {
    useState,
} from "react";

import { DAYS } from "../config/usageTableConfig";
import { getDigitalPatterns, saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";
import { notifyUpcomingScheduleChanged } from "./useUpcomingSchedule";

import {
    generateAIRecoveryPlan,
    getTodayRecoverySlots,
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

    const isResult =
        mode === "result";

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

                if (
                    !todayPatternChanged &&
                    existingSlots.length > 0
                ) {
                    // 오늘 요일 패턴이 안 바뀌었고 오늘 계획도 이미 있으면, 굳이
                    // 다시 만들지 않고 있는 걸 그대로 쓴다.
                    console.log(
                        "오늘 요일 패턴 변경 없음 — 기존 오늘 계획 재사용"
                    );
                } else {
                    // 5. AI 생성에 필요한 오늘 상태/활동 데이터 보장
                    await ensureTodayGenerationInputs();

                    // 6. AI 회복 계획 생성
                    const recoveryPlan =
                        await generateAIRecoveryPlan({
                            notificationEnabled:
                                true,
                        });

                    console.log(
                        "AI 오늘 회복 계획:",
                        recoveryPlan
                    );
                }

                // 7. "오늘의 추천 휴식 일정"/"분석 결과" 카드는 이제 둘 다 PC
                // 패턴 흐름과 완전히 독립된 컴포넌트라서, 여기서 직접 값을 넣어주는
                // 대신 "다시 조회해줘"라고만 알린다 — 카드가 항상 서버의 실제
                // 최신 상태를 스스로 가져온다.
                notifyUpcomingScheduleChanged();

                // 8. 결과 화면으로 전환
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

    return {
        isResult,
        isSaving,

        toggleCell,
        toggleRow,
        resetAll,

        handleTemporarySave,
        handleCreate,
    };
}
