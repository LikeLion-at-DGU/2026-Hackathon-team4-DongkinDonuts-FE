import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { lerp, getDistance, getSafeTargetPosition } from "../utils/handUtils";
import { prepareCanvas, drawGazeNodTargets } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["eye-tracking"];
const BURST_MS = 700;
const TOTAL_STAGES = 3;
const STAGE_ORDINAL = { 1: "첫 번째", 2: "두 번째", 3: "세 번째" };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// 매 세션마다 3개 타겟을 handUtils의 getSafeTargetPosition으로 재배치한다.
// 안전한 공 위치 로직과 동일하게(재시도 + 최소 간격) 화면 중심에서 먼 위치에 무작위로 뜨고,
// 서로 겹치지 않는다.
const generateTargets = () => {
  const targets = [];
  for (let i = 0; i < TOTAL_STAGES; i += 1) {
    targets.push(getSafeTargetPosition(targets));
  }
  return targets;
};

export default function EyeTrackingRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const stageRef = useRef(1); // 1~3: 현재 맞춰야 하는 타겟 순번
  const targetsRef = useRef(generateTargets());
  const displayYawRef = useRef(0);
  const displayPitchRef = useRef(0);
  const alignStartRef = useRef(null);
  const burstRef = useRef(null);

  const [stage, setStage] = useState(1);
  const [successCount, setSuccessCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isMissionComplete = successCount >= TOTAL_STAGES;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("FACE_EYE", { paused: isMissionComplete || isQuitModalOpen });

  useEffect(() => {
    // 모델 로딩(initLandmarker)과 카메라 시작(startCamera)은 서로 의존 관계가 없는 독립적인
    // 준비 작업이라 병렬로 시작한다. .then()으로 체이닝해 순차적으로 실행하면 모델 로딩이
    // 느리거나(네트워크 상태에 따라 WASM/모델 파일 다운로드가 오래 걸림) 멈춰 있을 때 카메라
    // 요청 자체가 시작조차 되지 않아 "카메라 준비 중..."에서 계속 멈춰 보이는 원인이 된다.
    initLandmarker();
    startCamera();
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  // 무작위 배치된 타겟을 순서대로 고개(Pitch/Yaw)로 맞추는 트래킹
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);

      if (data?.headYaw != null) {
        const targetYaw = clamp(data.headYaw * TRACKING_CONFIG.headYawSensitivity, -1.4, 1.4);
        const targetPitch = clamp(data.headPitch * TRACKING_CONFIG.headPitchSensitivity, -1.4, 1.4);
        displayYawRef.current = lerp(displayYawRef.current, targetYaw, TRACKING_CONFIG.headPoseSmoothing);
        displayPitchRef.current = lerp(displayPitchRef.current, targetPitch, TRACKING_CONFIG.headPoseSmoothing);

        // 머리 회전 값을 타겟과 동일한 정규화 화면 좌표(0~1)로 매핑
        const pointer = {
          x: clamp(0.5 + displayYawRef.current * TRACKING_CONFIG.pointerRangeX, 0, 1),
          y: clamp(0.5 - displayPitchRef.current * TRACKING_CONFIG.pointerRangeY, 0, 1),
        };

        const currentStage = stageRef.current;
        const activeTarget = targetsRef.current[currentStage - 1];
        const onTarget = getDistance(pointer, activeTarget) <= TRACKING_CONFIG.nodTargetRadius;

        const aligned = onTarget && !isMissionComplete;

        let holdProgress = 0;
        if (aligned) {
          if (alignStartRef.current == null) alignStartRef.current = t;
          const heldMs = t - alignStartRef.current;
          holdProgress = Math.min(1, heldMs / TRACKING_CONFIG.nodHoldMs);
          if (heldMs >= TRACKING_CONFIG.nodHoldMs) {
            alignStartRef.current = null;
            burstRef.current = { startedAt: t, targetIndex: currentStage - 1 };
            if (currentStage < TOTAL_STAGES) {
              stageRef.current = currentStage + 1;
              setStage(currentStage + 1);
              setSuccessCount(currentStage);
            } else {
              setSuccessCount(TOTAL_STAGES);
            }
          }
        } else {
          alignStartRef.current = null;
        }

        let burstProgress = 0;
        let burstIndex = 0;
        if (burstRef.current) {
          const burstElapsed = t - burstRef.current.startedAt;
          if (burstElapsed <= BURST_MS) {
            burstProgress = burstElapsed / BURST_MS;
            burstIndex = burstRef.current.targetIndex;
          } else {
            burstRef.current = null;
          }
        }

        const prepared = prepareCanvas(canvasRef.current);
        if (prepared) {
          drawGazeNodTargets(prepared.ctx, prepared.width, prepared.height, {
            pointer,
            targets: targetsRef.current,
            activeIndex: stageRef.current - 1,
            onTarget,
            holdProgress,
            burstProgress,
            burstIndex,
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
    stageRef.current = 1;
    targetsRef.current = generateTargets();
    setStage(1);
    setSuccessCount(0);
    setElapsedTime(0);
    displayYawRef.current = 0;
    displayPitchRef.current = 0;
    alignStartRef.current = null;
    burstRef.current = null;
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
    () => ({ elapsedTime, successCount }),
    [elapsedTime, successCount]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub:`${SESSION.guideText}`,
    }),
    [stage, isMissionComplete]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (successCount / TOTAL_STAGES) * 100 }),
    [successCount]
  );
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      successCount,
      stage,
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
