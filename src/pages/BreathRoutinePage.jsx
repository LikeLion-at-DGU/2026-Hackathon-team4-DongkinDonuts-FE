import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BreathPlayArea from "../components/sessions/BreathPlayArea";
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedInCycle, setElapsedInCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  const startedAtRef = useRef(null);

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
    setIsQuitModalOpen(false);
    setIsTerminated(false);
    setIsMissionComplete(false);
    setElapsedTime(0);
    setElapsedInCycle(0);
    setPhaseIndex(0);
  }, []);

  const phase = useMemo(() => BREATH_PHASES[phaseIndex].key, [phaseIndex]);
  const isUIOverlayVisible = !isMissionComplete && !isTerminated;

  return (
    <SessionPage
      isQuitModalOpen={isQuitModalOpen}
      onCloseQuit={handleCloseQuit}
      onConfirmQuit={handleConfirmQuit}
      navigateOnQuitConfirm={false}
      isMissionComplete={isMissionComplete}
      isTerminated={isTerminated}
      resetSession={resetGame}
      onStopSession={handleStopGame}
      showOverlay={isUIOverlayVisible}
      dataPanelProps={{ elapsedTime }}
      instructionProps={{ mission: BREATH_MISSION, phase }}
      progressProps={{
        phases: phaseDurations,
        elapsedInCycle,
      }}
    >
      <BreathPlayArea />
    </SessionPage>
  );
};

export default BreathRoutinePage;
