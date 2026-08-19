import { memo } from "react";
import { ProgressSection, ProgressBarContainer, ProgressFill, Steps } from "./ProgressBar.styled";

const ProgressBar = ({ missionType, sequenceIndex = 0, missionProgress = 0, phases, elapsedInCycle = 0 }) => {
  let progressPercent;

  if (phases?.length) {
    const [inhale, hold, exhale] = phases;
    const total = inhale + hold + exhale;
    const time = Math.max(0, Math.min(elapsedInCycle, total));
    progressPercent = time <= inhale
      ? (time / inhale) * 100
      : time <= inhale + hold
        ? 100
        : (1 - (time - inhale - hold) / exhale) * 100;
  } else {
    progressPercent = ((missionType === "SEQUENCE" ? sequenceIndex : missionProgress) / 3) * 100;
  }

  return (
    <ProgressSection>
      <ProgressBarContainer>
        <ProgressFill style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }} />
      </ProgressBarContainer>
      {!phases?.length && <Steps><span>0%</span><span>50%</span><span>100%</span></Steps>}
    </ProgressSection>
  );
};

export default memo(ProgressBar);
