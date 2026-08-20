import { useEffect } from "react";

import { useSetupModal } from "../../hooks/useSetupModal";

import CloseButton from "../../assets/icons/CloseButton.svg";

import ConditionStep from "./ConditionStep";
import ActivityStep from "./ActivityStep";

import * as S from "./SetupModal.styled";

function SetupModal({
    onClose,
    mode = "initial",
    conditionOnly = false,
    onConditionComplete,
    onSetupComplete,
}) {
    const setup =
        useSetupModal();

    const currentStep =
        mode === "reset"
            ? 2
            : setup.step;

    const handleConditionNext =
        async () => {
            if (
                !setup.selectedCondition
            ) {
                window.alert(
                    "현재 상태를 하나 선택해주세요."
                );

                return;
            }

            // 기존 타이머가 있거나
            // 알림으로 진입한 경우
            if (conditionOnly) {
                const result =
                    await setup.completeConditionOnly();

                if (
                    result?.errorMessage
                ) {
                    window.alert(
                        "현재 상태를 저장하지 못했어요. 잠시 후 다시 시도해주세요."
                    );

                    return;
                }

                onConditionComplete?.(
                    {
                        condition:
                            setup.selectedCondition,
                        ...result,
                    }
                );

                return;
            }

            setup.goNext();
        };

    const handleComplete =
        async () => {
            if (
                !setup.selectedActivity ||
                !setup.selectedTime
            ) {
                window.alert(
                    "활동과 활동 시간을 하나씩 선택해주세요."
                );

                return;
            }

            const result =
                await setup.completeSetup(
                    mode
                );

            if (
                result?.errorMessage
            ) {
                window.alert(
                    "설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요."
                );

                return;
            }

            onSetupComplete?.({
                condition:
                    setup.selectedCondition,

                activity:
                    setup.selectedActivity,

                activityTime:
                    setup.selectedTime,

                ...result,
            });
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
                    화면을 끄지 않고 휴식하기,
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
                        onNext={
                            handleConditionNext
                        }
                        buttonText={
                            conditionOnly
                                ? "제출하기"
                                : "다음"
                        }
                    />
                )}

                {currentStep === 2 && (
                    <ActivityStep
                        {...setup}
                        mode={mode}
                        onPrev={
                            setup.goPrev
                        }
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
