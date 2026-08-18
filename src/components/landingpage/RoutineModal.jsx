import * as S from "./RoutineModal.styled";

function RoutineModal({ onClose }) {
    return (
        <S.ModalOverlay onClick={onClose}>
            <S.ModalBox onClick={(e) => e.stopPropagation()}>
                <S.ModalIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="71" height="71" viewBox="0 0 71 71" fill="none">
                        <path d="M35.4106 0C15.8533 0 0 15.8533 0 35.4106C0 54.9679 15.8533 70.8213 35.4106 70.8213C54.9679 70.8213 70.8213 54.9679 70.8213 35.4106C70.8213 15.8533 54.9679 0 35.4106 0ZM38.9517 53.1159H31.8696V46.0338H38.9517V53.1159ZM38.9517 38.9517H31.8696L30.099 17.7053H40.7222L38.9517 38.9517Z" fill="#D0D0D0" />
                    </svg>
                </S.ModalIcon>

                <S.ModalTitle>
                    이전 루틴을
                    <br />
                    먼저 완료해주세요
                </S.ModalTitle>

                <S.ModalDescription>
                    이전 루틴을 완료한 후 이용해주세요
                </S.ModalDescription>

                <S.ModalButton onClick={onClose}>
                    확인
                </S.ModalButton>
            </S.ModalBox>
        </S.ModalOverlay>
    );
}

export default RoutineModal;