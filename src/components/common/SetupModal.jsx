import { useEffect } from "react";

import { useSetupModal } from "../../hooks/useSetupModal";

import CloseButton from "../../assets/icons/CloseButton.svg";

import ConditionStep from "./ConditionStep";
import ActivityStep from "./ActivityStep";

import * as S from "./SetupModal.styled";

function SetupModal({
    onClose,
    mode = "initial",
}) {
    const setup = useSetupModal();

    const currentStep =
        mode === "reset"
            ? 2
            : setup.step;

    const handleComplete = async () => {
        if (
            !setup.selectedActivity ||
            !setup.selectedTime
        ) {
            window.alert(
                "활동과 활동 시간을 하나씩 선택해주세요."
            );
            return;
        }

        const errorMessage =
            await setup.completeSetup(mode);

        if (errorMessage) {
            window.alert(
                "설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요."
            );
            return;
        }

        onClose();
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
                        onNext={setup.goNext}
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