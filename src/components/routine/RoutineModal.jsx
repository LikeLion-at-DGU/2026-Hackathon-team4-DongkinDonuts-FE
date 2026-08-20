import Warning from "../../assets/icons/Warning.svg";
import * as S from "./RoutineModal.styled";

function RoutineModal({
    title = (
        <>
            이전 휴식 세션을
            <br />
            먼저 완료해주세요
        </>
    ),
    description = "이전 루틴을 완료한 후 이용해주세요",
    onClose,
}) {
    return (
        <S.ModalOverlay onClick={onClose}>
            <S.ModalBox onClick={(e) => e.stopPropagation()}>
                <S.ModalIcon>
                    <img src={Warning} alt="경고" />
                </S.ModalIcon>
                <S.ModalTitle>
                    {title}
                </S.ModalTitle>

                <S.ModalDescription>
                    {description}
                </S.ModalDescription>

                <S.ModalButton onClick={onClose}>
                    확인
                </S.ModalButton>
            </S.ModalBox>
        </S.ModalOverlay>
    );
}

export default RoutineModal;
