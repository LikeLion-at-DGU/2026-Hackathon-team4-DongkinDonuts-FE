import { memo } from "react";
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
  showOverlay = true,
  cameraPreviewProps,
  dataPanelProps,
  instructionProps,
  progressProps,
  children,
}) => {
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
              isMissionComplete={isMissionComplete}
              isTerminated={isTerminated}
              resetGame={resetSession}
            />
          </PlayContainer>

          <ControlsWrapper>
            <SessionControls
              handleStopGame={onStopSession}
              resetGame={resetSession}
              isTerminated={isTerminated}
            />
          </ControlsWrapper>
        </ContentWrapper>
      </RoutineContainer>
    </>
  );
};

export default memo(SessionPage);
