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
        <span>STEP 1</span>
        <span>STEP 2</span>
        <span>STEP 3</span>
        <span>STEP 4</span>
      </Steps>
    </ProgressSection>
  );
};

export default ProgressBar;