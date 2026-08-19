import { memo } from "react";
import {
  ControlArea,
  StopButton,
  ResetButton,
} from "./SessionControls.styled";

const SessionControls = ({ handleStopGame, nextSession, }) => {
  return (
    <ControlArea>
      <StopButton onClick={handleStopGame}>종료</StopButton>
      <ResetButton onClick={nextSession}>다음 세션</ResetButton>
    </ControlArea>
  );
};

export default memo(SessionControls);
