import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";

const SESSION = ROUTINE_SESSIONS["focus-pinch"];

export default function FocusPinchRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const wasPinchingRef = useRef(false);

  const [pinchCount, setPinchCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = 3;
  const isMissionComplete = pinchCount >= targetCount;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("HAND");

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const isPinching = !!data?.isPinching;
      if (isPinching && !wasPinchingRef.current && !isMissionComplete) {
        setPinchCount((prev) => Math.min(prev + 1, targetCount));
      }
      wasPinchingRef.current = isPinching;
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
    setPinchCount(0);
    setElapsedTime(0);
    wasPinchingRef.current = false;
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
      cameraPreviewProps={{ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated }}
      dataPanelProps={{ elapsedTime, successCount: pinchCount }}
      instructionProps={{ missionText: SESSION.title, instructionSub: SESSION.guideText }}
      progressProps={{ progressPercent: (pinchCount / targetCount) * 100 }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}