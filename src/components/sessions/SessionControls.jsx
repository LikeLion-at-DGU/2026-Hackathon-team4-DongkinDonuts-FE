import { memo } from "react";
import {
  ControlArea,
  StopButton,
  ResetButton,
} from "./SessionControls.styled";

const SessionControls = ({
  handleStopGame,
  nextSession,
  showNextSession = true,
  isNextSessionDisabled = false,
}) => {
  return (
    <ControlArea>
      <StopButton onClick={handleStopGame}>종료</StopButton>
      {showNextSession && (
        <ResetButton onClick={nextSession} disabled={isNextSessionDisabled}>
          다음 세션
        </ResetButton>
      )}
    </ControlArea>
  );
};

export default memo(SessionControls);
