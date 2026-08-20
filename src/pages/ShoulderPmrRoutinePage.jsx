import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawShoulderStone } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["shoulder-pmr"];
const HOLD_MS = 1000; // normalizedShrugScore가 임계값을 넘은 채로 유지해야 "수축 성공"으로 인정하는 시간
const SQUEEZE_RELEASE_MS = 350; // 스톤이 형태를 잃고 빠르게 사라지는 시간
const WAVE_MS = 900; // 가루 입자가 흩날려 떨어지는 지속 시간
const TOTAL_REPS = 2; // 완료 모달이 뜨기까지 반복해야 하는 총 횟수

export default function ShoulderPmrRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const holdStartRef = useRef(null); // normalizedShrugScore가 임계값을 넘기 시작한 시각 (수축 성공 판정용)
  const releaseStartRef = useRef(null);
  const baselineShoulderYRef = useRef(null); // 평소(정면 응시) 어깨 y 위치 기준값
  const calibSumRef = useRef(0);
  const calibCountRef = useRef(0);
  const cycleCompleteRef = useRef(false); // 현재 반복(raise→release)의 완료 처리가 이미 이뤄졌는지
  const repCountRef = useRef(0);

  const [pmrStep, setPmrStep] = useState(0); // 0: 대기, 1: 으쓱 수축, 2: 이완 애니메이션
  const [repCount, setRepCount] = useState(0); // 완료한 반복 횟수 (0 ~ TOTAL_REPS)
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isMissionComplete = repCount >= TOTAL_REPS;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("POSE", { paused: isMissionComplete || isQuitModalOpen });

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
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);

      // normalizedShrugScore: 평소 어깨 y 위치(baseline) 대비 지금 어깨가 얼마나 위로
      // 올라갔는지(delta)를 어깨너비로 정규화한 값. 고개를 숙이거나 젖히는 동작과는
      // 완전히 무관하며, 어깨 자체의 상승량만 반영한다.
      let normalizedShrugScore = 0;
      if (data?.shoulderY != null && data?.shoulderWidth) {
        if (baselineShoulderYRef.current == null) {
          // 초반 프레임(정면 응시 상태) 평균으로 "평소 어깨 위치" 기준값을 보정 (체형/카메라 거리 개인차 흡수)
          calibSumRef.current += data.shoulderY;
          calibCountRef.current += 1;
          if (calibCountRef.current >= TRACKING_CONFIG.calibrationFrames) {
            baselineShoulderYRef.current = calibSumRef.current / calibCountRef.current;
          }
        } else {
          const deltaY = baselineShoulderYRef.current - data.shoulderY; // 올릴수록 양수(+)로 증가
          normalizedShrugScore = deltaY / data.shoulderWidth;
        }
      }

      const threshold = TRACKING_CONFIG.shoulderShrugThreshold;
      const isAboveThreshold = baselineShoulderYRef.current != null && normalizedShrugScore > threshold;
      const isBelowReleaseThreshold = normalizedShrugScore < threshold * 0.5;

      if (pmrStep === 0) {
        if (isAboveThreshold) {
          if (holdStartRef.current == null) holdStartRef.current = t;
          // normalizedShrugScore가 임계값 이상으로 HOLD_MS(1초) 연속 유지되어야 "수축 성공" 처리
          if (t - holdStartRef.current >= HOLD_MS) {
            setPmrStep(1);
            holdStartRef.current = null;
            cycleCompleteRef.current = false;
          }
        } else {
          // 유지 도중 임계값 아래로 떨어지면 타이머를 리셋해 처음부터 다시 유지해야 한다
          holdStartRef.current = null;
        }
      } else if (pmrStep === 1 && isBelowReleaseThreshold) {
        // 임계값의 절반 아래로 떨어져야 "내렸다(release)"로 인정 (중간 구간은 흔들림 방지용 히스테리시스)
        setPmrStep(2);
        releaseStartRef.current = t;
      }

      // 수축 유지 시간에 비례해 스톤이 조밀하게 수축하며 단단해지고(squeezeAmount),
      // 수축 성공 이후에는 완전히 조여진 채 유지되다가, 이완 순간부터는 빠르게 형태를
      // 잃으며(SQUEEZE_RELEASE_MS) 파스텔 가루 입자가 더 길게(WAVE_MS) 흩날려 떨어진다.
      let squeezeAmount = 0;
      let releaseWaveProgress = 0;
      if (pmrStep === 0 && holdStartRef.current != null) {
        squeezeAmount = Math.min(1, (t - holdStartRef.current) / HOLD_MS);
      } else if (pmrStep === 1) {
        squeezeAmount = 1;
      } else if (pmrStep === 2 && releaseStartRef.current != null) {
        const releaseElapsed = t - releaseStartRef.current;
        squeezeAmount = Math.max(0, 1 - releaseElapsed / SQUEEZE_RELEASE_MS);
        releaseWaveProgress = Math.min(1, releaseElapsed / WAVE_MS);
        // 가루 입자가 흩날려 떨어지는 애니메이션(WAVE_MS)이 끝난 뒤에야 이번 반복을 완료 처리해
        // 완료 모달/다음 반복 전환이 애니메이션을 잘라먹지 않도록 한다.
        if (releaseElapsed >= WAVE_MS && !cycleCompleteRef.current) {
          cycleCompleteRef.current = true;
          const nextCount = repCountRef.current + 1;
          repCountRef.current = nextCount;
          setRepCount(nextCount);
          if (nextCount < TOTAL_REPS) {
            // 아직 반복이 남았다면 대기 상태로 되돌려 다음 raise를 기다린다
            setPmrStep(0);
            holdStartRef.current = null;
            releaseStartRef.current = null;
          }
        }
      }

      const phase = pmrStep === 2 ? "release" : pmrStep === 1 || holdStartRef.current != null ? "hold" : "idle";

      const prepared = prepareCanvas(canvasRef.current);
      if (prepared) {
        drawShoulderStone(prepared.ctx, prepared.width, prepared.height, {
          phase,
          squeezeAmount,
          releaseProgress: releaseWaveProgress,
        });
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, pmrStep, detectFrame]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    setPmrStep(0);
    setRepCount(0);
    setElapsedTime(0);
    holdStartRef.current = null;
    releaseStartRef.current = null;
    baselineShoulderYRef.current = null;
    calibSumRef.current = 0;
    calibCountRef.current = 0;
    cycleCompleteRef.current = false;
    repCountRef.current = 0;
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
    () => ({ elapsedTime, successCount: repCount }),
    [elapsedTime, repCount]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub:
        pmrStep === 0
          ? repCount > 0
            ? "한 번 더 어깨를 으쓱 올려주세요"
            : "어깨를 으쓱 올려주세요"
          : pmrStep === 1
            ? "힘을 빼고 툭 떨어뜨리세요"
            : "돌이 부서졌어요",
    }),
    [pmrStep, repCount]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: pmrStep === 0 ? 0 : pmrStep === 1 ? 50 : 100 }),
    [pmrStep]
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
