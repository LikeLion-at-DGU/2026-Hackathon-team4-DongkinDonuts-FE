import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useCameraRoutineSession } from "../hooks/useCameraRoutineSession";
import { ROUTINE_SESSIONS, sessionIdFor, remainingSessionsAfter, customSessionStepInfo } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { prepareCanvas, drawPinchRings } from "../engine/sessionVisuals";
import handImage from "../assets/images/handImage.png";

const BASE_ID = "focus-pinch";

const MIN_TARGET_SIZE_DIFF = 20;

// 이전 목표 크기와 최소 20%p 이상 차이나는 새 목표 크기를 뽑는다 (10~90%)
const randomTargetSize = (prevSize) => {
  let next;
  do {
    next = Math.round(10 + Math.random() * 80);
  } while (prevSize != null && Math.abs(next - prevSize) < MIN_TARGET_SIZE_DIFF);
  return next;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function FocusPinchRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  const canvasRef = useRef(null);
  const holdMsRef = useRef(0);
  const lastFrameTimeRef = useRef(null);

  const [pinchCount, setPinchCount] = useState(0);
  const [targetSize, setTargetSize] = useState(randomTargetSize);

  const targetCount = LEVEL.targetCount;
  const isMissionComplete = pinchCount >= targetCount;

  const {
    cameraReady,
    screenDistance,
    detectFrame,
    elapsedTime,
    isQuitModalOpen,
    isTerminated,
    setIsTerminated,
    handleCloseQuit,
    handleConfirmQuit,
    handleStopSession,
    cameraPreviewProps,
  } = useCameraRoutineSession({ trackingType: "HAND", isMissionComplete });

  // 각 손의 다섯 손가락 끝이 만드는 원 크기를 링 크기(%)로 변환, 두 손 모두 목표 크기에 맞춰 2초 유지하면 성공
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const hands = data?.hands ?? [];

      const { pinchDistMin, pinchDistMax } = TRACKING_CONFIG;
      const { pinchMatchTolerancePercent, pinchHoldMs } = LEVEL;
      const rings = hands.map((hand) => ({
        x: hand.palmCenter.x,
        y: hand.palmCenter.y,
        sizePercent: clamp(((hand.pinchDist - pinchDistMin) / (pinchDistMax - pinchDistMin)) * 100, 0, 100),
      }));

      const allMatched =
        rings.length > 0 &&
        rings.every((ring) => Math.abs(ring.sizePercent - targetSize) <= pinchMatchTolerancePercent);

      const dt = lastFrameTimeRef.current == null ? 0 : t - lastFrameTimeRef.current;
      lastFrameTimeRef.current = t;

      let holdProgress = 0;
      if (!isMissionComplete) {
        // 정확도를 벗어나도 바로 초기화하지 않고 서서히 감소시키며, 다시 정확해지면 그 지점부터 이어서 채운다
        holdMsRef.current = clamp(holdMsRef.current + (allMatched ? dt : -dt), 0, pinchHoldMs);
        holdProgress = holdMsRef.current / pinchHoldMs;
        if (holdMsRef.current >= pinchHoldMs) {
          holdMsRef.current = 0;
          setPinchCount((prev) => Math.min(prev + 1, targetCount));
          setTargetSize((prev) => randomTargetSize(prev));
        }
      }

      const prepared = prepareCanvas(canvasRef.current);
      if (prepared) {
        drawPinchRings(prepared.ctx, prepared.width, prepared.height, {
          rings,
          targetSizePercent: targetSize,
          matched: allMatched,
          holdProgress,
        });
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      lastFrameTimeRef.current = null;
    };
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, targetSize, LEVEL]);

  const handleReset = useCallback(() => {
    setPinchCount(0);
    setTargetSize((prev) => randomTargetSize(prev));
    holdMsRef.current = 0;
    lastFrameTimeRef.current = null;
    setIsTerminated(false);
  }, []);

  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount: pinchCount, difficulty, screenDistance, sessionImage: handImage, sessionStage: "custom", stepInfo: customSessionStepInfo(BASE_ID) }),
    [elapsedTime, pinchCount, difficulty, screenDistance]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub: SESSION.guideText,
    }),
    [targetSize]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (pinchCount / targetCount) * 100, current: pinchCount, total: targetCount }),
    [pinchCount]
  );
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      pinchCount,
      targetSize,
      difficulty,
    },
    localRemainingCount: remainingSessionsAfter(BASE_ID),
  });
  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : SESSION.nextSessionPath;

  return (
    <SessionPage
      isQuitModalOpen={isQuitModalOpen}
      onCloseQuit={handleCloseQuit}
      onConfirmQuit={() => {
        recoverySession.abortSession();
        handleConfirmQuit();
      }}
      isMissionComplete={isMissionComplete}
      isTerminated={isTerminated}
      resetSession={handleReset}
      onStopSession={handleStopSession}
      nextSessionPath={nextSessionPath}
      isNextSessionPending={recoverySession.isPreparingNextSession}
      remainingSessionsCount={recoverySession.remainingSessionsCount}
      cameraPreviewProps={cameraPreviewProps}
      dataPanelProps={dataPanelProps}
      instructionProps={instructionProps}
      progressProps={progressProps}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}
