import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawNeckJelly, drawPoseLandmarks, drawDebugLabel } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["neck-stretch"];

export default function NeckStretchRoutinePage() {
  const navigate = useNavigate();
  const previewCanvasRef = useRef(null);
  const holdSecRef = useRef(0);
  const baselineTiltRef = useRef(null);
  const calibSumRef = useRef(0);
  const calibCountRef = useRef(0);

  const [holdSec, setHoldSec] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetHold = 5;
  const isMissionComplete = holdSec >= targetHold;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("POSE");

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);

      let isNeckTilted = false;
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
          deltaDeg = data.neckTiltDeg - baselineTiltRef.current;
          isNeckTilted = Math.abs(deltaDeg) > TRACKING_CONFIG.neckTiltDeltaThresholdDeg;
        }
      }

      if (isNeckTilted && !isMissionComplete) {
        holdSecRef.current = Math.min(holdSecRef.current + 0.02, targetHold);
        setHoldSec(holdSecRef.current);
      }

      const side = deltaDeg >= 0 ? "right" : "left";
      const prepared = prepareCanvas(previewCanvasRef.current);
      if (prepared) {
        drawPoseLandmarks(prepared.ctx, prepared.width, prepared.height, { pose: data?.raw });
        drawNeckJelly(prepared.ctx, prepared.width, prepared.height, {
          holdRatio: holdSecRef.current / targetHold,
          side,
        });

        const statusText = !data?.raw
          ? "포즈 인식 안 됨 - 어깨까지 화면에 나오게 조정해주세요"
          : baselineTiltRef.current == null
            ? `캘리브레이션 중... ${calibCountRef.current}/${TRACKING_CONFIG.calibrationFrames} (정면을 봐주세요)`
            : `목 기울기 변화: ${deltaDeg.toFixed(1)}° / 기준 ${TRACKING_CONFIG.neckTiltDeltaThresholdDeg}°`;
        drawDebugLabel(prepared.ctx, prepared.width, prepared.height, statusText);
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
    setHoldSec(0);
    holdSecRef.current = 0;
    baselineTiltRef.current = null;
    calibSumRef.current = 0;
    calibCountRef.current = 0;
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
      cameraPreviewProps={{ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated, fullBleed: true }}
      dataPanelProps={{ elapsedTime, successCount: Math.floor(holdSec) }}
      instructionProps={{ missionText: SESSION.title, instructionSub: SESSION.guideText }}
      progressProps={{ progressPercent: (holdSec / targetHold) * 100 }}
    />
  );
}
