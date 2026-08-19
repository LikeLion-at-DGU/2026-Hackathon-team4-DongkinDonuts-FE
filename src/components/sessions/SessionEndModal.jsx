import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ModalOverlay, ModalContent, ModalTitle, ModalDescription, ModalButtons, CloseButton, ConfirmButton } from "./Modal.styled";
import StreamLineIcon from "../../assets/icons/streamLine.svg";

const SessionEndModal = ({ isMissionComplete, isTerminated, resetGame }) => {
  const navigate = useNavigate();
  if (!isMissionComplete && !isTerminated) return null;
  const finished = isMissionComplete && !isTerminated;

  return (
    <ModalOverlay>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <img src={StreamLineIcon} alt="세션 완료 아이콘" width={77} />
        <ModalTitle>{finished ? <>이번 세션을 완료했어요<br />다음 세션으로 이어갈까요?</> : "세션이 종료됐어요"}</ModalTitle>
        <ModalDescription>{finished ? "지금 바로 다음 루틴을 시작할 수 있어요." : "지금 상태를 초기화하고 다시 시작할 수 있어요."}</ModalDescription>
        <ModalButtons>
          <CloseButton onClick={() => navigate("/")}>홈으로</CloseButton>
          <ConfirmButton onClick={resetGame}>{finished ? "확인" : "다시 시작"}</ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default memo(SessionEndModal);
