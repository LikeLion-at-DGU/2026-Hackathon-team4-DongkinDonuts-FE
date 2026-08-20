import {
    useState,
} from "react";

import { DAYS } from "../config/usageTableConfig";

import {
    getDigitalPatterns,
    saveDigitalPatterns,
    deleteDigitalPatterns,
} from "../api/digitalState";

import {
    ensureTodayGenerationInputs,
} from "../api/context";

import {
    generateAIRecoveryPlan,
    getTodayRecoverySlots,
} from "../api/plans";

import {
    notifyUpcomingScheduleChanged,
} from "./useUpcomingSchedule";

const DAY_CODE_MAP = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
];

function todayHourSet(
    patterns,
    todayDayCode
) {
    return new Set(
        (patterns ?? [])
            .filter(
                (pattern) =>
                    pattern.day_of_week ===
                    todayDayCode &&
                    pattern.is_used
            )
            .map(
                (pattern) =>
                    pattern.hour
            )
    );
}

function hourSetsEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }

    for (const hour of a) {
        if (!b.has(hour)) {
            return false;
        }
    }

    return true;
}

export function useDigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
    onTemporarySave,
}) {
    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const isResult =
        mode === "result";

    // -------------------------
    // 표 선택
    // -------------------------

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

    // 특정 칸을 정해진 값으로 고정 설정(토글이 아님) — 드래그로 여러 칸을
    // 한번에 선택/해제할 때 씀. toggleCell처럼 "지금 값의 반대로 뒤집기"였다면
    // 드래그 중 지나가는 칸마다 계속 반대로 튕겨서 드래그가 안 먹힌다. 시작
    // 칸을 누른 순간 정해진 값을 드래그 내내 그대로 적용한다.
    const setCellValue = (
        rowIndex,
        colIndex,
        value
    ) => {
        if (isResult) {
            return;
        }

        const key =
            `${rowIndex}-${colIndex}`;

        setSelected((prev) => {
            if (prev[key] === value) {
                return prev;
            }

            return {
                ...prev,
                [key]: value,
            };
        });
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

    const resetAll = () => {
        if (isResult) {
            return;
        }

        setSelected({});
    };

    // -------------------------
    // selected → API 형식
    // -------------------------

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

    // -------------------------
    // 패턴 저장
    // -------------------------

    const savePatterns = async () => {
        try {
            setIsSaving(true);

            const patterns =
                convertSelectedToPatterns(
                    selected
                );

            if (patterns.length === 0) {
                await deleteDigitalPatterns();

                console.log(
                    "PC 사용 패턴 전체 삭제 완료"
                );

                return true;
            }

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

    const handleTemporarySave = async () => {
        const success =
            await savePatterns();

        if (!success) {
            return;
        }

        onTemporarySave?.();
    };

    // -------------------------
    // 휴식 타이머 생성
    // -------------------------

    const handleCreate =
        async () => {
            try {
                setIsSaving(true);

                const todayDayCode =
                    DAY_CODE_MAP[
                    new Date().getDay()
                    ];

                const patterns =
                    convertSelectedToPatterns(
                        selected
                    );

                const previousPatternsResult =
                    await getDigitalPatterns();

                const previousPatterns =
                    Array.isArray(
                        previousPatternsResult
                    )
                        ? previousPatternsResult
                        : previousPatternsResult
                            ?.results ??
                        [];

                const previousTodayHours =
                    todayHourSet(
                        previousPatterns,
                        todayDayCode
                    );

                const nextTodayHours =
                    todayHourSet(
                        patterns,
                        todayDayCode
                    );

                const todayPatternChanged =
                    !hourSetsEqual(
                        previousTodayHours,
                        nextTodayHours
                    );

                if (patterns.length === 0) {
                    await deleteDigitalPatterns();

                    console.log(
                        "PC 패턴 전체 삭제 완료"
                    );
                } else {
                    await saveDigitalPatterns(
                        patterns
                    );

                    console.log(
                        "PC 패턴 저장 완료"
                    );
                }

                const existingSlotsResult =
                    await getTodayRecoverySlots();

                const existingSlots =
                    Array.isArray(
                        existingSlotsResult
                    )
                        ? existingSlotsResult
                        : existingSlotsResult
                            ?.results ??
                        [];

                if (
                    !todayPatternChanged &&
                    existingSlots.length >
                    0
                ) {
                    console.log(
                        "오늘 요일 패턴 변경 없음 → 기존 오늘 계획 재사용"
                    );
                } else {
                    await ensureTodayGenerationInputs();

                    // PC 사용 패턴을 직접 입력하고 만든 흐름이라 useAiDecision:
                    // true로, 실제 LLM이 개수/시각을 자율적으로 판단하게 한다.
                    const recoveryPlan =
                        await generateAIRecoveryPlan(
                            {
                                notificationEnabled:
                                    true,
                                useAiDecision:
                                    true,
                            }
                        );

                    console.log(
                        "AI 오늘 회복 계획:",
                        recoveryPlan
                    );
                }

                // "오늘의 추천 휴식 일정"/"분석 결과" 카드는 이제 둘 다 PC
                // 패턴 흐름과 완전히 독립된 컴포넌트라서, 여기서 직접 값을 넣어주는
                // 대신 "다시 조회해줘"라고만 알린다 — 카드가 항상 서버의 실제
                // 최신 상태를 스스로 가져온다.
                notifyUpcomingScheduleChanged();

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
        setCellValue,
        toggleRow,
        resetAll,

        handleTemporarySave,
        handleCreate,
    };
}
