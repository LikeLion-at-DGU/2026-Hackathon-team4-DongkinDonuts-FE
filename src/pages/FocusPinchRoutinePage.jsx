import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawPinchRings } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["focus-pinch"];

const randomTargetSize = () => Math.round(10 + Math.random() * 80); // 10~90%
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function FocusPinchRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const matchSinceRef = useRef(null);

  const [pinchCount, setPinchCount] = useState(0);
  const [targetSize, setTargetSize] = useState(randomTargetSize);
  const [handCount, setHandCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = 3;
  const isMissionComplete = pinchCount >= targetCount;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("HAND", { paused: isMissionComplete || isQuitModalOpen });

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  // 각 손의 엄지-검지 핀치 거리를 링 크기(%)로 변환, 두 손 모두 목표 크기에 맞춰 2초 유지하면 성공
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const hands = data?.hands ?? [];
      setHandCount(hands.length);

      const { pinchDistMin, pinchDistMax, pinchMatchTolerancePercent, pinchHoldMs } = TRACKING_CONFIG;
      const rings = hands.map((hand) => ({
        x: hand.palmCenter.x,
        y: hand.palmCenter.y,
        sizePercent: clamp(((hand.pinchDist - pinchDistMin) / (pinchDistMax - pinchDistMin)) * 100, 0, 100),
      }));

      const allMatched =
        rings.length > 0 &&
        rings.every((ring) => Math.abs(ring.sizePercent - targetSize) <= pinchMatchTolerancePercent);

      let holdProgress = 0;
      if (!isMissionComplete) {
        if (allMatched) {
          if (matchSinceRef.current == null) matchSinceRef.current = t;
          const heldMs = t - matchSinceRef.current;
          holdProgress = Math.min(1, heldMs / pinchHoldMs);
          if (heldMs >= pinchHoldMs) {
            matchSinceRef.current = null;
            setPinchCount((prev) => Math.min(prev + 1, targetCount));
            setTargetSize(randomTargetSize());
          }
        } else {
          matchSinceRef.current = null;
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
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, targetSize]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    setPinchCount(0);
    setTargetSize(randomTargetSize());
    setElapsedTime(0);
    matchSinceRef.current = null;
    setIsTerminated(false);
  }, []);
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      pinchCount,
      elapsedTime,
    },
  });
  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : SESSION.nextSessionPath;

  const handleCloseQuit = useCallback(() => setIsQuitModalOpen(false), []);
  const handleConfirmQuit = useCallback(() => {
    recoverySession.abortSession();
    navigate("/");
  }, [navigate, recoverySession]);
  const handleStopSession = useCallback(() => setIsQuitModalOpen(true), []);

  const cameraPreviewProps = useMemo(
    () => ({ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated }),
    [videoRef, cameraReady, isTerminated]
  );
  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount: pinchCount, handCount }),
    [elapsedTime, pinchCount, handCount]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub: `${SESSION.guideText} (목표 ${targetSize}%)`,
    }),
    [targetSize]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (pinchCount / targetCount) * 100 }),
    [pinchCount]
  );

  return (
    <SessionPage
      isQuitModalOpen={isQuitModalOpen}
      onCloseQuit={handleCloseQuit}
      onConfirmQuit={handleConfirmQuit}
      isMissionComplete={isMissionComplete}
      isTerminated={isTerminated}
      resetSession={handleReset}
      onStopSession={handleStopSession}
      nextSessionPath={nextSessionPath}
      isNextSessionPending={recoverySession.isPreparingNextSession}
      cameraPreviewProps={cameraPreviewProps}
      dataPanelProps={dataPanelProps}
      instructionProps={instructionProps}
      progressProps={progressProps}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}
