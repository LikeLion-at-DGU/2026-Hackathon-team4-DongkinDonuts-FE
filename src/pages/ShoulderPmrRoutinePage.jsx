import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { usePersistedElapsedTime } from "../hooks/usePersistedElapsedTime";
import { ROUTINE_SESSIONS, sessionIdFor, remainingSessionsAfter, customSessionStepInfo } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { prepareCanvas, drawShoulderCircle } from "../engine/sessionVisuals";
import ShoulderImage from "../assets/images/ShoulderImage.png";

const BASE_ID = "shoulder-pmr";
const SQUEEZE_RELEASE_MS = 1000; // 어깨를 내렸을 때 원이 원래 크기/색으로 되돌아가는 시간 (수축과 동일한 속도로 선형 왕복)

export default function ShoulderPmrRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const navigate = useNavigate();
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  const HOLD_MS = LEVEL.holdMs; // normalizedShrugScore가 임계값을 넘은 채로 유지해야 "수축 성공"으로 인정하는 시간
  const TOTAL_REPS = LEVEL.totalReps; // 완료 모달이 뜨기까지 반복해야 하는 총 횟수
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const holdStartRef = useRef(null); // normalizedShrugScore가 임계값을 넘기 시작한 시각 (수축 성공 판정용)
  const releaseStartRef = useRef(null);
  const baselineShoulderYRef = useRef(null); // 평소(정면 응시) 어깨 y 위치 기준값
  const calibSumRef = useRef(0);
  const calibCountRef = useRef(0);
  const cycleCompleteRef = useRef(false); // 현재 반복(raise→release)의 완료 처리가 이미 이뤄졌는지
  const repCountRef = useRef(0);
  // setPmrStep은 비동기라 반영되기까지 한 프레임 이상 걸릴 수 있는데, rAF 루프는
  // React 커밋을 기다리지 않고 바로 다음 프레임을 예약해버린다. 그 사이(전환 프레임
  // 직후)에도 루프가 옛 pmrStep 값을 참조하면 holdStartRef가 이미 리셋된 상태로 "대기"
  // 분기를 다시 타면서 squeezeAmount가 잠깐 0으로 튀어 원이 초기화되는 것처럼 보인다.
  // 루프의 상태 판단은 항상 즉시 갱신되는 이 ref만 참조해 그 틈을 없앤다.
  const pmrStepRef = useRef(0);

  const [pmrStep, setPmrStep] = useState(0); // 0: 대기, 1: 으쓱 수축, 2: 이완 애니메이션
  const [repCount, setRepCount] = useState(0); // 완료한 반복 횟수 (0 ~ TOTAL_REPS)
  const [elapsedTime, setElapsedTime] = usePersistedElapsedTime();
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isMissionComplete = repCount >= TOTAL_REPS;

  const { videoRef, cameraReady, screenDistance, startCamera, initLandmarker, detectFrame, cleanup } =
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

      const threshold = LEVEL.shoulderShrugThreshold;
      const isAboveThreshold = baselineShoulderYRef.current != null && normalizedShrugScore > threshold;
      const isBelowReleaseThreshold = normalizedShrugScore < threshold * 0.5;

      // 판단은 항상 pmrStepRef(동기적으로 즉시 갱신됨)를 기준으로 하고, setPmrStep은
      // 화면에 보여줄 안내 문구/진행바 텍스트 갱신용으로만 같이 호출한다.
      if (pmrStepRef.current === 0) {
        if (isAboveThreshold) {
          if (holdStartRef.current == null) holdStartRef.current = t;
          // normalizedShrugScore가 임계값 이상으로 HOLD_MS(1초) 연속 유지되어야 "수축 성공" 처리
          if (t - holdStartRef.current >= HOLD_MS) {
            pmrStepRef.current = 1;
            setPmrStep(1);
            holdStartRef.current = null;
            cycleCompleteRef.current = false;
          }
        } else {
          // 유지 도중 임계값 아래로 떨어지면 타이머를 리셋해 처음부터 다시 유지해야 한다
          holdStartRef.current = null;
        }
      } else if (pmrStepRef.current === 1 && isBelowReleaseThreshold) {
        // 임계값의 절반 아래로 떨어져야 "내렸다(release)"로 인정 (중간 구간은 흔들림 방지용 히스테리시스)
        pmrStepRef.current = 2;
        setPmrStep(2);
        releaseStartRef.current = t;
      }

      // 수축 유지 시간에 비례해 원이 점점 작게 스퀴즈되며 색이 변하고(squeezeAmount),
      // 수축 성공 이후에는 완전히 스퀴즈된 채 유지되다가, 이완 순간부터는 같은 값을
      // 거꾸로(SQUEEZE_RELEASE_MS 동안 선형으로) 따라가며 원래 크기/색으로 복구된다.
      let squeezeAmount = 0;
      if (pmrStepRef.current === 0 && holdStartRef.current != null) {
        squeezeAmount = Math.min(1, (t - holdStartRef.current) / HOLD_MS);
      } else if (pmrStepRef.current === 1) {
        squeezeAmount = 1;
      } else if (pmrStepRef.current === 2 && releaseStartRef.current != null) {
        const releaseElapsed = t - releaseStartRef.current;
        squeezeAmount = Math.max(0, 1 - releaseElapsed / SQUEEZE_RELEASE_MS);
        // 원이 완전히 원래 크기로 되돌아온 뒤에야 이번 반복을 완료 처리한다
        if (releaseElapsed >= SQUEEZE_RELEASE_MS && !cycleCompleteRef.current) {
          cycleCompleteRef.current = true;
          const nextCount = repCountRef.current + 1;
          repCountRef.current = nextCount;
          setRepCount(nextCount);
          if (nextCount < TOTAL_REPS) {
            // 아직 반복이 남았다면 대기 상태로 되돌려 다음 raise를 기다린다
            pmrStepRef.current = 0;
            setPmrStep(0);
            holdStartRef.current = null;
            releaseStartRef.current = null;
          }
        }
      }

      const prepared = prepareCanvas(canvasRef.current);
      if (prepared) {
        drawShoulderCircle(prepared.ctx, prepared.width, prepared.height, { squeezeAmount });
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
    // pmrStep은 pmrStepRef를 통해서만 읽으므로 의도적으로 deps에서 제외한다 — 매 전환마다
    // 루프를 취소/재생성하면 그 사이(취소 전 이미 예약된 다음 rAF 프레임)에 옛 상태를 참조하는
    // 프레임이 한 번 더 실행되어 원이 잠깐 초기화되는 깜빡임의 원인이 되기 때문이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, LEVEL]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    pmrStepRef.current = 0;
    setPmrStep(0);
    setRepCount(0);
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
    () => ({ elapsedTime, successCount: repCount, difficulty, screenDistance, sessionImage: ShoulderImage, sessionStage: "custom", stepInfo: customSessionStepInfo(BASE_ID) }),
    [elapsedTime, repCount, difficulty, screenDistance]
  );
  const instructionProps = useMemo(
    () => ({
      missionText: SESSION.title,
      instructionSub:
        pmrStep === 0
          ? repCount > 0
            ? "한 번 더 어깨를 으쓱 올려주세요"
            : SESSION.guideText
          : pmrStep === 1
            ? "힘을 빼고 툭 떨어뜨리세요"
            : "다시 편안해지고 있어요",
    }),
    [pmrStep, repCount, SESSION.guideText]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: pmrStep === 0 ? 0 : pmrStep === 1 ? 50 : 100, current: repCount, total: TOTAL_REPS }),
    [pmrStep, repCount]
  );
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      repCount,
      pmrStep,
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
