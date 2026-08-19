import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawShoulderGauge, drawPoseLandmarks, drawDebugLabel } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["shoulder-pmr"];
const RAISE_FILL_MS = 1200;
const RELEASE_MS = 500;

export default function ShoulderPmrRoutinePage() {
  const navigate = useNavigate();
  const previewCanvasRef = useRef(null);
  const raiseStartRef = useRef(null);
  const releaseStartRef = useRef(null);
  const baselineRatioRef = useRef(null);
  const calibSumRef = useRef(0);
  const calibCountRef = useRef(0);

  const [pmrStep, setPmrStep] = useState(0); // 0: 대기, 1: 으쓱 수축, 2: 이완 완료
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isMissionComplete = pmrStep === 2;

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

      let isShoulderRaised = false;
      if (data?.shoulderRatio != null) {
        if (baselineRatioRef.current == null) {
          // 초반 프레임 평균으로 "평상시 어깨 위치" 기준값을 보정 (체형/카메라 거리 개인차 흡수)
          calibSumRef.current += data.shoulderRatio;
          calibCountRef.current += 1;
          if (calibCountRef.current >= TRACKING_CONFIG.calibrationFrames) {
            baselineRatioRef.current = calibSumRef.current / calibCountRef.current;
          }
        } else {
          isShoulderRaised =
            data.shoulderRatio < baselineRatioRef.current * (1 - TRACKING_CONFIG.shoulderRaiseDropRatio);
        }
      }

      if (isShoulderRaised && pmrStep === 0) {
        setPmrStep(1);
        raiseStartRef.current = t;
      } else if (!isShoulderRaised && pmrStep === 1) {
        setPmrStep(2);
        releaseStartRef.current = t;
      }

      let fillRatio = 0;
      let phase = "idle";
      if (pmrStep === 1 && raiseStartRef.current != null) {
        fillRatio = Math.min(1, (t - raiseStartRef.current) / RAISE_FILL_MS);
        phase = "raising";
      } else if (pmrStep === 2 && releaseStartRef.current != null) {
        const releaseElapsed = t - releaseStartRef.current;
        fillRatio = Math.max(0, 1 - releaseElapsed / RELEASE_MS);
        phase = "release";
      }

      const prepared = prepareCanvas(previewCanvasRef.current);
      if (prepared) {
        drawPoseLandmarks(prepared.ctx, prepared.width, prepared.height, { pose: data?.raw });
        drawShoulderGauge(prepared.ctx, prepared.width, prepared.height, { fillRatio, phase });

        const statusText = !data?.raw
          ? "포즈 인식 안 됨 - 어깨까지 화면에 나오게 조정해주세요"
          : baselineRatioRef.current == null
            ? `캘리브레이션 중... ${calibCountRef.current}/${TRACKING_CONFIG.calibrationFrames} (편하게 서주세요)`
            : `어깨 비율: ${data.shoulderRatio.toFixed(2)} / 기준 ${(baselineRatioRef.current * (1 - TRACKING_CONFIG.shoulderRaiseDropRatio)).toFixed(2)}`;
        drawDebugLabel(prepared.ctx, prepared.width, prepared.height, statusText);
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, pmrStep, detectFrame]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    setPmrStep(0);
    setElapsedTime(0);
    raiseStartRef.current = null;
    releaseStartRef.current = null;
    baselineRatioRef.current = null;
    calibSumRef.current = 0;
    calibCountRef.current = 0;
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
      dataPanelProps={{ elapsedTime, successCount: pmrStep === 2 ? 1 : 0 }}
      instructionProps={{
        missionText: SESSION.title,
        instructionSub: pmrStep === 0 ? "어깨를 귀까지 으쓱 올려주세요" : "힘을 빼고 툭 떨어뜨리세요",
      }}
      progressProps={{ progressPercent: (pmrStep / 2) * 100 }}
    />
  );
}
