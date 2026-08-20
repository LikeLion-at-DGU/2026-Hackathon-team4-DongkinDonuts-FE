import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useCameraRoutineSession } from "../hooks/useCameraRoutineSession";
import { ROUTINE_SESSIONS, sessionIdFor, remainingSessionsAfter, customSessionStepInfo } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { lerp, getDistance, getSafeTargetPosition } from "../utils/handUtils";
import { prepareCanvas, drawGazeNodTargets } from "../engine/sessionVisuals";
import eyeTrackingImage from "../assets/images/eyeTrackingImage.png";
import { SKIP_SETUP_HOME_STATE } from "../utils/initialSetupState";

const BASE_ID = "eye-tracking";
const BURST_MS = 700;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// 매 세션마다 totalStages개 타겟을 handUtils의 getSafeTargetPosition으로 재배치한다.
// 안전한 공 위치 로직과 동일하게(재시도 + 최소 간격) 화면 중심에서 먼 위치에 무작위로 뜨고,
// 서로 겹치지 않는다.
const generateTargets = (totalStages) => {
  const targets = [];
  for (let i = 0; i < totalStages; i += 1) {
    targets.push(getSafeTargetPosition(targets));
  }
  return targets;
};

export default function EyeTrackingRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  const TOTAL_STAGES = LEVEL.totalStages;
  const canvasRef = useRef(null);
  const stageRef = useRef(1); // 1~TOTAL_STAGES: 현재 맞춰야 하는 타겟 순번
  const targetsRef = useRef(generateTargets(TOTAL_STAGES));
  const displayYawRef = useRef(0);
  const displayPitchRef = useRef(0);
  const alignStartRef = useRef(null);
  const burstRef = useRef(null);

  const [stage, setStage] = useState(1);
  const [successCount, setSuccessCount] = useState(0);

  const isMissionComplete = successCount >= TOTAL_STAGES;

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
  } = useCameraRoutineSession({ trackingType: "FACE_EYE", isMissionComplete });

  // 무작위 배치된 타겟을 순서대로 고개(Pitch/Yaw)로 맞추는 트래킹
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);

      if (data?.headYaw != null) {
        const targetYaw = clamp(data.headYaw * TRACKING_CONFIG.headYawSensitivity, -1.4, 1.4);
        const pitchSensitivity =
          data.headPitch >= 0 ? TRACKING_CONFIG.headPitchUpSensitivity : TRACKING_CONFIG.headPitchDownSensitivity;
        const targetPitch = clamp(data.headPitch * pitchSensitivity, -1.4, 1.4);
        displayYawRef.current = lerp(displayYawRef.current, targetYaw, TRACKING_CONFIG.headPoseSmoothing);
        displayPitchRef.current = lerp(displayPitchRef.current, targetPitch, TRACKING_CONFIG.headPoseSmoothing);

        // 머리 회전 값을 타겟과 동일한 정규화 화면 좌표(0~1)로 매핑
        const pointer = {
          x: clamp(0.5 + displayYawRef.current * TRACKING_CONFIG.pointerRangeX, 0, 1),
          y: clamp(0.5 - displayPitchRef.current * TRACKING_CONFIG.pointerRangeY, 0, 1),
        };

        const currentStage = stageRef.current;
        const activeTarget = targetsRef.current[currentStage - 1];
        const onTarget = getDistance(pointer, activeTarget) <= LEVEL.nodTargetRadius;

        const aligned = onTarget && !isMissionComplete;

        let holdProgress = 0;
        if (aligned) {
          if (alignStartRef.current == null) alignStartRef.current = t;
          const heldMs = t - alignStartRef.current;
          holdProgress = Math.min(1, heldMs / LEVEL.nodHoldMs);
          if (heldMs >= LEVEL.nodHoldMs) {
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
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, LEVEL]);

  const handleReset = useCallback(() => {
    stageRef.current = 1;
    targetsRef.current = generateTargets(TOTAL_STAGES);
    setStage(1);
    setSuccessCount(0);
    displayYawRef.current = 0;
    displayPitchRef.current = 0;
    alignStartRef.current = null;
    burstRef.current = null;
    setIsTerminated(false);
  }, []);

  const handleCloseQuit = useCallback(() => setIsQuitModalOpen(false), []);
  const handleConfirmQuit = useCallback(
    () => navigate("/", { state: SKIP_SETUP_HOME_STATE }),
    [navigate]
  );
  const handleStopSession = useCallback(() => setIsQuitModalOpen(true), []);

  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount, difficulty, screenDistance, sessionImage: eyeTrackingImage, sessionStage: "custom", stepInfo: customSessionStepInfo(BASE_ID) }),
    [elapsedTime, successCount, difficulty, screenDistance]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub: SESSION.guideText,
    }),
    [stage, isMissionComplete]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (successCount / TOTAL_STAGES) * 100, current: successCount, total: TOTAL_STAGES }),
    [successCount]
  );
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      successCount,
      stage,
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
