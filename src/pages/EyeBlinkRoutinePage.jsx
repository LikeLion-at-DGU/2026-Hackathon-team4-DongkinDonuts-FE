import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionPage from "./SessionPage";
import { useMultiTracking } from "../hooks/useMultiTracking";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { ROUTINE_SESSIONS } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { prepareCanvas, drawEyeBlinkPulse } from "../engine/sessionVisuals";

const SESSION = ROUTINE_SESSIONS["eye-blink"];
const POP_MS = 900;
const CLOSE_EASE = 0.18;

export default function EyeBlinkRoutinePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const closedSinceRef = useRef(null);
  const holdCompleteRef = useRef(false);
  const closeAmountRef = useRef(0);
  const popRef = useRef(null);
  const blinkCountRef = useRef(0);

  const [blinkCount, setBlinkCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const targetCount = 3;
  const isMissionComplete = blinkCount >= targetCount;

  const { videoRef, cameraReady, startCamera, initLandmarker, detectFrame, cleanup } =
    useMultiTracking("FACE_EYE", { paused: isMissionComplete || isQuitModalOpen });

  useEffect(() => {
    initLandmarker().then(startCamera);
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
        if (heldMs >= TRACKING_CONFIG.blinkHoldMs) holdCompleteRef.current = true;
      } else {
        if (closedSinceRef.current != null && holdCompleteRef.current && blinkCountRef.current < targetCount) {
          const isFinal = blinkCountRef.current + 1 >= targetCount;
          popRef.current = { startedAt: t, isFinal };
          if (!isFinal) {
            blinkCountRef.current += 1;
            setBlinkCount(blinkCountRef.current);
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

      const prepared = prepareCanvas(canvasRef.current);
      if (prepared) {
        drawEyeBlinkPulse(prepared.ctx, prepared.width, prepared.height, {
          closeAmount: closeAmountRef.current,
          popProgress,
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
    setBlinkCount(0);
    setElapsedTime(0);
    closedSinceRef.current = null;
    holdCompleteRef.current = false;
    closeAmountRef.current = 0;
    popRef.current = null;
    blinkCountRef.current = 0;
    setIsTerminated(false);
  }, []);
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      blinkCount,
      elapsedTime,
    },
  });
  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : SESSION.nextSessionPath;

  const handleCloseQuit = useCallback(() => setIsQuitModalOpen(false), []);
  const handleConfirmQuit = useCallback(() => {
    recoverySession.abortSession();
    navigate("/");
  }, [navigate, recoverySession]);
  const handleStopSession = useCallback(() => setIsQuitModalOpen(true), []);

  const cameraPreviewProps = useMemo(
    () => ({ videoRef, canvasRef: previewCanvasRef, cameraReady, isTerminated }),
    [videoRef, cameraReady, isTerminated]
  );
  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount: blinkCount }),
    [elapsedTime, blinkCount]
  );
  const instructionProps = useMemo(
    () => ({ missionText: SESSION.title, instructionSub: SESSION.guideText }),
    []
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (blinkCount / targetCount) * 100 }),
    [blinkCount]
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
      nextSessionPath={nextSessionPath}
      isNextSessionPending={recoverySession.isPreparingNextSession}
      cameraPreviewProps={cameraPreviewProps}
      dataPanelProps={dataPanelProps}
      instructionProps={instructionProps}
      progressProps={progressProps}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </SessionPage>
  );
}
