import React from "react";
import {
  MissionCompleteOverlay,
  MissionCompleteButton,
  TerminatedOverlay,
} from "./SessionOverlay.styled";

const SessionOverlay = ({ isMissionComplete, isTerminated, resetGame }) => {
  return (
    <>
      {isMissionComplete && !isTerminated && (
        <MissionCompleteOverlay>
          <h2>미션 완료</h2>
          <MissionCompleteButton onClick={resetGame}>
            방금 한 미션 다시 하기
          </MissionCompleteButton>
        </MissionCompleteOverlay>
      )}

      {isTerminated && (
        <TerminatedOverlay>
          <h2>종료되었습니다</h2>
          <p>수고하셨습니다!</p>
        </TerminatedOverlay>
      )}
    </>
  );
};

export default SessionOverlay;