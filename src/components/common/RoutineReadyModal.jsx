import { useNavigate } from "react-router-dom";

import CheckIcon from "../../assets/icons/CheckIcon.png";

import * as S from "./SessionConfirmModal.styled";

function RoutineReadyModal({
    onClose,
}) {
    const navigate = useNavigate();

    const handleStartSession = () => {
        navigate("/recovery-session");
    };

    return (
        <S.Overlay>
            <S.Modal>
                <S.CheckIcon>
                    <img
                        src={CheckIcon}
                        alt="완료"
                    />
                </S.CheckIcon>

                <S.Title>
                    지금 입력한 상태에 맞는
                    <br />
                    맞춤 휴식 루틴이 준비됐어요
                </S.Title>

                <S.Description>
                    바로 시작할까요?
                </S.Description>

                <S.ButtonRow>
                    <S.CancelButton
                        type="button"
                        onClick={onClose}
                    >
                        취소
                    </S.CancelButton>

                    <S.StartButton
                        type="button"
                        onClick={handleStartSession}
                    >
                        세션 시작
                    </S.StartButton>
                </S.ButtonRow>
            </S.Modal>
        </S.Overlay>
    );
}

export default RoutineReadyModal;