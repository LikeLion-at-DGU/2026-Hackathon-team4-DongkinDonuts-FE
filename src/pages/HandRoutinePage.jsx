import { useEffect, useRef, useCallback, useMemo, useState } from "react";

import { getTargetZone, handleBallRelease, completeMission } from "../engine/missionManager";
import { updateMovingTarget, updateGrabbedBalls, grabNearestBall } from "../engine/ballManager";
import { renderSession } from "../engine/canvasRenderer";
import { CONFIG } from "../config/handRoutineConfig";

import { useHandTracking } from "../hooks/useHandTracking";
import { useRecoveryRoutineSession } from "../hooks/useRecoveryRoutineSession";
import { useSessionLoop } from "../hooks/useSessionLoop";
import { useSessionState } from "../hooks/useSessionState";

import SessionPage from "./SessionPage";

const HandRoutinePage = () => {
  const canvasRef = useRef(null);

  const {
    videoRef,
    handsRef,
    cameraReady,
    handCount,
    screenDistance,
    initializeMediaPipe,
    startCamera,
    detectHands,
    cleanup,
  } = useHandTracking();

  const { refs, state, setters, initializeMission } = useSessionState();
  const { setElapsedTime } = setters;

  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const lastRemainingRef = useRef(null);

  const {
    isRunning,
    elapsedTime,
    successCount,
    mission,
    missionStatus,
    missionProgress,
    sequenceIndex,
    missionRemaining,
    isMissionComplete,
    isTerminated,
    sameColorTargetType,
    sequenceOrder,
  } = state;

  // 1. 초기화
  useEffect(() => {
    // 모델 로딩(initializeMediaPipe)과 카메라 시작(startCamera)은 서로 의존 관계가 없는
    // 독립적인 준비 작업이라 병렬로 시작한다. 예전엔 모델 로딩이 끝난 뒤에야 카메라를 시작했는데,
    // 모델 로딩이 느리거나(네트워크 상태에 따라 WASM/모델 파일 다운로드가 오래 걸림) 멈춰 있을
    // 때 카메라 요청 자체가 시작조차 되지 않아 "카메라 준비 중..."에서 계속 멈춰 보이는 원인이
    // 됐다. detectHands는 두 자원이 각각 준비될 때까지 자연스럽게 기다리므로 순서를 강제할
    // 필요가 없다.
    initializeMediaPipe();
    startCamera();

    return () => {
      cleanup();
    };
  }, [cleanup, initializeMediaPipe, startCamera]);

  useEffect(() => {
    initializeMission();
  }, [initializeMission]);

  // 2. 모달 상태에 따른 비디오 정지/재생
  useEffect(() => {
    if (!videoRef.current) return;

    if (isQuitModalOpen) {
      videoRef.current.pause();
    } else if (cameraReady && !isTerminated) {
      videoRef.current.play().catch(() => { });
    }
  }, [isQuitModalOpen, cameraReady, isTerminated, videoRef]);

  // 3. 타이머
  useEffect(() => {
    if (!isRunning || isQuitModalOpen) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isQuitModalOpen, setElapsedTime]);

  // 4. 게임 프레임 루프
  const handleFrame = useCallback(
    (timestamp) => {
      if (isRunning && !isQuitModalOpen) {
        detectHands(timestamp);

        updateMovingTarget({ mission, movingTargetRef: refs.movingTargetRef });

        if (mission.type === "TIME_ATTACK" && missionStatus === "playing") {
          const elapsed = (timestamp - refs.missionStartTimeRef.current) / 1000;
          const remaining = Math.max(0, Math.ceil(CONFIG.timeAttackDuration - elapsed));
          if (lastRemainingRef.current !== remaining) {
            lastRemainingRef.current = remaining;
            setters.setMissionRemaining(remaining);
          }

          if (remaining <= 0) {
            setters.setMissionStatus("failed");
            setters.setIsRunning(false);
          }
        }

        updateGrabbedBalls({
          balls: refs.ballsRef.current,
          hands: handsRef.current,
          now: timestamp,
          onRelease: (ball) => {
            const targetZone = getTargetZone({
              mission,
              ball,
              movingTargetRef: refs.movingTargetRef,
              staticTargetsRef: refs.staticTargetsRef,
            });

            handleBallRelease({
              mission,
              ball,
              target: targetZone,
              refs,
              callbacks: {
                setMissionProgress: setters.setMissionProgress,
                setSequenceIndex: setters.setSequenceIndex,
                completeMission: () =>
                  completeMission({
                    setSuccessCount: setters.setSuccessCount,
                    setIsMissionComplete: setters.setIsMissionComplete,
                    setIsRunning: setters.setIsRunning,
                  }),
                failMission: () => {
                  setters.setMissionStatus("failed");
                  setters.setIsRunning(false);
                },
              },
            });
          },
        });

        grabNearestBall({
          balls: refs.ballsRef.current,
          hands: handsRef.current,
          mission,
          sequenceOrder: refs.sequenceOrderRef.current,
          sequenceIndex,
          onInvalidSequence: () => { },
        });
      }

      renderSession({
        canvas: canvasRef.current,
        mission,
        movingTarget: refs.movingTargetRef.current,
        staticTargets: refs.staticTargetsRef.current,
        balls: refs.ballsRef.current,
        hands: handsRef.current,
      });
    },
    [
      isRunning,
      isQuitModalOpen,
      detectHands,
      mission,
      missionStatus,
      sequenceIndex,
      setters,
      refs,
      handsRef,
    ]
  );

  useSessionLoop({
    enabled: cameraReady && isRunning && !isTerminated && !isQuitModalOpen,
    onFrame: handleFrame,
  });

  const handleStopGame = useCallback(() => {
    setIsQuitModalOpen(true);
  }, []);

  const handleConfirmQuit = useCallback(() => {
    setIsQuitModalOpen(false);
    setters.setIsRunning(false);
    setters.setIsTerminated(true);
    cleanup();
  }, [cleanup, setters]);

  const handleCloseModal = useCallback(() => {
    setIsQuitModalOpen(false);
  }, []);

  const resetGame = useCallback(() => {
    lastRemainingRef.current = null;
    initializeMission();
  }, [initializeMission]);

  const isUIOverlayVisible = !isTerminated;
  const recoverySession = useRecoveryRoutineSession({
    isMissionComplete,
    metrics: {
      elapsedTime,
      successCount,
      missionType: mission.type,
    },
  });

  const nextSessionPath = recoverySession.isBackendRoutine
    ? recoverySession.nextSessionPath
    : "/eye-blink";

  const cameraPreviewProps = useMemo(
    () => ({ videoRef, cameraReady, isTerminated }),
    [videoRef, cameraReady, isTerminated]
  );
  const dataPanelProps = useMemo(
    () => ({ elapsedTime, successCount, handCount, screenDistance }),
    [elapsedTime, successCount, handCount, screenDistance]
  );
  const instructionProps = useMemo(
    () => ({
      mission,
      sequenceOrder,
      sameColorTargetType,
      missionRemaining,
    }),
    [mission, sequenceOrder, sameColorTargetType, missionRemaining]
  );
  const progressProps = useMemo(
    () => ({ missionType: mission.type, sequenceIndex, missionProgress }),
    [mission, sequenceIndex, missionProgress]
  );

  return (
    <SessionPage
      isQuitModalOpen={isQuitModalOpen}
      onCloseQuit={handleCloseModal}
      onConfirmQuit={() => {
        recoverySession.abortSession();
        handleConfirmQuit();
      }}
      isMissionComplete={isMissionComplete}
      isTerminated={isTerminated}
      resetSession={resetGame}
      onStopSession={handleStopGame}
      nextSessionPath="/eye-blink-medium"
      showOverlay={isUIOverlayVisible}
      cameraPreviewProps={cameraPreviewProps}
      dataPanelProps={dataPanelProps}
      instructionProps={instructionProps}
      progressProps={progressProps}
    >
      <canvas ref={canvasRef} />
    </SessionPage>
  );
};

export default HandRoutinePage;
