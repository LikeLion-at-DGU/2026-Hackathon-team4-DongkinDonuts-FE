import { useEffect } from "react";

import { useSetupModal } from "../../hooks/useSetupModal";

import CloseButton from "../../assets/icons/CloseButton.svg";

import ConditionStep from "./ConditionStep";
import ActivityStep from "./ActivityStep";

import * as S from "./SetupModal.styled";

function SetupModal({
    forceNextActivityInput = false,
    onClose,
    onComplete,
    mode = "initial",
}) {
    const setup = useSetupModal({
        forceNextActivityInput,
    });

    const currentStep =
        mode === "reset"
            ? 2
            : setup.step;

    const handleCurrentStateSubmit = async () => {
        const result = await setup.submitCurrentState();

        if (result?.errorMessage) {
            window.alert(result.errorMessage);
            return;
        }

        if (result?.needsNextActivity) {
            return;
        }

        if (onComplete) {
            onComplete(result);
            return;
        }

        onClose?.();
    };

    const handleComplete = async () => {
        const result =
            await setup.completeSetup();

        if (result?.errorMessage) {
            window.alert(result.errorMessage);
            return;
        }

        if (onComplete) {
            onComplete(result);
            return;
        }

        onClose?.();
    };

    useEffect(() => {
        const original =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                original;
        };
    }, []);

    return (
        <S.Overlay>
            <S.Modal>
                <S.CloseButton
                    onClick={onClose}
                >
                    <img
                        src={CloseButton}
                        alt="닫기"
                    />
                </S.CloseButton>

                <S.SmallLabel>
                    화면을 끄지 않고 리셋하기,
                    Brainfit
                </S.SmallLabel>

                {currentStep === 1 && (
                    <ConditionStep
                        selectedCondition={
                            setup.selectedCondition
                        }
                        setSelectedCondition={
                            setup.setSelectedCondition
                        }
                        isSubmitting={
                            setup.isSubmitting
                        }
                        onNext={
                            handleCurrentStateSubmit
                        }
                    />
                )}

                {currentStep === 2 && (
                    <ActivityStep
                        {...setup}
                        mode={mode}
                        onPrev={setup.goPrev}
                        onSkip={onClose}
                        onComplete={
                            handleComplete
                        }
                    />
                )}
            </S.Modal>
        </S.Overlay>
    );
}

export default SetupModal;
