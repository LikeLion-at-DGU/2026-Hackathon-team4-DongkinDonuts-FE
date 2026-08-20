import { useState } from "react";

import {
    buildRecoveryRoutinePath,
    findRunnableRoutine,
} from "../config/recoveryRouting";

export function useRecoverySessionFlow({
    navigate,
    onGeneratePlan,
    onGetCurrentActivityPlan,
    onCreateReentrySlot,
}) {
    const [showSetupModal, setShowSetupModal] =
        useState(false);

    const [
        showScheduledModal,
        setShowScheduledModal,
    ] = useState(false);

    const [
        showReadyModal,
        setShowReadyModal,
    ] = useState(false);

    const [
        setupModalMode,
        setSetupModalMode,
    ] = useState("initial");

    const [
        conditionOnly,
        setConditionOnly,
    ] = useState(false);

    const [
        conditionOnlyReason,
        setConditionOnlyReason,
    ] = useState(null);

    const [
        activeActivityPlan,
        setActiveActivityPlan,
    ] = useState(null);

    const openFullSetup = () => {
        setSetupModalMode("initial");
        setConditionOnly(false);
        setConditionOnlyReason(null);
        setActiveActivityPlan(null);
        setShowSetupModal(true);
    };

    const openActivityAwareFlow = async () => {
        try {
            const currentActivityPlan =
                await onGetCurrentActivityPlan?.();

            if (currentActivityPlan) {
                setActiveActivityPlan(currentActivityPlan);
                setShowScheduledModal(true);
                return;
            }
        } catch (error) {
            console.error(
                "현재 활성 활동 계획 조회 실패:",
                error
            );
        }

        openFullSetup();
    };

    // 홈의 "회복 루틴 시작하기"
    const openMainRoutineFlow = () => {
        openActivityAwareFlow();
    };

    // 알림 클릭
    const openNotificationFlow = () => {
        setSetupModalMode("initial");
        setConditionOnly(true);
        setConditionOnlyReason("notification");
        setShowSetupModal(true);
    };

    // 최초 접속
    const openInitialSetup = () => {
        openActivityAwareFlow();
    };

    // 이미 예정된 시간이 있어요 → 시작
    const startScheduledFlow = () => {
        setShowScheduledModal(false);
        setSetupModalMode("initial");
        setConditionOnly(true);
        setConditionOnlyReason("scheduled");
        setShowSetupModal(true);
    };

    // 상태만 입력 완료
    const completeCondition = async (result = {}) => {
        setShowSetupModal(false);

        if (conditionOnlyReason === "scheduled") {
            try {
                const slot =
                    await onCreateReentrySlot?.({
                    contextSnapshotId:
                        result.contextSnapshotId,
                    nextActivityPlanId:
                        activeActivityPlan?.id,
                });

                const routine =
                    findRunnableRoutine(slot);

                navigate(
                    routine
                        ? buildRecoveryRoutinePath(
                            slot,
                            routine
                        )
                        : "/recovery-session"
                );
            } catch (error) {
                console.error(
                    "재진입 회복 세션 생성 실패:",
                    error
                );

                window.alert(
                    "회복 세션을 준비하지 못했어요. 잠시 후 다시 시도해주세요."
                );
            }

            return;
        }

        setShowReadyModal(true);
    };

    // 상태 + 활동 입력 완료
    const completeSetup = async () => {
        setShowSetupModal(false);

        await onGeneratePlan?.();

        setShowReadyModal(true);
    };

    // 최종 세션 시작
    const startSession = () => {
        setShowReadyModal(false);

        navigate("/recovery-session");
    };

    const closeSetup = () => {
        setShowSetupModal(false);
        setConditionOnlyReason(null);
    };

    const closeScheduled = () => {
        setShowScheduledModal(false);
        setActiveActivityPlan(null);
    };

    const closeReady = () => {
        setShowReadyModal(false);
    };

    return {
        showSetupModal,
        showScheduledModal,
        showReadyModal,

        setupModalMode,
        conditionOnly,
        activeActivityPlan,

        openMainRoutineFlow,
        openNotificationFlow,
        openInitialSetup,

        startScheduledFlow,
        completeCondition,
        completeSetup,
        startSession,

        closeSetup,
        closeScheduled,
        closeReady,
    };
}
