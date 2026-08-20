import { useState } from "react";
import {
    createContextSnapshot,
    createNextActivityPlan,
    CONDITION_LABEL_TO_STATE_CODE,
    getCurrentNextActivityPlan,
    activityLabelToCode,
    timeLabelToMinutes,
} from "../api/context";
import { consumeNearestSnapshotRecoverySlot } from "../api/plans";

export const useSetupModal = ({
    forceNextActivityInput = false,
} = {}) => {
    const [step, setStep] = useState(1);

    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [isActivityInputOpen, setIsActivityInputOpen] = useState(false);
    const [customActivity, setCustomActivity] = useState("");

    const [isTimeInputOpen, setIsTimeInputOpen] = useState(false);
    const [customTime, setCustomTime] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [contextSnapshotId, setContextSnapshotId] = useState(null);
    const [snapshotCondition, setSnapshotCondition] = useState("");
    const [hasConsumedReentrySlot, setHasConsumedReentrySlot] = useState(false);

    const goNext = () => {
        if (!selectedCondition) {
            window.alert("현재 상태를 하나 선택해주세요.");
            return;
        }

        setStep(2);
    };

    const goPrev = () => {
        setStep(1);
    };

    const openActivityInput = () => {
        if (customActivity.startsWith("#")) {
            setCustomActivity(customActivity.slice(1));
        }

        setIsActivityInputOpen(true);
    };

    const submitCustomActivity = () => {
        const value = customActivity.trim();

        if (!value) {
            setIsActivityInputOpen(false);
            return;
        }

        const activityWithHash = value.startsWith("#")
            ? value
            : `#${value}`;

        setCustomActivity(activityWithHash);
        setSelectedActivity(activityWithHash);
        setIsActivityInputOpen(false);
    };

    const openTimeInput = () => {
        setIsTimeInputOpen(true);
    };

    const submitCustomTime = () => {
        const value = customTime.trim();

        if (!value) {
            setIsTimeInputOpen(false);
            return;
        }

        setSelectedTime(value);
        setIsTimeInputOpen(false);
    };

    const createSelectedSnapshot = async () => {
        if (!selectedCondition) {
            return {
                errorMessage: "현재 상태를 선택해주세요.",
            };
        }

        if (
            contextSnapshotId &&
            snapshotCondition === selectedCondition
        ) {
            return {
                snapshot: {
                    id: contextSnapshotId,
                },
            };
        }

        const stateCode =
            CONDITION_LABEL_TO_STATE_CODE[
            selectedCondition
            ];

        if (!stateCode) {
            return {
                errorMessage: "선택한 상태를 저장할 수 없어요.",
            };
        }

        const snapshot = await createContextSnapshot([
            stateCode,
        ]);

        setContextSnapshotId(snapshot.id);
        setSnapshotCondition(selectedCondition);
        return {
            snapshot,
        };
    };

    // 1단계 완료: 현재 상태는 항상 새 스냅샷으로 저장한다. 이후 활동이 아직 유효하면
    // 기존 활동/시간과 그 활동에 붙은 기존 상태를 유지하고 바로 AI 계획 생성으로 넘긴다.
    const submitCurrentState = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const snapshotResult =
                await createSelectedSnapshot();

            if (snapshotResult.errorMessage) {
                setSubmitError(snapshotResult.errorMessage);
                return {
                    errorMessage: snapshotResult.errorMessage,
                };
            }

            if (!hasConsumedReentrySlot) {
                try {
                    await consumeNearestSnapshotRecoverySlot();
                    setHasConsumedReentrySlot(true);
                } catch (error) {
                    console.error(
                        "재진입 스냅샷 알림 정리 실패:",
                        error
                    );
                }
            }

            const currentActivityPlan =
                forceNextActivityInput
                    ? null
                    : await getCurrentNextActivityPlan();

            if (currentActivityPlan) {
                return {
                    contextSnapshotId:
                        snapshotResult.snapshot.id,
                    nextActivityPlanId:
                        currentActivityPlan.id,
                    reusedNextActivity: true,
                };
            }

            setStep(2);
            return {
                needsNextActivity: true,
            };
        } catch (error) {
            console.error(
                "현재 상태 저장 실패:",
                error
            );

            const message =
                error?.message ??
                "현재 상태를 저장하지 못했습니다.";

            setSubmitError(message);

            return {
                errorMessage: message,
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2단계 완료: 유효한 이후 활동이 없을 때만 새 활동/시간을 만들고, 방금 상태 스냅샷에 묶는다.
    const completeSetup = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            if (!selectedActivity || !selectedTime) {
                const message =
                    "이후 활동과 활동 시간을 모두 선택해주세요.";
                setSubmitError(message);
                return {
                    errorMessage: message,
                };
            }

            let snapshotId = contextSnapshotId;
            if (!snapshotId) {
                const snapshotResult =
                    await createSelectedSnapshot();

                if (snapshotResult.errorMessage) {
                    setSubmitError(snapshotResult.errorMessage);
                    return {
                        errorMessage: snapshotResult.errorMessage,
                    };
                }

                snapshotId = snapshotResult.snapshot.id;
            }

            const expectedActivityMinutes =
                timeLabelToMinutes(
                    selectedTime
                );

            if (!expectedActivityMinutes) {
                const message =
                    "활동 시간을 분 단위로 입력해주세요.";
                setSubmitError(message);
                return {
                    errorMessage: message,
                };
            }

            const nextActivityPlan =
                await createNextActivityPlan({
                    activityTags: [
                        activityLabelToCode(
                            selectedActivity
                        ),
                    ],

                    expectedActivityMinutes,

                    contextSnapshotId: snapshotId,
                });

            return {
                contextSnapshotId: snapshotId,
                nextActivityPlanId: nextActivityPlan.id,
                reusedNextActivity: false,
            };
        } catch (error) {
            console.error(
                "이후 활동 저장 실패:",
                error
            );

            const message =
                error?.message ??
                "이후 활동을 저장하지 못했습니다.";

            setSubmitError(message);

            return {
                errorMessage: message,
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step,
        goNext,
        goPrev,

        selectedCondition,
        setSelectedCondition,

        selectedActivity,
        setSelectedActivity,

        selectedTime,
        setSelectedTime,

        isActivityInputOpen,
        customActivity,
        setCustomActivity,
        openActivityInput,
        submitCustomActivity,

        isTimeInputOpen,
        customTime,
        setCustomTime,
        openTimeInput,
        submitCustomTime,

        isSubmitting,
        submitError,
        submitCurrentState,
        completeSetup,
    };
};
