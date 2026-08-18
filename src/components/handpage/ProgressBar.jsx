import React from "react";
import {
  ProgressSection,
  ProgressBarContainer,
  ProgressFill,
  Steps,
} from "./ProgressBar.styled";

const ProgressBar = ({ missionType, sequenceIndex, missionProgress }) => {
  const progressPercent = ((missionType === "SEQUENCE" ? sequenceIndex : missionProgress) / 3) * 100;

  return (
    <ProgressSection>
      <ProgressBarContainer>
        <ProgressFill style={{ width: `${progressPercent}%` }} />
      </ProgressBarContainer>
      <Steps>
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </Steps>
    </ProgressSection>
  );
};

export default ProgressBar;