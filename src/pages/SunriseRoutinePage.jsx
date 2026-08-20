import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawSunrise } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["wakeup-sunrise"];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

export default function SunriseRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const wasMouthOpenRef = useRef(false);
  const riseRef = useRef(0);
  const peakRiseRef = useRef(0);
  const convergingRef = useRef(null);
  const stageRef = useRef("idle");
  const [stage, setStage] = useState("idle"); // idle | rising | ready | converging

  const [sunriseCount, setSunriseCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = 5;
  const isMissionComplete = sunriseCount >= targetCount;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("FACE_EYE", { paused: isMissionComplete || isQuitModalOpen });

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  // 입을 벌린 정도(MAR)를 0~1 상승도로 변환해 부드럽게 보간하며 햇살을 끌어올리고,
  // 충분히 떠오른 상태에서 입을 다물면(닫는 동작) 화면 중앙으로 수렴하는 애니메이션을 시작한다.
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const isMouthOpen = !!data?.isMouthOpen;
      const mouthRatio = data?.mouthRatio ?? 0;

      if (!isMissionComplete && !convergingRef.current) {
        const target = clamp01(
          (mouthRatio - TRACKING_CONFIG.sunriseMouthRatioMin) /
            (TRACKING_CONFIG.sunriseMouthRatioMax - TRACKING_CONFIG.sunriseMouthRatioMin)
        );
        riseRef.current = lerp(riseRef.current, target, TRACKING_CONFIG.sunriseRiseSmoothing);
        if (riseRef.current > peakRiseRef.current) peakRiseRef.current = riseRef.current;

        if (
          !isMouthOpen &&
          wasMouthOpenRef.current &&
          peakRiseRef.current >= TRACKING_CONFIG.sunrisePeakRequiredProgress
        ) {
          convergingRef.current = { startedAt: t, fromRise: riseRef.current };
        }
      }
      wasMouthOpenRef.current = isMouthOpen;

      let nextStage = "idle";
      if (convergingRef.current) nextStage = "converging";
      else if (isMouthOpen && riseRef.current >= TRACKING_CONFIG.sunrisePeakRequiredProgress) nextStage = "ready";
      else if (isMouthOpen) nextStage = "rising";
      if (nextStage !== stageRef.current) {
        stageRef.current = nextStage;
        setStage(nextStage);
      }

      let convergeProgress = 0;
      let convergeFromRise = 0;
      if (convergingRef.current) {
        const elapsed = t - convergingRef.current.startedAt;
        convergeFromRise = convergingRef.current.fromRise;
        if (elapsed <= TRACKING_CONFIG.sunriseConvergeMs) {
          convergeProgress = elapsed / TRACKING_CONFIG.sunriseConvergeMs;
        } else {
          // 수렴 애니메이션이 끝난 뒤에 다음 사이클을 위해 초기화
          convergingRef.current = null;
          riseRef.current = 0;
          peakRiseRef.current = 0;
          setSunriseCount((prev) => Math.min(prev + 1, targetCount));
        }
      }

      if (!isMissionComplete) {
        const prepared = prepareCanvas(canvasRef.current);
        if (prepared) {
          drawSunrise(prepared.ctx, prepared.width, prepared.height, {
            riseProgress: riseRef.current,
            convergeProgress,
            convergeFromRise,
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    setSunriseCount(0);
    setElapsedTime(0);
    wasMouthOpenRef.current = false;
    riseRef.current = 0;
    peakRiseRef.current = 0;
    convergingRef.current = null;
    stageRef.current = "idle";
    setStage("idle");
    setIsTerminated(false);
  }, []);

  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      sunriseCount,
      stage,
      elapsedTime,
    },
  });
  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : SESSION?.nextSessionPath;

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
    () => ({ elapsedTime, successCount: sunriseCount }),
    [elapsedTime, sunriseCount]
  );
  const instructionSub = useMemo(() => {
    if (stage === "converging") return "햇살이 번지고 있어요";
    if (stage === "ready") return "이제 천천히 입을 다물어보세요";
    if (stage === "rising") return "조금 더 크게 벌려 햇살을 끌어올려보세요";
    return SESSION?.guideText;
  }, [stage]);
  const instructionProps = useMemo(
    () => ({ missionText: SESSION?.title, instructionSub }),
    [instructionSub]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (sunriseCount / targetCount) * 100 }),
    [sunriseCount]
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
