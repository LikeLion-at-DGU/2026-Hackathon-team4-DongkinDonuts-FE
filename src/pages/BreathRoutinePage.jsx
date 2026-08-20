import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreathPlayArea from "../components/sessions/BreathPlayArea";
import {
  BrainResetFeedbackModal,
  NextRestScheduledModal,
  NextRestSetupModal,
} from "../components/sessions/BrainResetPostSessionModals";
import { getNextResetTime } from "../api/plans";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import SessionPage from "./SessionPage";

const BREATH_PHASES = [
  { key: "INHALE", duration: 4 },
  { key: "HOLD", duration: 2 },
  { key: "EXHALE", duration: 6 },
];

const CYCLE_DURATION = BREATH_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
const TOTAL_DURATION = CYCLE_DURATION * 2;
const BREATH_MISSION = { title: "호흡 루틴", type: "BREATH" };

const getPhase = (cycleTime) => {
  let elapsed = cycleTime;

  for (let index = 0; index < BREATH_PHASES.length; index += 1) {
    const phase = BREATH_PHASES[index];
    if (elapsed < phase.duration) {
      return index;
    }
    elapsed -= phase.duration;
  }

  return 0;
};

const BreathRoutinePage = () => {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedInCycle, setElapsedInCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  const [postSessionStep, setPostSessionStep] = useState(null);
  const [shouldCheckNextRest, setShouldCheckNextRest] = useState(false);
  const startedAtRef = useRef(null);
  const hasStartedPostSessionFlowRef = useRef(false);

  const phaseDurations = useMemo(
    () => BREATH_PHASES.map(({ duration }) => duration),
    []
  );

  useEffect(() => {
    if (isTerminated || isMissionComplete) return undefined;

    startedAtRef.current ??= performance.now();

    const timer = window.setInterval(() => {
      const elapsed = Math.min(
        TOTAL_DURATION,
        (performance.now() - startedAtRef.current) / 1000
      );
      const wholeSeconds = Math.floor(elapsed);
      const cycleTime = elapsed % CYCLE_DURATION;
      const nextPhaseIndex = getPhase(Math.floor(cycleTime));

      setElapsedTime((previous) => previous === wholeSeconds ? previous : wholeSeconds);
      setElapsedInCycle(cycleTime);
      setPhaseIndex((previous) => previous === nextPhaseIndex ? previous : nextPhaseIndex);

      if (elapsed >= TOTAL_DURATION) {
        setIsMissionComplete(true);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [isTerminated, isMissionComplete]);

  const handleStopGame = useCallback(() => {
    setIsQuitModalOpen(true);
  }, []);

  const handleConfirmQuit = useCallback(() => {
    setIsQuitModalOpen(false);
    setIsTerminated(true);
  }, []);

  const handleCloseQuit = useCallback(() => {
    setIsQuitModalOpen(false);
  }, []);

  const resetGame = useCallback(() => {
    startedAtRef.current = performance.now();
    hasStartedPostSessionFlowRef.current = false;
    setIsQuitModalOpen(false);
    setIsTerminated(false);
    setIsMissionComplete(false);
    setPostSessionStep(null);
    setShouldCheckNextRest(false);
    setElapsedTime(0);
    setElapsedInCycle(0);
    setPhaseIndex(0);
  }, []);

  const phase = useMemo(() => BREATH_PHASES[phaseIndex].key, [phaseIndex]);
  const isUIOverlayVisible = !isTerminated;
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      phase,
    },
  });

  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : "/";

  useEffect(() => {
    if (
      !isMissionComplete ||
      isTerminated ||
      hasStartedPostSessionFlowRef.current
    ) {
      return;
    }

    hasStartedPostSessionFlowRef.current = true;
    setPostSessionStep("feedback");
  }, [isMissionComplete, isTerminated]);

  useEffect(() => {
    if (!shouldCheckNextRest || recoverySession.isPreparingNextSession) {
      return;
    }

    let isMounted = true;

    const checkNextRest = async () => {
      try {
        const nextReset = await getNextResetTime();

        if (isMounted) {
          setPostSessionStep(nextReset ? "scheduled" : "setup");
        }
      } catch (error) {
        console.error("다음 휴식 알림 조회 실패:", error);

        if (isMounted) {
          setPostSessionStep("setup");
        }
      }
    };

    checkNextRest();

    return () => {
      isMounted = false;
    };
  }, [recoverySession.isPreparingNextSession, shouldCheckNextRest]);

  const handleFeedbackComplete = useCallback(() => {
    setPostSessionStep("checking");
    setShouldCheckNextRest(true);
  }, []);

  const handleFinishPostSessionFlow = useCallback(() => {
    navigate("/", {
      state: {
        skipSetup: true,
      },
    });
  }, [navigate]);

  const dataPanelProps = useMemo(() => ({ elapsedTime, sessionStage: "finish" }), [elapsedTime]);
  const instructionProps = useMemo(
    () => ({ mission: BREATH_MISSION, phase }),
    [phase]
  );
  const progressProps = useMemo(
    () => ({ phases: phaseDurations, elapsedInCycle }),
    [phaseDurations, elapsedInCycle]
  );

  return (
    <>
      <SessionPage
        isQuitModalOpen={isQuitModalOpen}
        onCloseQuit={handleCloseQuit}
        onConfirmQuit={() => {
          recoverySession.abortSession();
          handleConfirmQuit();
        }}
        isMissionComplete={isMissionComplete}
        isTerminated={isTerminated}
        resetSession={resetGame}
        onStopSession={handleStopGame}
        nextSessionPath={nextSessionPath}
        isNextSessionPending={recoverySession.isPreparingNextSession}
        remainingSessionsCount={recoverySession.remainingSessionsCount}
        showCompletionModal={false}
        showNextSessionControl={false}
        showOverlay={isUIOverlayVisible}
        dataPanelProps={dataPanelProps}
        instructionProps={instructionProps}
        progressProps={progressProps}
      >
        <BreathPlayArea />
      </SessionPage>

      {postSessionStep === "feedback" && (
        <BrainResetFeedbackModal
          slotId={recoverySession.slotId}
          onComplete={handleFeedbackComplete}
        />
      )}

      {postSessionStep === "scheduled" && (
        <NextRestScheduledModal
          onConfirm={handleFinishPostSessionFlow}
        />
      )}

      {postSessionStep === "setup" && (
        <NextRestSetupModal
          onClose={handleFinishPostSessionFlow}
          onComplete={handleFinishPostSessionFlow}
        />
      )}
    </>
  );
};

export default BreathRoutinePage;
