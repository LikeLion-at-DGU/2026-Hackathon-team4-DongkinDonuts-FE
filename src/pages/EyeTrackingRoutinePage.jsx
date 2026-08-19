import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";

const SESSION = ROUTINE_SESSIONS["eye-tracking"];

export default function EyeTrackingRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isMissionComplete = progress >= 100;

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
      if (data?.pupil && !isMissionComplete) {
        setProgress((prev) => Math.min(prev + 0.5, 100));
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
    setProgress(0);
    setElapsedTime(0);
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
      dataPanelProps={{ elapsedTime, successCount: isMissionComplete ? 1 : 0 }}
      instructionProps={{ missionText: SESSION.title, instructionSub: SESSION.guideText }}
      progressProps={{ progressPercent: progress }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}