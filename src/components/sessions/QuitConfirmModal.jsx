import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ModalOverlay, ModalContent, ModalTitle, ModalDescription, ModalButtons, CloseButton, ConfirmButton } from "./Modal.styled";
import WarningIcon from "../../assets/icons/Warning.svg";
import { SKIP_SETUP_HOME_STATE } from "../../utils/initialSetupState";

const QuitConfirmModal = ({ isOpen, onClose, onConfirm, navigateOnConfirm = true, remainingCount = 0 }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    if (navigateOnConfirm) navigate("/", { state: SKIP_SETUP_HOME_STATE });
  };

  return (
    <ModalOverlay>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <img src={WarningIcon} alt="종료 경고 아이콘" width={70} />
        <ModalTitle>{remainingCount}개 세션이 남아있어요.<br />정말 종료할까요?</ModalTitle>
        <ModalDescription>지금까지 완료한 세션은 저장되어 있어요</ModalDescription>
        <ModalButtons>
          <CloseButton onClick={onClose}>취소</CloseButton>
          <ConfirmButton onClick={handleConfirm}>종료</ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default memo(QuitConfirmModal);
