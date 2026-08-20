import { memo } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../common/SessionConfirmModal.styled";
import WarningIcon from "../../assets/icons/Warning.svg";

const QuitConfirmModal = ({ isOpen, onClose, onConfirm, navigateOnConfirm = true, remainingCount = 0 }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    if (navigateOnConfirm) navigate("/");
  };

  return (
    <S.Overlay>
      <S.Modal onClick={(event) => event.stopPropagation()}>
        <S.CheckIcon>
          <img src={WarningIcon} alt="종료 경고 아이콘" />
        </S.CheckIcon>
        <S.Title>{remainingCount}개 세션이 남아있어요.<br />정말 종료할까요?</S.Title>
        <S.Description>지금까지 완료한 세션은 저장되어 있어요</S.Description>
        <S.ButtonRow>
          <S.CancelButton onClick={onClose}>취소</S.CancelButton>
          <S.StartButton onClick={handleConfirm}>종료</S.StartButton>
        </S.ButtonRow>
      </S.Modal>
    </S.Overlay>
  );
};

export default memo(QuitConfirmModal);
