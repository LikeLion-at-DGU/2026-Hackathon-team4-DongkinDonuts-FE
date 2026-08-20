import Warning from "../../assets/icons/Warning.svg";

import * as S from "../common/SessionConfirmModal.styled";

function RoutineModal({
    description = "이전 루틴을 완료한 후 이용해주세요",
    onClose,
}) {
    return (
        <S.Overlay onClick={onClose}>
            <S.Modal
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <S.CheckIcon>
                    <img
                        src={Warning}
                        alt="경고"
                    />
                </S.CheckIcon>

                <S.Title>
                    이전 휴식 세션을
                    <br />
                    먼저 완료해주세요
                </S.Title>

                <S.Description>
                    {description}
                </S.Description>

                <S.SingleButtonRow>
                    <S.StartButton
                        type="button"
                        onClick={onClose}
                    >
                        확인
                    </S.StartButton>
                </S.SingleButtonRow>
            </S.Modal>
        </S.Overlay>
    );
}

export default RoutineModal;