import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { getDistance } from "../utils/handUtils";
import { prepareCanvas, drawFloatingIce } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["drowsy-ice"];
const BURST_MS = 450;

const randomIcePosition = () => ({
  x: 0.25 + Math.random() * 0.5,
  y: 0.22 + Math.random() * 0.4,
});

export default function DrowsyIceRoutinePage() {
  const navigate = useNavigate();
  const previewCanvasRef = useRef(null);
  const wasMouthOpenRef = useRef(false);
  const icePositionRef = useRef(randomIcePosition());
  const burstRef = useRef(null);

  const [hitCount, setHitCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = 5;
  const isMissionComplete = hitCount >= targetCount;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("FACE_EYE");

  useEffect(() => {
    initLandmarker().then(startCamera);
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  // 손을 쥐듯 입을 벌렸다가 다물면(닫는 동작) 얼음이 깨짐. 단, 입이 얼음과 가까울 때만 성공
  // -> 새 얼음이 무작위 위치에 등장
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const isMouthOpen = !!data?.isMouthOpen;

      if (!isMouthOpen && wasMouthOpenRef.current && !isMissionComplete) {
        // 입이 현재 얼음의 히트 범위 안에 있을 때만 성공 처리 (범위 밖이면 아무 변화 없음)
        const distanceToIce = data?.mouthCenter
          ? getDistance(data.mouthCenter, icePositionRef.current)
          : Infinity;
        if (distanceToIce <= TRACKING_CONFIG.iceHitRadius) {
          burstRef.current = { startedAt: t };
          setHitCount((prev) => Math.min(prev + 1, targetCount));
        }
      }
      wasMouthOpenRef.current = isMouthOpen;

      let burstProgress = 0;
      if (burstRef.current) {
        const burstElapsed = t - burstRef.current.startedAt;
        if (burstElapsed <= BURST_MS) {
          burstProgress = burstElapsed / BURST_MS;
        } else {
          // 깨짐 애니메이션이 끝난 뒤에야 다음 위치로 이동
          burstRef.current = null;
          icePositionRef.current = randomIcePosition();
        }
      }

      if (!isMissionComplete) {
        const prepared = prepareCanvas(previewCanvasRef.current);
        if (prepared) {
          drawFloatingIce(prepared.ctx, prepared.width, prepared.height, {
            x: icePositionRef.current.x,
            y: icePositionRef.current.y,
            burstProgress,
          });
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
    setHitCount(0);
    setElapsedTime(0);
    wasMouthOpenRef.current = false;
    icePositionRef.current = randomIcePosition();
    burstRef.current = null;
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
      dataPanelProps={{ elapsedTime, successCount: hitCount }}
      instructionProps={{ missionText: SESSION.title, instructionSub: SESSION.guideText }}
      progressProps={{ progressPercent: (hitCount / targetCount) * 100 }}
    />
  );
}
