import { memo } from "react";
import { ProgressSection, ProgressBarContainer, ProgressFill, StepsRow, StepLabel } from "./ProgressBar.styled";

const ProgressBar = ({
  missionType,
  sequenceIndex = 0,
  missionProgress = 0,
  phases,
  elapsedInCycle = 0,
  progressPercent: progressPercentProp,
  current: currentProp,
  total = 3,
}) => {
  let progressPercent;
  let current = currentProp;

  if (progressPercentProp !== undefined) {
    progressPercent = progressPercentProp;
  } else if (phases?.length) {
    const [inhale, hold, exhale] = phases;
    const total = inhale + hold + exhale;
    const time = Math.max(0, Math.min(elapsedInCycle, total));
    progressPercent = time <= inhale
      ? (time / inhale) * 100
      : time <= inhale + hold
        ? 100
        : (1 - (time - inhale - hold) / exhale) * 100;
  } else {
    current = current ?? (missionType === "SEQUENCE" ? sequenceIndex : missionProgress);
    progressPercent = (current / 3) * 100;
  }

  const clampedPercent = Math.max(0, Math.min(100, progressPercent));

  return (
    <ProgressSection>
      <ProgressBarContainer>
        <ProgressFill style={{ width: `${clampedPercent}%` }} />
      </ProgressBarContainer>
      <StepsRow>
        {!phases?.length &&
          Array.from({ length: total }, (_, i) => {
            const step = i + 1;
            return (
              <StepLabel
                key={step}
                $align={step === total ? "end" : "middle"}
                $active={current != null && step <= current}
                style={{ left: `${(step / total) * 100}%` }}
              >
                {step}회
              </StepLabel>
            );
          })}
      </StepsRow>
    </ProgressSection>
  );
};

export default memo(ProgressBar);
