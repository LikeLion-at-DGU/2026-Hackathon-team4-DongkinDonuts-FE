import { useState } from "react";

export function useRecoverySessionFlow({
    hasPlan,
    navigate,
    onGeneratePlan,
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

    // 홈의 "회복 루틴 시작하기"
    const openMainRoutineFlow = () => {
        if (hasPlan) {
            setShowScheduledModal(true);
            return;
        }

        setSetupModalMode("initial");
        setConditionOnly(false);
        setShowSetupModal(true);
    };

    // 알림 클릭
    const openNotificationFlow = () => {
        setSetupModalMode("initial");
        setConditionOnly(true);
        setShowSetupModal(true);
    };

    // 최초 접속
    const openInitialSetup = () => {
        setSetupModalMode("initial");
        setConditionOnly(false);
        setShowSetupModal(true);
    };

    // 이미 예정된 시간이 있어요 → 시작
    // 상태 입력 모달 다시 열지 않고 바로 세션으로 이동
    const startScheduledFlow = () => {
        setShowScheduledModal(false);

        navigate("/recovery-session");
    };

    // 상태만 입력 완료
    const completeCondition = () => {
        setShowSetupModal(false);
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
    };

    const closeScheduled = () => {
        setShowScheduledModal(false);
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