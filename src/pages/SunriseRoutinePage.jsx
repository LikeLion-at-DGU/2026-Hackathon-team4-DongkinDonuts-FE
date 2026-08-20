import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SessionPage from "./SessionPage";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useCameraRoutineSession } from "../hooks/useCameraRoutineSession";
import { ROUTINE_SESSIONS, sessionIdFor, remainingSessionsAfter, customSessionStepInfo } from "../config/sessionData";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY } from "../config/difficultyConfig";
import { prepareCanvas, drawSunrise } from "../engine/sessionVisuals";
import mouthImage from "../assets/images/mouthImage.png";
import { SKIP_SETUP_HOME_STATE } from "../utils/initialSetupState";

const BASE_ID = "wakeup-sunrise";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

export default function SunriseRoutinePage({ difficulty = DEFAULT_DIFFICULTY }) {
  const SESSION = ROUTINE_SESSIONS[sessionIdFor(BASE_ID, difficulty)];
  const LEVEL = DIFFICULTY_CONFIG[BASE_ID][difficulty];
  const canvasRef = useRef(null);
  const wasMouthOpenRef = useRef(false);
  const riseRef = useRef(0);
  const peakRiseRef = useRef(0);
  const convergingRef = useRef(null);
  const stageRef = useRef("idle");
  const [stage, setStage] = useState("idle"); // idle | rising | ready | converging

  const [sunriseCount, setSunriseCount] = useState(0);

  const targetCount = LEVEL.targetCount;
  const isMissionComplete = sunriseCount >= targetCount;

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
  } = useCameraRoutineSession({ trackingType: "FACE_EYE", isMissionComplete });

  // 입을 벌린 정도(MAR)를 0~1 상승도로 변환해 부드럽게 보간하며 햇살을 끌어올리고,
  // 충분히 떠오른 상태에서 입을 다물면(닫는 동작) 화면 중앙으로 수렴하는 애니메이션을 시작한다.
  useEffect(() => {
    let animId;
    const loop = (t) => {
      const data = detectFrame(t);
      const isMouthOpen = !!data?.isMouthOpen;
      const mouthRatio = data?.mouthRatio ?? 0;

      if (!isMissionComplete && !convergingRef.current) {
        const target = clamp01(
          (mouthRatio - LEVEL.mouthRatioMin) /
            (LEVEL.mouthRatioMax - LEVEL.mouthRatioMin)
        );
        riseRef.current = lerp(riseRef.current, target, TRACKING_CONFIG.sunriseRiseSmoothing);
        if (riseRef.current > peakRiseRef.current) peakRiseRef.current = riseRef.current;

        if (
          !isMouthOpen &&
          wasMouthOpenRef.current &&
          peakRiseRef.current >= LEVEL.peakRequiredProgress
        ) {
          convergingRef.current = { startedAt: t, fromRise: riseRef.current };
        }
      }
      wasMouthOpenRef.current = isMouthOpen;

      let nextStage = "idle";
      if (convergingRef.current) nextStage = "converging";
      else if (isMouthOpen && riseRef.current >= LEVEL.peakRequiredProgress) nextStage = "ready";
      else if (isMouthOpen) nextStage = "rising";
      if (nextStage !== stageRef.current) {
        stageRef.current = nextStage;
        setStage(nextStage);
      }

      let convergeProgress = 0;
      let convergeFromRise = 0;
      if (convergingRef.current) {
        const elapsed = t - convergingRef.current.startedAt;
        convergeFromRise = convergingRef.current.fromRise;
        if (elapsed <= TRACKING_CONFIG.sunriseConvergeMs) {
          convergeProgress = elapsed / TRACKING_CONFIG.sunriseConvergeMs;
        } else {
          // 수렴 애니메이션이 끝난 뒤에 다음 사이클을 위해 초기화
          convergingRef.current = null;
          riseRef.current = 0;
          peakRiseRef.current = 0;
          setSunriseCount((prev) => Math.min(prev + 1, targetCount));
        }
      }

      if (!isMissionComplete) {
        const prepared = prepareCanvas(canvasRef.current);
        if (prepared) {
          drawSunrise(prepared.ctx, prepared.width, prepared.height, {
            riseProgress: riseRef.current,
            convergeProgress,
            convergeFromRise,
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };
    if (cameraReady && !isTerminated && !isMissionComplete && !isQuitModalOpen) animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, isTerminated, isMissionComplete, isQuitModalOpen, detectFrame, LEVEL]);

  const handleReset = useCallback(() => {
    setSunriseCount(0);
    wasMouthOpenRef.current = false;
    riseRef.current = 0;
    peakRiseRef.current = 0;
    convergingRef.current = null;
    stageRef.current = "idle";
    setStage("idle");
    setIsTerminated(false);
  }, []);

  const handleCloseQuit = useCallback(() => setIsQuitModalOpen(false), []);
  const handleConfirmQuit = useCallback(
    () => navigate("/", { state: SKIP_SETUP_HOME_STATE }),
    [navigate]
  );
  const handleStopSession = useCallback(() => setIsQuitModalOpen(true), []);

  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount: sunriseCount, difficulty, screenDistance, sessionImage: mouthImage, sessionStage: "custom", stepInfo: customSessionStepInfo(BASE_ID) }),
    [elapsedTime, sunriseCount, difficulty, screenDistance]
  );
  const instructionSub = useMemo(() => {
    if (stage === "converging") return "햇살이 번지고 있어요";
    if (stage === "ready") return "이제 천천히 입을 다물어보세요";
    if (stage === "rising") return "조금 더 크게 벌려 햇살을 끌어올려보세요";
    return SESSION?.guideText;
  }, [stage]);
  const instructionProps = useMemo(
    () => ({ missionText: SESSION?.title, instructionSub }),
    [instructionSub]
  );
  const progressProps = useMemo(
    () => ({ progressPercent: (sunriseCount / targetCount) * 100, current: sunriseCount, total: targetCount }),
    [sunriseCount]
  );
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      sunriseCount,
      stage,
      difficulty,
    },
    localRemainingCount: remainingSessionsAfter(BASE_ID),
  });
  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : SESSION?.nextSessionPath;

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
