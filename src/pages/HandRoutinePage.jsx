import { useEffect, useRef, useCallback, useState } from "react";

import { getTargetZone, handleBallRelease, completeMission } from "../engine/missionManager";
import { updateMovingTarget, updateGrabbedBalls, grabNearestBall } from "../engine/ballManager";
import { renderSession } from "../engine/canvasRenderer";
import { CONFIG } from "../config/handRoutineConfig";

import { useHandTracking } from "../hooks/useHandTracking";
import { useSessionLoop } from "../hooks/useSessionLoop";
import { useSessionState } from "../hooks/useSessionState";

import HandPlayArea from "../components/sessions/HandPlayArea";
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
  } = state;

  // 1. 초기화
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await initializeMediaPipe();
      if (isMounted) {
        await startCamera();
      }
    };

    init();

    return () => {
      isMounted = false;
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

  return (
    <SessionPage
      isQuitModalOpen={isQuitModalOpen}
      onCloseQuit={handleCloseModal}
      onConfirmQuit={handleConfirmQuit}
      isMissionComplete={isMissionComplete}
      isTerminated={isTerminated}
      resetSession={resetGame}
      onStopSession={handleStopGame}
      nextSessionPath="/eye-blink"
      showOverlay={isUIOverlayVisible}
      cameraPreviewProps={{
        videoRef,
        cameraReady,
        isTerminated,
      }}
      dataPanelProps={{
        elapsedTime,
        successCount,
        handCount,
        screenDistance,
      }}
      instructionProps={{
        mission,
        sequenceOrder: refs.sequenceOrderRef.current,
        sameColorTargetType: refs.sameColorTargetTypeRef.current,
        missionRemaining,
      }}
      progressProps={{
        missionType: mission.type,
        sequenceIndex,
        missionProgress,
      }}
    >
      <HandPlayArea canvasRef={canvasRef} />
    </SessionPage>
  );
};

export default HandRoutinePage;
