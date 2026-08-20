import SetupModal from "./SetupModal";
import ScheduledSessionModal from "./ScheduledSessionModal";
import RoutineReadyModal from "./RoutineReadyModal";

function RecoveryFlowModals({
    flow,
}) {
    return (
        <>
            {flow.showScheduledModal && (
                <ScheduledSessionModal
                    onClose={
                        flow.closeScheduled
                    }
                    onStart={
                        flow.startScheduledFlow
                    }
                />
            )}

            {flow.showSetupModal && (
                <SetupModal
                    mode={
                        flow.setupModalMode
                    }
                    conditionOnly={
                        flow.conditionOnly
                    }
                    onClose={
                        flow.closeSetup
                    }
                    onConditionComplete={
                        flow.completeCondition
                    }
                    onSetupComplete={
                        flow.completeSetup
                    }
                />
            )}

            {flow.showReadyModal && (
                <RoutineReadyModal
                    onClose={
                        flow.closeReady
                    }
                />
            )}
        </>
    );
}

export default RecoveryFlowModals;