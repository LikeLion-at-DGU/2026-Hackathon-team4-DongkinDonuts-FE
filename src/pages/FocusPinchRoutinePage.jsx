import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS, sessionIdFor } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { prepareCanvas, drawPinchRings } from "../engine/sessionVisuals";
import handImage from "../assets/images/handImage.png";

const BASE_ID = "focus-pinch";

const randomTargetSize = () => Math.round(10 + Math.random() * 80); // 10~90%
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function FocusPinchRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const navigate = useNavigate();
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const matchSinceRef = useRef(null);

  const [pinchCount, setPinchCount] = useState(0);
  const [targetSize, setTargetSize] = useState(randomTargetSize);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = LEVEL.targetCount;
  const isMissionComplete = pinchCount >= targetCount;

  const { videoRef, cameraReady, screenDistance, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("HAND", { paused: isMissionComplete || isQuitModalOpen });

  useEffect(() => {
    // 모델 로딩(initLandmarker)과 카메라 시작(startCamera)은 서로 의존 관계가 없는 독립적인
    // 준비 작업이라 병렬로 시작한다. .then()으로 체이닝해 순차적으로 실행하면 모델 로딩이
    // 느리거나(네트워크 상태에 따라 WASM/모델 파일 다운로드가 오래 걸림) 멈춰 있을 때 카메라
    // 요청 자체가 시작조차 되지 않아 "카메라 준비 중..."에서 계속 멈춰 보이는 원인이 된다.
    initLandmarker();
    startCamera();
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  // 각 손의 엄지-검지 핀치 거리를 링 크기(%)로 변환, 두 손 모두 목표 크기에 맞춰 2초 유지하면 성공
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
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, targetSize, LEVEL]);

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

  const handleCloseQuit = useCallback(() => setIsQuitModalOpen(false), []);
  const handleConfirmQuit = useCallback(() => navigate("/"), [navigate]);
  const handleStopSession = useCallback(() => setIsQuitModalOpen(true), []);

  const cameraPreviewProps = useMemo(
    () => ({ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated }),
    [videoRef, cameraReady, isTerminated]
  );
  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount: pinchCount, difficulty, screenDistance, sessionImage: handImage }),
    [elapsedTime, pinchCount, difficulty, screenDistance]
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
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      pinchCount,
      targetSize,
    },
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
      cameraPreviewProps={cameraPreviewProps}
      dataPanelProps={dataPanelProps}
      instructionProps={instructionProps}
      progressProps={progressProps}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}
