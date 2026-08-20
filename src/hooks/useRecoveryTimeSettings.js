import { useState } from "react";

import {
    updateRecoverySlotNotification,
    updateRecoverySlotSchedule,
} from "../api/plans";

export function useRecoveryTimeSettings({
    recoverySlotId,
    resetTimeLabel,
    refreshNextReset,
}) {
    const [
        showTimeModal,
        setShowTimeModal,
    ] = useState(false);

    const [
        repeatAlarm,
        setRepeatAlarm,
    ] = useState(true);

    const [
        activeRecommendedTimes,
        setActiveRecommendedTimes,
    ] = useState([
        "16:00",
        "18:00",
    ]);

    const openTimeModal = () => {
        setShowTimeModal(true);
    };

    const closeTimeModal = () => {
        setShowTimeModal(false);
    };

    const handleSaveTime = async (
        time,
        repeat
    ) => {
        if (!recoverySlotId) {
            window.alert(
                '변경할 예정된 리셋이 없어요. 먼저 "내 계획 다시 설정"으로 계획을 만들어주세요.'
            );

            return false;
        }

        const [hour, minute] =
            time
                .split(":")
                .map(Number);

        const scheduledAt =
            new Date();

        scheduledAt.setHours(
            hour,
            minute,
            0,
            0
        );

        const now = new Date();

        if (
            scheduledAt.getTime() <
            now.getTime()
        ) {
            window.alert(
                "현재 시간 이전으로는 리셋 시간을 변경할 수 없어요."
            );

            return false;
        }

        try {
            const pad = (number) =>
                String(number).padStart(
                    2,
                    "0"
                );

            const scheduledAtLocal =
                `${scheduledAt.getFullYear()}-` +
                `${pad(
                    scheduledAt.getMonth() +
                        1
                )}-` +
                `${pad(
                    scheduledAt.getDate()
                )}` +
                `T${pad(
                    scheduledAt.getHours()
                )}:` +
                `${pad(
                    scheduledAt.getMinutes()
                )}:00`;

            await updateRecoverySlotSchedule(
                recoverySlotId,
                scheduledAtLocal
            );

            await updateRecoverySlotNotification(
                recoverySlotId,
                {
                    notificationEnabled:
                        true,

                    repeatRule:
                        repeat
                            ? "DAILY"
                            : "",
                }
            );

            setRepeatAlarm(repeat);

            await refreshNextReset();

            return true;
        } catch (error) {
            console.error(
                "리셋 시간 변경 실패:",
                error
            );

            window.alert(
                "시간 변경에 실패했어요. 잠시 후 다시 시도해주세요."
            );

            return false;
        }
    };

    return {
        showTimeModal,
        repeatAlarm,
        activeRecommendedTimes,

        setActiveRecommendedTimes,

        openTimeModal,
        closeTimeModal,
        handleSaveTime,

        currentTime:
            recoverySlotId
                ? resetTimeLabel
                : "15:00",
    };
}