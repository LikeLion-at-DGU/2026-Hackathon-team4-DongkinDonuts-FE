import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ModalOverlay, ModalContent, ModalTitle, ModalDescription, ModalButtons, CloseButton, ConfirmButton } from "./Modal.styled";
import StreamLineIcon from "../../assets/icons/streamLine.svg";
import { SKIP_SETUP_HOME_STATE } from "../../utils/initialSetupState";

const SessionEndModal = ({
  isMissionComplete,
  isTerminated,
  onClose,
  onRestart,
  nextSessionPath,
  isNextSessionPending = false,
}) => {
  const navigate = useNavigate();

  if (!isMissionComplete && !isTerminated) return null;

  const finished = isMissionComplete && !isTerminated;
  const isFinalSession = finished && nextSessionPath === "/";

  const handleConfirm = () => {
    if (isNextSessionPending) return;

    if (finished) {
      if (nextSessionPath) {
        navigate(
          nextSessionPath,
          nextSessionPath === "/"
            ? { state: SKIP_SETUP_HOME_STATE }
            : undefined
        );
        return;
      }

      navigate("/recovery-session");
      return;
    }

    onRestart?.();
  };

  return (
    <ModalOverlay>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <img src={StreamLineIcon} alt="세션 완료 아이콘" width={77} />
        <ModalTitle>
          {isFinalSession
            ? <>회복 세션을 모두 완료했어요.<br />홈으로 돌아갈까요?</>
            : finished
              ? <>이번 세션을 완료했어요.<br />다음 세션으로 이어갈까요?</>
              : "세션이 종료됐어요."}
        </ModalTitle>
        <ModalDescription>
          {isFinalSession
            ? "오늘의 흐름에 맞춘 루틴을 마쳤어요."
            : finished
              ? "지금 바로 다음 루틴을 시작할 수 있어요."
              : "지금 상태를 초기화하고 다시 시작할 수 있어요."}
        </ModalDescription>
        <ModalButtons>
          <CloseButton onClick={finished ? onClose : () => navigate("/", { state: SKIP_SETUP_HOME_STATE })}>
            {finished ? "취소" : "홈으로"}
          </CloseButton>
          <ConfirmButton
            onClick={handleConfirm}
            disabled={isNextSessionPending}
          >
            {isNextSessionPending
              ? "저장 중..."
              : isFinalSession
                ? "홈으로"
                : finished
                  ? "확인"
                  : "다시 시작"}
          </ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default memo(SessionEndModal);
