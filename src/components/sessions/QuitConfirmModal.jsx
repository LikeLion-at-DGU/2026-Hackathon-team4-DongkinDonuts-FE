import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ModalOverlay, ModalContent, ModalTitle, ModalDescription, ModalButtons, CloseButton, ConfirmButton } from "./Modal.styled";
import WarningIcon from "../../assets/icons/Warning.svg";

const QuitConfirmModal = ({ isOpen, onClose, onConfirm, navigateOnConfirm = true }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    if (navigateOnConfirm) navigate("/", { state: { skipSetup: true } });
  };

  return (
    <ModalOverlay>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <img src={WarningIcon} alt="종료 경고 아이콘" width={70} />
        <ModalTitle>지금 종료하면<br />다음 세션으로 넘어갈 수 없어요</ModalTitle>
        <ModalDescription>모든 단계를 완료해주세요</ModalDescription>
        <ModalButtons>
          <CloseButton onClick={onClose}>취소</CloseButton>
          <ConfirmButton onClick={handleConfirm}>종료</ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default memo(QuitConfirmModal);
