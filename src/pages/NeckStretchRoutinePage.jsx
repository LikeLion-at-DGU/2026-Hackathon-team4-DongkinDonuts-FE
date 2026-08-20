import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawTiltIndicator } from "../engine/sessionVisuals";
import { lerp, normalizeAngleDeg } from "../utils/handUtils";

const SESSION = ROUTINE_SESSIONS["neck-stretch"];
const BURST_MS = 700;
const TOTAL_STAGES = 2;

export default function NeckStretchRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const stageRef = useRef(1); // 1: 첫 번째 방향, 2: 반대쪽 방향
  const baselineTiltRef = useRef(null);
  const calibSumRef = useRef(0);
  const calibCountRef = useRef(0);
  const displayDegRef = useRef(0);
  const alignStartRef = useRef(null);
  const burstRef = useRef(null);
  const finalPendingRef = useRef(false);

  const [stage, setStage] = useState(1);
  const [successCount, setSuccessCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isMissionComplete = successCount >= TOTAL_STAGES;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("POSE", { paused: isMissionComplete || isQuitModalOpen });

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);

      let deltaDeg = 0;
      if (data?.neckTiltDeg != null) {
        if (baselineTiltRef.current == null) {
          // 초반 프레임 평균으로 "정면 기준 각도"를 보정 (사람/카메라 각도 개인차 흡수)
          calibSumRef.current += data.neckTiltDeg;
          calibCountRef.current += 1;
          if (calibCountRef.current >= TRACKING_CONFIG.calibrationFrames) {
            baselineTiltRef.current = calibSumRef.current / calibCountRef.current;
          }
        } else {
          // normalizeAngleDeg: 기준각과 현재각이 ±180° 경계 양쪽에 걸쳐 있을 때(예: 179° - (-179°))
          // 발생하는 350°대의 오버플로우 값을 -180~180 범위로 감싸 순간이동을 방지한다.
          deltaDeg = normalizeAngleDeg(data.neckTiltDeg - baselineTiltRef.current);
        }
      }
      const isCalibrating = baselineTiltRef.current == null;

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

      // 현재 단계(stage)의 목표 각도 범위: 1단계는 +15°~+25°, 2단계는 반대쪽 -25°~-15°
      const stageSign = stageRef.current === 1 ? 1 : -1;
      const targetMinDeg = Math.min(
        stageSign * TRACKING_CONFIG.neckTargetMinDeg,
        stageSign * TRACKING_CONFIG.neckTargetMaxDeg
      );
      const targetMaxDeg = Math.max(
        stageSign * TRACKING_CONFIG.neckTargetMinDeg,
        stageSign * TRACKING_CONFIG.neckTargetMaxDeg
      );
      const aligned =
        !isCalibrating &&
        !isMissionComplete &&
        deltaDeg >= targetMinDeg &&
        deltaDeg <= targetMaxDeg;

      // 목표 각도 범위에 정렬된 채 neckAlignHoldMs(1초) 연속 유지하면 해당 단계 성공 처리.
      // 유지 도중 범위를 벗어나면 alignStartRef가 즉시 null로 초기화되어 타이머가 리셋된다.
      let holdProgress = 0;
      let holdRemainingSec = TRACKING_CONFIG.neckAlignHoldMs / 1000;
      if (aligned) {
        if (alignStartRef.current == null) alignStartRef.current = t;
        const heldMs = t - alignStartRef.current;
        holdProgress = Math.min(1, heldMs / TRACKING_CONFIG.neckAlignHoldMs);
        holdRemainingSec = Math.max(0, (TRACKING_CONFIG.neckAlignHoldMs - heldMs) / 1000);
        if (heldMs >= TRACKING_CONFIG.neckAlignHoldMs && !finalPendingRef.current) {
          alignStartRef.current = null;
          const isFinal = stageRef.current !== 1;
          burstRef.current = { startedAt: t, isFinal };
          if (!isFinal) {
            stageRef.current = 2;
            setStage(2);
            setSuccessCount(1);
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
          isCalibrating,
          burstProgress,
        });
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
    setStage(1);
    setSuccessCount(0);
    baselineTiltRef.current = null;
    calibSumRef.current = 0;
    calibCountRef.current = 0;
    displayDegRef.current = 0;
    alignStartRef.current = null;
    burstRef.current = null;
    finalPendingRef.current = false;
    setElapsedTime(0);
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
      instructionSub: SESSION.guideText
    }),
    [stage, isMissionComplete]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (successCount / TOTAL_STAGES) * 100 }),
    [successCount]
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
      nextSessionPath={SESSION.nextSessionPath}
      cameraPreviewProps={cameraPreviewProps}
      dataPanelProps={dataPanelProps}
      instructionProps={instructionProps}
      progressProps={progressProps}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}
