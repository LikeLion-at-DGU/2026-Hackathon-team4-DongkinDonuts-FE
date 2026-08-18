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
import StreamLineIcon from "../../assets/icons/streamLine.svg";

const SessionEndModal = ({ isMissionComplete, isTerminated, resetGame, onClose, onConfirmNext, }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  if (!isMissionComplete && !isTerminated) return null;

  return (
    <>
      {isMissionComplete && !isTerminated && (
        <ModalOverlay>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <img src={StreamLineIcon} />
            <ModalTitle>
              이번 세션을 완료했어요<br />
              다음 루틴으로 이어갈까요?
            </ModalTitle>
            <ModalDescription>지금 바로 다음 루틴을 시작할 수 있어요.</ModalDescription>
            <ModalButtons>
              <CloseButton onClick={handleGoHome}>
                취소
              </CloseButton>
              <ConfirmButton>
                확인
              </ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default SessionEndModal;