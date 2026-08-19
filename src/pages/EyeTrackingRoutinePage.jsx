import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawInfinityPath } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["eye-tracking"];

const PATH_LOOP_MS = 12000;
const PROGRESS_STEP = 0.6;

// 렘니스케이트(∞) 궤적 위 목표 지점을 중심(0,0) 기준 편차로 반환
const getInfinityTarget = (elapsedMs) => {
  const t = ((elapsedMs % PATH_LOOP_MS) / PATH_LOOP_MS) * Math.PI * 2;
  const denom = 1 + Math.sin(t) * Math.sin(t);
  return { x: Math.cos(t) / denom, y: (Math.sin(t) * Math.cos(t)) / denom };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function EyeTrackingRoutinePage() {
  const navigate = useNavigate();
  const previewCanvasRef = useRef(null);
  const startTimeRef = useRef(null);

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

      if (data?.gaze) {
        if (startTimeRef.current == null) startTimeRef.current = t;
        const target = getInfinityTarget(t - startTimeRef.current);

        const gaze = {
          x: clamp((data.gaze.x - 0.5) * TRACKING_CONFIG.gazeSensitivity, -1, 1),
          y: clamp((data.gaze.y - 0.5) * TRACKING_CONFIG.gazeSensitivity, -1, 1),
        };
        const trackingError = Math.hypot(gaze.x - target.x, gaze.y - target.y);
        const onTarget = trackingError < TRACKING_CONFIG.gazeTolerance;

        if (onTarget && !isMissionComplete) {
          setProgress((prev) => Math.min(prev + PROGRESS_STEP, 100));
        }

        const prepared = prepareCanvas(previewCanvasRef.current);
        if (prepared) {
          drawInfinityPath(prepared.ctx, prepared.width, prepared.height, { target, gaze, onTarget });
        }
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
    startTimeRef.current = null;
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
      dataPanelProps={{ elapsedTime, successCount: isMissionComplete ? 1 : 0 }}
      instructionProps={{ missionText: SESSION.title, instructionSub: SESSION.guideText }}
      progressProps={{ progressPercent: progress }}
    />
  );
}
