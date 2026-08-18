import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalButtons,
  CloseButton,
  ConfirmButton,
} from "./Modal.styled";
import WarningIcon from "../../assets/icons/Warning.svg";


const QuitConfirmModal = ({ isOpen, onClose, }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <img src={WarningIcon} />
        <ModalTitle>
          지금 종료하면<br />
          다음 세션으로 넘어갈 수 없어요
        </ModalTitle>
        <ModalDescription>모든 단계를 완료해주세요</ModalDescription>
        <ModalButtons>
          <CloseButton onClick={onClose}>
            닫기
          </CloseButton>
          <ConfirmButton onClick={handleGoHome}>
            종료
          </ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QuitConfirmModal;