import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMultiTracking } from "./useMultiTracking";
import { usePersistedElapsedTime } from "./usePersistedElapsedTime";

// EyeBlink/EyeTracking/NeckStretch/ShoulderPmr/FocusPinch/Sunrise RoutinePage 6개가 공통으로
// 반복하던 스캐폴딩만 뽑아낸다: 카메라/모델 초기화, 경과 시간 타이머, 종료(quit) 핸들러,
// 카메라 프리뷰 props. 미션별 감지·캔버스 렌더 루프(rAF)는 페이지마다 완전히 다른 로직이라
// (성공 판정, 히스테리시스, 단계 전환 등) 공통화하지 않고 그대로 각 페이지에 남겨둔다.
export function useCameraRoutineSession({ trackingType, isMissionComplete }) {
  const navigate = useNavigate();
  const previewCanvasRef = useRef(null);

  const [elapsedTime, setElapsedTime] = usePersistedElapsedTime();
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const tracking = useMultiTracking(trackingType, {
    paused: isMissionComplete || isQuitModalOpen,
  });
  const { videoRef, cameraReady, startCamera, initLandmarker, cleanup } = tracking;

  useEffect(() => {
    // 모델 로딩(initLandmarker)과 카메라 시작(startCamera)은 서로 의존 관계가 없는 독립적인
    // 준비 작업이라 병렬로 시작한다. .then()으로 체이닝해 순차적으로 실행하면 모델 로딩이
    // 느리거나(네트워크 상태에 따라 WASM/모델 파일 다운로드가 오래 걸림) 멈춰 있을 때 카메라
    // 요청 자체가 시작조차 되지 않아 "카메라 준비 중..."에서 계속 멈춰 보이는 원인이 된다.
    initLandmarker();
    startCamera();
    return () => cleanup();
  }, [initLandmarker, startCamera, cleanup]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete, setElapsedTime]);

  const handleCloseQuit = useCallback(() => setIsQuitModalOpen(false), []);
  const handleConfirmQuit = useCallback(() => navigate("/"), [navigate]);
  const handleStopSession = useCallback(() => setIsQuitModalOpen(true), []);

  const cameraPreviewProps = useMemo(
    () => ({ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated }),
    [videoRef, cameraReady, isTerminated]
  );

  return {
    ...tracking,
    elapsedTime,
    isQuitModalOpen,
    isTerminated,
    setIsTerminated,
    handleCloseQuit,
    handleConfirmQuit,
    handleStopSession,
    cameraPreviewProps,
  };
}
