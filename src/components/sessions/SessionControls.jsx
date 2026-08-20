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
}) => {
  return (
    <ControlArea>
      <StopButton onClick={handleStopGame}>종료</StopButton>
      {showNextSession && (
        <ResetButton onClick={nextSession}>다음 세션</ResetButton>
      )}
    </ControlArea>
  );
};

export default memo(SessionControls);
