import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { ROUTINE_SESSIONS, sessionIdFor, remainingSessionsAfter, customSessionStepInfo } from "../config/sessionData";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { prepareCanvas, drawEyeBlinkPulse } from "../engine/sessionVisuals";
import eyeBlinkImage from "../assets/images/eyeBlinkImage.png";

const BASE_ID = "eye-blink";
const POP_MS = 900;
const CLOSE_EASE = 0.18;
const FAIL_DISPLAY_MS = 1500;

export default function EyeBlinkRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const navigate = useNavigate();
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const closedSinceRef = useRef(null);
  const holdCompleteRef = useRef(false);
  const closeAmountRef = useRef(0);
  const popRef = useRef(null);
  const failRef = useRef(null);
  const blinkCountRef = useRef(0);

  const [blinkCount, setBlinkCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = LEVEL.targetCount;
  const isMissionComplete = blinkCount >= targetCount;

  const { videoRef, cameraReady, screenDistance, startCamera, initLandmarker, detectFrame, cleanup } =
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

  // 눈을 감는 동안은 중앙 링이 웜톤으로 작게 축소되고, 1초 이상 감았다가 뜨면(rising edge)
  // 링이 파스텔 입자를 남기며 사방으로 퐁 퍼지다 잔물결처럼 사라지는 파동을 재생한다.
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const isBlinking = !!data?.isBlinking;

      if (isBlinking) {
        if (closedSinceRef.current == null) closedSinceRef.current = t;
        const heldMs = t - closedSinceRef.current;
        if (heldMs >= LEVEL.blinkHoldMs) holdCompleteRef.current = true;
      } else {
        if (closedSinceRef.current != null && blinkCountRef.current < targetCount) {
          if (holdCompleteRef.current) {
            const isFinal = blinkCountRef.current + 1 >= targetCount;
            popRef.current = { startedAt: t, isFinal };
            if (!isFinal) {
              blinkCountRef.current += 1;
              setBlinkCount(blinkCountRef.current);
            }
          } else {
            // 목표 유지 시간(blinkHoldMs)을 채우지 못하고 눈을 뜬 경우, 실제로 몇 초
            // 감고 있었는지 중앙에 잠깐 띄워서 얼마나 더 유지해야 하는지 알려준다.
            const heldMs = t - closedSinceRef.current;
            failRef.current = {
              startedAt: t,
              seconds: heldMs / 1000,
              targetSeconds: LEVEL.blinkHoldMs / 1000,
            };
          }
        }
        closedSinceRef.current = null;
        holdCompleteRef.current = false;
      }

      const targetClose = isBlinking ? 1 : 0;
      closeAmountRef.current += (targetClose - closeAmountRef.current) * CLOSE_EASE;

      let popProgress = 0;
      if (popRef.current) {
        const popElapsed = t - popRef.current.startedAt;
        if (popElapsed <= POP_MS) {
          popProgress = popElapsed / POP_MS;
        } else {
          // 마지막 반복의 pop 애니메이션이 끝난 뒤에야 완료 카운트를 올려 미션 완료 모달이
          // 애니메이션을 잘라먹지 않도록 한다.
          popProgress = 1;
          if (popRef.current.isFinal) {
            blinkCountRef.current = targetCount;
            setBlinkCount(targetCount);
          }
          popRef.current = null;
        }
      }

      let failInfo = null;
      if (failRef.current) {
        const failElapsed = t - failRef.current.startedAt;
        if (failElapsed <= FAIL_DISPLAY_MS) {
          failInfo = {
            seconds: failRef.current.seconds,
            targetSeconds: failRef.current.targetSeconds,
            progress: failElapsed / FAIL_DISPLAY_MS,
          };
        } else {
          failRef.current = null;
        }
      }

      const prepared = prepareCanvas(canvasRef.current);
      if (prepared) {
        drawEyeBlinkPulse(prepared.ctx, prepared.width, prepared.height, {
          closeAmount: closeAmountRef.current,
          popProgress,
          failInfo,
        });
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, LEVEL]);

  useEffect(() => {
    if (isTerminated || isQuitModalOpen || isMissionComplete) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminated, isQuitModalOpen, isMissionComplete]);

  const handleReset = useCallback(() => {
    setBlinkCount(0);
    closedSinceRef.current = null;
    holdCompleteRef.current = false;
    closeAmountRef.current = 0;
    popRef.current = null;
    failRef.current = null;
    blinkCountRef.current = 0;
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
    () => ({ elapsedTime, successCount: blinkCount, difficulty, screenDistance, sessionImage: eyeBlinkImage, sessionStage: "custom", stepInfo: customSessionStepInfo(BASE_ID) }),
    [elapsedTime, blinkCount, difficulty, screenDistance]
  );
  const instructionProps = useMemo(
    () => ({ missionText: SESSION.title, instructionSub: SESSION.guideText }),
    []
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (blinkCount / targetCount) * 100, current: blinkCount, total: targetCount }),
    [blinkCount]
  );
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      blinkCount,
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
