import React from "react";
import {
  ModalOverlay,
  ModalContent,
  ModalIcon,
  ModalTitle,
  ModalDescription,
  ModalButtons,
  CloseButton,
  ConfirmButton,
} from "./QuitConfirmModal.styled";

const QuitConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      {/* modal-content 내부 클릭 시 모달이 닫히지 않도록 이벤트 전파 막기 */}
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalIcon>!</ModalIcon>
        <ModalTitle>
          지금 종료하면<br />다음 세션으로 넘어갈 수 없어요
        </ModalTitle>
        <ModalDescription>모든 단계를 완료해주세요</ModalDescription>
        <ModalButtons>
          <CloseButton onClick={onClose}>
            닫기
          </CloseButton>
          <ConfirmButton onClick={onConfirm}>
            종료
          </ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QuitConfirmModal;