import { useMemo, useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";

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

                setSchedules(
                    slots
                );

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