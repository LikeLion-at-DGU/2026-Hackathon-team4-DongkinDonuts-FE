import {
    useEffect,
    useState,
} from "react";

import { DAYS } from "../config/usageTableConfig";

import {
    getDigitalPatterns,
    saveDigitalPatterns,
} from "../api/digitalState";

import {
    ensureTodayGenerationInputs,
} from "../api/context";

import {
    generateAIRecoveryPlan,
    getTodayRecoverySlots,
    updateRecoverySlotNotification,
} from "../api/plans";

import {
    useDigitalUsageSession,
} from "./useDigitalUsageSession";

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

/*
 * 서버 응답에서 자동 알림 여부 읽기
 * 백엔드 필드명이 조금 달라도 대응
 */
function getNotificationEnabled(slot) {
    const value =
        slot?.notification_enabled ??
        slot?.notificationEnabled ??
        slot?.is_notification_enabled ??
        slot?.isNotificationEnabled ??
        false;

    // 혹시 서버에서 "true" 문자열로 내려오는 경우까지 대응
    return (
        value === true ||
        value === "true" ||
        value === 1
    );
}

export function useDigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
}) {
    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        schedules,
        setSchedules,
    ] = useState([]);

    const [
        alarmStates,
        setAlarmStates,
    ] = useState({});

    const {
        hasGeneratedResult,
        setHasGeneratedResult,

        resultVersion,
        setResultVersion,
    } = useDigitalUsageSession();

    const isResult =
        mode === "result";

    // -------------------------
    // 시간 포맷
    // -------------------------

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

    // -------------------------
    // 오늘 일정 서버에서 복원
    // -------------------------

    useEffect(() => {
        const loadTodaySchedules =
            async () => {
                try {
                    const result =
                        await getTodayRecoverySlots();

                    const slots =
                        Array.isArray(result)
                            ? result
                            : result?.results ??
                            [];

                    setSchedules(slots);

                    const initialAlarmStates =
                        Object.fromEntries(
                            slots.map(
                                (slot) => [
                                    slot.id,
                                    getNotificationEnabled(
                                        slot
                                    ),
                                ]
                            )
                        );

                    setAlarmStates(
                        initialAlarmStates
                    );

                    console.log(
                        "오늘 추천 일정:",
                        slots
                    );

                    console.log(
                        "초기 알림 상태:",
                        initialAlarmStates
                    );

                    if (
                        slots.length > 0
                    ) {
                        setHasGeneratedResult(
                            true
                        );
                    }
                } catch (error) {
                    console.error(
                        "오늘 추천 휴식 일정 조회 실패:",
                        error
                    );

                    setSchedules([]);
                    setAlarmStates({});
                }
            };

        loadTodaySchedules();
    }, [
        setHasGeneratedResult,
    ]);



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

                await saveDigitalPatterns(
                    patterns
                );

                console.log(
                    "PC 패턴 저장 완료"
                );

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

                    const recoveryPlan =
                        await generateAIRecoveryPlan(
                            {
                                notificationEnabled:
                                    true,
                            }
                        );

                    console.log(
                        "AI 오늘 회복 계획:",
                        recoveryPlan
                    );
                }

                /*
                 * 생성/재사용 뒤 서버에서
                 * 최신 일정 다시 조회
                 */
                const latestSlotsResult =
                    await getTodayRecoverySlots();

                const slots =
                    Array.isArray(
                        latestSlotsResult
                    )
                        ? latestSlotsResult
                        : latestSlotsResult
                            ?.results ??
                        [];

                setSchedules(slots);

                const initialAlarmStates =
                    Object.fromEntries(
                        slots.map(
                            (slot) => [
                                slot.id,
                                getNotificationEnabled(
                                    slot
                                ),
                            ]
                        )
                    );

                setAlarmStates(
                    initialAlarmStates
                );

                notifyUpcomingScheduleChanged();

                setHasGeneratedResult(
                    true
                );

                setResultVersion(
                    (prev) =>
                        prev + 1
                );

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

    // -------------------------
    // 자동 알림 ON/OFF
    // -------------------------

    const toggleAlarm =
        async (schedule) => {
            const slotId =
                typeof schedule ===
                    "object"
                    ? schedule.id
                    : schedule;

            const targetSlot =
                typeof schedule ===
                    "object"
                    ? schedule
                    : schedules.find(
                        (item) =>
                            item.id ===
                            slotId
                    );

            if (!slotId) {
                return;
            }

            const current =
                alarmStates[
                slotId
                ] ?? false;

            const next =
                !current;

            /*
             * 화면 즉시 반영
             */
            setAlarmStates(
                (prev) => ({
                    ...prev,
                    [slotId]: next,
                })
            );

            /*
             * schedules 내부 값도 같이 맞춤
             * 두 상태가 서로 따로 놀지 않게 함
             */
            setSchedules(
                (prev) =>
                    prev.map(
                        (item) =>
                            item.id ===
                                slotId
                                ? {
                                    ...item,
                                    notification_enabled:
                                        next,
                                    notificationEnabled:
                                        next,
                                }
                                : item
                    )
            );

            try {
                await updateRecoverySlotNotification(
                    slotId,
                    {
                        notificationEnabled:
                            next,

                        repeatRule:
                            targetSlot
                                ?.repeat_rule ??
                            "",
                    }
                );

                console.log(
                    "알림 설정 변경 성공:",
                    slotId,
                    next
                );

                notifyUpcomingScheduleChanged();

                window.dispatchEvent(
                    new CustomEvent(
                        "brainfit-alarm-toggle",
                        {
                            detail: {
                                slotId,
                                enabled: next,
                            },
                        }
                    )
                );
            } catch (error) {
                console.error(
                    "알림 설정 변경 실패:",
                    error
                );

                /*
                 * 실패하면 alarmStates 원복
                 */
                setAlarmStates(
                    (prev) => ({
                        ...prev,
                        [slotId]:
                            current,
                    })
                );

                /*
                 * schedules도 원복
                 */
                setSchedules(
                    (prev) =>
                        prev.map(
                            (item) =>
                                item.id ===
                                    slotId
                                    ? {
                                        ...item,
                                        notification_enabled:
                                            current,
                                        notificationEnabled:
                                            current,
                                    }
                                    : item
                        )
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
        toggleAlarm,

        toggleCell,
        toggleRow,
        resetAll,

        handleTemporarySave,
        handleCreate,
    };
}