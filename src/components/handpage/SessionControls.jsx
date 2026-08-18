import React from "react";
import {
  ControlArea,
  StopButton,
  ResetButton,
} from "./SessionControls.styled";

const SessionControls = ({ handleStopGame, resetGame, isTerminated }) => {
  return (
    <ControlArea>
      <StopButton onClick={handleStopGame}>종료</StopButton>
      <ResetButton onClick={resetGame} disabled={isTerminated}>
        초기화
      </ResetButton>
    </ControlArea>
  );
};

export default SessionControls;