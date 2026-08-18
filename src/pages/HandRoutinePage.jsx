import React, { useEffect, useRef, useCallback, useState } from "react";

import { getTargetZone, handleBallRelease, completeMission } from "../engine/missionManager";
import { updateMovingTarget, updateGrabbedBalls, grabNearestBall } from "../engine/ballManager";
import { renderSession } from "../engine/canvasRenderer";
import { CONFIG } from "../config/handRoutineConfig";

import { useHandTracking } from "../hooks/useHandTracking";
import { useSessionLoop } from "../hooks/useSessionLoop";
import { useSessionState } from "../hooks/useSessionState";

import CameraPreview from "../components/handpage/CameraPreview";
import SessionDataPanel from "../components/handpage/SessionDataPanel";
import SessionOverlay from "../components/handpage/SessionOverlay";
import SessionControls from "../components/handpage/SessionControls";
import MissionInstruction from "../components/handpage/MissionInstruction";
import ProgressBar from "../components/handpage/ProgressBar";
import QuitConfirmModal from "../components/handpage/QuitConfirmModal";
import {
  HandRoutineGlobalStyle,
  RoutineGameContainer,
  GameContainer,
  PlayArea,
} from "./HandRoutinePage.styled";

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

  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

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
  }, []);

  useEffect(() => {
    initializeMission();
  }, []);

  // 2. 모달 상태에 따른 비디오 정지/재생
  useEffect(() => {
    if (!videoRef.current) return;

    if (isQuitModalOpen) {
      videoRef.current.pause();
    } else if (cameraReady && !isTerminated) {
      videoRef.current.play().catch(() => {});
    }
  }, [isQuitModalOpen, cameraReady, isTerminated, videoRef]);

  // 3. 타이머
  useEffect(() => {
    if (!isRunning || isQuitModalOpen) return;

    const timer = setInterval(() => {
      setters.setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isQuitModalOpen, setters]);

  // 4. 게임 프레임 루프
  const handleFrame = useCallback(
    (timestamp) => {
      if (isRunning && !isQuitModalOpen) {
        detectHands(timestamp);

        updateMovingTarget({ mission, movingTargetRef: refs.movingTargetRef });

        if (mission.type === "TIME_ATTACK" && missionStatus === "playing") {
          const elapsed = (timestamp - refs.missionStartTimeRef.current) / 1000;
          const remaining = Math.max(0, Math.ceil(CONFIG.timeAttackDuration - elapsed));
          setters.setMissionRemaining(remaining);

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
          onInvalidSequence: () => {},
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
      initializeMission,
      refs,
      handsRef,
    ]
  );

  useSessionLoop({
    enabled: cameraReady && isRunning && !isTerminated && !isQuitModalOpen,
    onFrame: handleFrame,
  });

  const handleStopGame = () => {
    setIsQuitModalOpen(true);
  };

  const handleConfirmQuit = () => {
    setIsQuitModalOpen(false);
    setters.setIsRunning(false);
    setters.setIsTerminated(true);
    cleanup();
  };

  const handleCloseModal = () => {
    setIsQuitModalOpen(false);
  };

  const resetGame = () => {
    initializeMission();
  };

  const isUIOverlayVisible = !isMissionComplete && !isTerminated;

  return (
    <>
      <HandRoutineGlobalStyle />
      <RoutineGameContainer>
        <QuitConfirmModal
          isOpen={isQuitModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmQuit}
        />

        <GameContainer>
          {isUIOverlayVisible && (
            <>
              <CameraPreview
                videoRef={videoRef}
                cameraReady={cameraReady}
                isTerminated={isTerminated}
              />
              <SessionDataPanel
                elapsedTime={elapsedTime}
                successCount={successCount}
                handCount={handCount}
                screenDistance={screenDistance}
              />
              <MissionInstruction
                mission={mission}
                sequenceOrder={refs.sequenceOrderRef.current}
                sameColorTargetType={refs.sameColorTargetTypeRef.current}
                missionRemaining={missionRemaining}
              />
              <ProgressBar
                missionType={mission.type}
                sequenceIndex={sequenceIndex}
                missionProgress={missionProgress}
              />
            </>
          )}

          <PlayArea>
            <canvas ref={canvasRef} />
          </PlayArea>

          <SessionOverlay
            isMissionComplete={isMissionComplete}
            isTerminated={isTerminated}
            resetGame={resetGame}
          />
        </GameContainer>

        <SessionControls
          handleStopGame={handleStopGame}
          resetGame={resetGame}
          isTerminated={isTerminated}
        />
      </RoutineGameContainer>
    </>
  );
};

export default HandRoutinePage;