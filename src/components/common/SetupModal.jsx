import { useEffect } from "react";

import { useSetupModal } from "../../hooks/useSetupModal";

import CloseButton from "../../assets/icons/CloseButton.svg";

import ConditionStep from "./ConditionStep";
import ActivityStep from "./ActivityStep";

import * as S from "./SetupModal.styled";

function SetupModal({
    onClose,
    onGenerate,
    hasExistingPlan = false,
    mode = "initial",
}) {
    const setup = useSetupModal();

    const currentStep =
        mode === "reset"
            ? 2
            : setup.step;

    // X(닫기)/건너뛰기는 onClose만 호출한다 — 새로 입력한 게 없으니 회복 계획을
    // 다시 만들 이유가 없다. 예전엔 X를 눌러도 onClose 하나가 "모달 닫기"와 "AI
    // 재생성"을 동시에 했었는데, 그래서 새로고침 후 아무것도 안 바꾸고 X만 눌러도
    // 이전 상태 그대로 AI가 다시 돌아서 기존 스냅샷 기반 알림들이 전부 취소되고
    // 새 알림이 또 생기는 문제가 있었다. 이제 "완료"로 실제 저장에 성공했을 때만
    // onGenerate를 별도로 호출한다.
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

        // 이미 생성된 계획/알림이 있는 상태에서 새로 저장하면 기존 알림들이
        // 취소되고 새 계획이 만들어진다 — 그 사실을 미리 안내하고 확인받는다.
        if (hasExistingPlan) {
            const confirmed = window.confirm(
                "새로 설정하면 이미 만들어진 알림/휴식 계획은 취소되고 새로 생성돼요. 계속할까요?"
            );

            if (!confirmed) {
                return;
            }
        }

        const errorMessage =
            await setup.completeSetup(mode);

        if (errorMessage) {
            window.alert(
                "설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요."
            );
            return;
        }

        onGenerate?.();
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