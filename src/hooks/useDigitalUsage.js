import {
    useMemo,
    useState,
} from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";
import { useDigitalUsageSession } from "./useDigitalUsageSession";

import {
    generateAIRecoveryPlan,
    updateRecoverySlotNotification,
} from "../api/plans";

const DAY_CODE_MAP = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
];

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

                const patterns =
                    convertSelectedToPatterns(
                        selected
                    );

                await saveDigitalPatterns(
                    patterns
                );

                await ensureTodayGenerationInputs();

                const recoveryPlan =
                    await generateAIRecoveryPlan({
                        notificationEnabled:
                            true,
                    });

                const slots =
                    recoveryPlan?.slots ??
                    [];

                setSchedules(slots);

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