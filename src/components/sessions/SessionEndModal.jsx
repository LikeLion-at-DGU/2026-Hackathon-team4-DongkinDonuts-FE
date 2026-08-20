import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ModalOverlay, ModalContent, ModalTitle, ModalDescription, ModalButtons, CloseButton, ConfirmButton } from "./Modal.styled";
import StreamLineIcon from "../../assets/icons/streamLine.svg";
import SetupModal from "../common/SetupModal";

const SessionEndModal = ({
  isMissionComplete,
  isTerminated,
  onClose,
  onRestart,
  nextSessionPath,
}) => {
  const navigate = useNavigate();

  if (!isMissionComplete && !isTerminated) return null;

  const finished = isMissionComplete && !isTerminated;

  if (finished && !nextSessionPath) {
    return <SetupModal mode="complete" onClose={onClose} />;
  }

  const handleConfirm = () => {
    if (finished) {
      if (nextSessionPath) {
        navigate(nextSessionPath);
        return;
      }
    }
    onRestart?.();
  };

  return (
    <ModalOverlay>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <img src={StreamLineIcon} alt="세션 완료 아이콘" width={77} />
        <ModalTitle>이번 세션을 완료했어요<br />다음 세션으로 이어갈까요?</ModalTitle>
        <ModalDescription>지금 바로 다음 루틴을 시작할 수 있어요.</ModalDescription>
        <ModalButtons>
          <CloseButton onClick={onClose}>취소</CloseButton>
          <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default memo(SessionEndModal);
