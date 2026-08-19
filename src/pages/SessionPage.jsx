import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraPreview from "../components/sessions/CameraPreview";
import SessionDataPanel from "../components/sessions/SessionDataPanel";
import SessionEndModal from "../components/sessions/SessionEndModal";
import SessionControls from "../components/sessions/SessionControls";
import MissionInstruction from "../components/sessions/MissionInstruction";
import ProgressBar from "../components/sessions/ProgressBar";
import QuitConfirmModal from "../components/sessions/QuitConfirmModal";
import {
  HandRoutineGlobalStyle,
  RoutineContainer,
  ContentWrapper,
  PlayContainer,
  ControlsWrapper,
  PlayArea,
} from "./HandRoutinePage.styled";

const SessionPage = ({
  isQuitModalOpen,
  onCloseQuit,
  onConfirmQuit,
  navigateOnQuitConfirm = true,
  isMissionComplete,
  isTerminated,
  resetSession,
  onStopSession,
  onCloseSessionEnd,
  nextSessionPath,
  showOverlay = true,
  cameraPreviewProps,
  dataPanelProps,
  instructionProps,
  progressProps,
  children,
}) => {
  const navigate = useNavigate();
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  const handleNextSession = useCallback(() => {
    if (nextSessionPath) navigate(nextSessionPath);
  }, [navigate, nextSessionPath]);

  useEffect(() => {
    if (!isMissionComplete || isTerminated || !hasShownCompletionModal) return;
    resetSession?.();
  }, [hasShownCompletionModal, isMissionComplete, isTerminated, resetSession]);

  const handleCloseSessionEnd = useCallback(() => {
    if (isMissionComplete && !isTerminated) {
      setHasShownCompletionModal(true);
      resetSession?.();
      return;
    }

    onCloseSessionEnd?.();
  }, [isMissionComplete, isTerminated, onCloseSessionEnd, resetSession]);

  const shouldShowCompletionModal = isMissionComplete && !hasShownCompletionModal;

  return (
    <>
      <HandRoutineGlobalStyle />
      <RoutineContainer>
        <QuitConfirmModal
          isOpen={isQuitModalOpen}
          onClose={onCloseQuit}
          onConfirm={onConfirmQuit}
          navigateOnConfirm={navigateOnQuitConfirm}
        />

        <ContentWrapper>
          <PlayContainer>
            <PlayArea>{children}</PlayArea>

            {showOverlay && (
              <>
                {cameraPreviewProps && <CameraPreview {...cameraPreviewProps} />}
                {dataPanelProps && <SessionDataPanel {...dataPanelProps} />}
                {instructionProps && <MissionInstruction {...instructionProps} />}
                {progressProps && <ProgressBar {...progressProps} />}
              </>
            )}

            <SessionEndModal
              isMissionComplete={shouldShowCompletionModal}
              isTerminated={isTerminated}
              onClose={handleCloseSessionEnd}
              onRestart={resetSession}
              nextSessionPath={nextSessionPath}
            />
          </PlayContainer>

          <ControlsWrapper>
            <SessionControls
              handleStopGame={onStopSession}
              nextSession={handleNextSession}
            />
          </ControlsWrapper>
        </ContentWrapper>
      </RoutineContainer>
    </>
  );
};

export default memo(SessionPage);
