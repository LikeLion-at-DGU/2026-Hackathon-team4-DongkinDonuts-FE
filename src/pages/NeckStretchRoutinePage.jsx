import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useCameraRoutineSession } from "../hooks/useCameraRoutineSession";
import { ROUTINE_SESSIONS, sessionIdFor, remainingSessionsAfter, customSessionStepInfo } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { prepareCanvas, drawTiltIndicator } from "../engine/sessionVisuals";
import { lerp } from "../utils/handUtils";
import NeckImage from "../assets/images/NeckImage.png";

const BASE_ID = "neck-stretch";
const BURST_MS = 700;

export default function NeckStretchRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  // 좌우 왕복(2단계)을 cycles번 반복 — 홀수 단계는 첫 방향(+), 짝수 단계는 반대 방향(-)
  const TOTAL_STAGES = LEVEL.cycles * 2;
  const canvasRef = useRef(null);
  const stageRef = useRef(1); // 1: 첫 번째 방향, 2: 반대쪽 방향
  const displayDegRef = useRef(0);
  const alignStartRef = useRef(null);
  const burstRef = useRef(null);
  const finalPendingRef = useRef(false);

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
  } = useCameraRoutineSession({ trackingType: "POSE", isMissionComplete });

  useEffect(() => {
    let animId;
    // 마지막 burst가 끝나 미션이 완료되는 바로 그 프레임에도 아래 requestAnimationFrame(loop)이
    // 무조건 다음 프레임을 예약해버린다. isMissionComplete가 true로 바뀌어도 그 사실은 React가
    // 커밋 후(페인트 이후) effect를 다시 실행해야 이 loop 클로저에 반영되는데, 그 사이에 rAF가
    // 먼저 한 번 더 실행돼(stale closure) 이미 null로 비운 정렬 타이머를 다시 채워 넣는 등
    // 완료 순간에 애니메이션이 한 번 더 깜빡이는 원인이 된다. stopped 플래그로 완료된 그 프레임
    // 안에서 즉시 스스로 예약을 멈춰 이 여분의 프레임을 없앤다.
    let stopped = false;
    const loop = (t) => {
      const data = detectFrame(t);

      // 캔버스 게이지는 useMultiTracking이 어깨 벡터로 따로 계산한 neckTiltDeg가 아니라, 카메라
      // 프리뷰에 실제로 찍히는 두 점(정수리 headPoint, 목중앙 neckPoint) 사이의 기하학적 각도를
      // 그대로 써서 동기화한다. neckPoint→headPoint 벡터의 화면(미러링된 프리뷰 기준) 각도이며,
      // x를 두 점 모두 (1-x)로 반전해도 차(dx)는 부호가 상쇄되어 그대로 raw x를 빼면 된다.
      let lineTiltDeg = null;
      if (data?.headPoint && data?.neckPoint) {
        const dx = data.neckPoint.x - data.headPoint.x;
        const dy = data.neckPoint.y - data.headPoint.y;
        lineTiltDeg = Math.atan2(dx, dy) * (180 / Math.PI);
      }

      // 0°는 "목 중앙→정수리 벡터가 화면 수직과 일치하는 상태"라는 고정된 절대 기준이다.
      // 세션 시작 시 초반 프레임을 평균/중앙값 내어 그때그때 기준각을 다시 잡는 캘리브레이션
      // 단계는 없앴다 — 매번 기준이 조금씩 다르게 잡혀서 고개를 정면으로 해도 그때마다 다른
      // 각도로 표시되는 문제가 있었기 때문에, 계산식 자체가 이미 갖고 있는 절대 0°를 그대로 쓴다.
      const deltaDeg = lineTiltDeg ?? 0;

      // 인디케이터가 표시할 수 있는 최대 범위를 절대 벗어나지 않도록 먼저 선형 제한(clamp)한 뒤,
      // 그 목표값으로 LERP 보간해 갑작스러운 감지 튐이 있어도 막대가 매끄럽게 뒤따라가도록 한다.
      const clampedTargetDeg = Math.min(
        TRACKING_CONFIG.neckTiltMaxDeg,
        Math.max(-TRACKING_CONFIG.neckTiltMaxDeg, deltaDeg)
      );
      displayDegRef.current = lerp(
        displayDegRef.current,
        clampedTargetDeg,
        TRACKING_CONFIG.neckIndicatorSmoothing
      );

      // 현재 단계(stage)의 목표 각도 범위: 홀수 단계는 +min°~+max°, 짝수 단계는 반대쪽 -max°~-min°
      const stageSign = stageRef.current % 2 === 1 ? 1 : -1;
      const targetMinDeg = Math.min(
        stageSign * LEVEL.neckTargetMinDeg,
        stageSign * LEVEL.neckTargetMaxDeg
      );
      const targetMaxDeg = Math.max(
        stageSign * LEVEL.neckTargetMinDeg,
        stageSign * LEVEL.neckTargetMaxDeg
      );
      const aligned =
        !isMissionComplete &&
        deltaDeg >= targetMinDeg &&
        deltaDeg <= targetMaxDeg;

      // 목표 각도 범위에 정렬된 채 neckAlignHoldMs(1초) 연속 유지하면 해당 단계 성공 처리.
      // 유지 도중 범위를 벗어나면 alignStartRef가 즉시 null로 초기화되어 타이머가 리셋된다.
      let holdProgress = 0;
      let holdRemainingSec = LEVEL.neckAlignHoldMs / 1000;
      if (finalPendingRef.current) {
        // 마지막 단계는 유지 완료로 burst가 트리거된 뒤에도 사용자가 자세를 그대로 유지하고
        // 있어 aligned가 계속 true로 남는다. 이때 alignStartRef가 null인 채로 방치하면 유지
        // 타이머가 처음부터 다시 채워져, 초록 게이지가 완료 burst와 겹쳐 한 번 더 차오르는
        // 것처럼 보인다. 트리거 이후에는 게이지를 가득 찬 상태로 고정해 재생을 막는다.
        holdProgress = 1;
        holdRemainingSec = 0;
      } else if (aligned) {
        if (alignStartRef.current == null) alignStartRef.current = t;
        const heldMs = t - alignStartRef.current;
        holdProgress = Math.min(1, heldMs / LEVEL.neckAlignHoldMs);
        holdRemainingSec = Math.max(0, (LEVEL.neckAlignHoldMs - heldMs) / 1000);
        if (heldMs >= LEVEL.neckAlignHoldMs) {
          alignStartRef.current = null;
          const currentStage = stageRef.current;
          const isFinal = currentStage >= TOTAL_STAGES;
          burstRef.current = { startedAt: t, isFinal };
          if (!isFinal) {
            stageRef.current = currentStage + 1;
            setStage(currentStage + 1);
            setSuccessCount(currentStage);
          } else {
            finalPendingRef.current = true;
          }
        }
      } else {
        alignStartRef.current = null;
      }

      let burstProgress = 0;
      if (burstRef.current) {
        const burstElapsed = t - burstRef.current.startedAt;
        if (burstElapsed <= BURST_MS) {
          burstProgress = burstElapsed / BURST_MS;
        } else {
          // 마지막 단계의 burst 애니메이션이 끝난 뒤에야 완료 카운트를 올려 미션 완료 모달이
          // 애니메이션을 잘라먹지 않도록 한다.
          burstProgress = 1;
          if (burstRef.current.isFinal) {
            setSuccessCount(TOTAL_STAGES);
            stopped = true;
          }
          burstRef.current = null;
        }
      }

      const prepared = prepareCanvas(canvasRef.current);
      if (prepared) {
        drawTiltIndicator(prepared.ctx, prepared.width, prepared.height, {
          currentDeg: displayDegRef.current,
          targetMinDeg,
          targetMaxDeg,
          maxDeg: TRACKING_CONFIG.neckTiltMaxDeg,
          aligned,
          holdProgress,
          holdRemainingSec,
          burstProgress,
        });
      }

      if (!stopped) animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, LEVEL]);

  const handleReset = useCallback(() => {
    stageRef.current = 1;
    setStage(1);
    setSuccessCount(0);
    displayDegRef.current = 0;
    alignStartRef.current = null;
    burstRef.current = null;
    finalPendingRef.current = false;
    setIsTerminated(false);
  }, [setIsTerminated]);

  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount, difficulty, screenDistance, sessionImage: NeckImage, sessionStage: "custom", stepInfo: customSessionStepInfo(BASE_ID) }),
    [elapsedTime, successCount, difficulty, screenDistance]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub: SESSION.guideText
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
      instantReset
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
