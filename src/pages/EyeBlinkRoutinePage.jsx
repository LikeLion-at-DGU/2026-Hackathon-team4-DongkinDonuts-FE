import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawEyeFog } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["eye-blink"];
const FOG_RECOVER_STEP = 0.05;

export default function EyeBlinkRoutinePage() {
  const navigate = useNavigate();
  const previewCanvasRef = useRef(null);
  const closedSinceRef = useRef(null);
  const countedRef = useRef(false);
  const fogClearRef = useRef(0);

  const [blinkCount, setBlinkCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = 5;
  const isMissionComplete = blinkCount >= targetCount;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("FACE_EYE");

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const isBlinking = !!data?.isBlinking;

      if (isBlinking) {
        if (closedSinceRef.current == null) closedSinceRef.current = t;
        const heldMs = t - closedSinceRef.current;
        fogClearRef.current = Math.min(1, heldMs / TRACKING_CONFIG.blinkHoldMs);
        if (heldMs >= TRACKING_CONFIG.blinkHoldMs && !countedRef.current && !isMissionComplete) {
          countedRef.current = true;
          setBlinkCount((prev) => Math.min(prev + 1, targetCount));
        }
      } else {
        closedSinceRef.current = null;
        countedRef.current = false;
        fogClearRef.current = Math.max(0, fogClearRef.current - FOG_RECOVER_STEP);
      }

      const prepared = prepareCanvas(previewCanvasRef.current);
      if (prepared) {
        drawEyeFog(prepared.ctx, prepared.width, prepared.height, { fogClear: fogClearRef.current });
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, detectFrame]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    setBlinkCount(0);
    setElapsedTime(0);
    closedSinceRef.current = null;
    countedRef.current = false;
    fogClearRef.current = 0;
    setIsTerminated(false);
  }, []);

  return (
    <SessionPage
      isQuitModalOpen={isQuitModalOpen}
      onCloseQuit={() => setIsQuitModalOpen(false)}
      onConfirmQuit={() => navigate("/")}
      isMissionComplete={isMissionComplete}
      isTerminated={isTerminated}
      resetSession={handleReset}
      onStopSession={() => setIsQuitModalOpen(true)}
      nextSessionPath={SESSION.nextSessionPath}
      cameraPreviewProps={{ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated, fullBleed: true }}
      dataPanelProps={{ elapsedTime, successCount: blinkCount }}
      instructionProps={{ missionText: SESSION.title, instructionSub: SESSION.guideText }}
      progressProps={{ progressPercent: (blinkCount / targetCount) * 100 }}
    />
  );
}
