import { useCallback, useMemo, useRef, useState } from "react";
import { CONFIG } from "../config/handRoutineConfig";
import { getRandomMission } from "../utils/handUtils";
import { setupMission } from "../engine/missionManager";
import { usePersistedElapsedTime } from "./usePersistedElapsedTime";

export const useSessionState = () => {
  const ballsRef = useRef([]);
  const missionRef = useRef(null);
  const missionProgressRef = useRef(0);
  const sequenceIndexRef = useRef(0);
  const sequenceOrderRef = useRef(["green", "blue", "pink"]);
  const missionStartTimeRef = useRef(null);
  const movingTargetRef = useRef({ x: 0.5, y: 0.45, radius: 0.11, vx: 0.00042, vy: 0.00024 });
  const sameColorTargetTypeRef = useRef("green");
  const staticTargetsRef = useRef([]);

  const [isRunning, setIsRunning] = useState(true);
  const [elapsedTime, setElapsedTime] = usePersistedElapsedTime();
  const [successCount, setSuccessCount] = useState(0);
  const [mission, setMission] = useState(() => getRandomMission());
  const [missionStatus, setMissionStatus] = useState("playing");
  const [missionProgress, setMissionProgress] = useState(0);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [missionRemaining, setMissionRemaining] = useState(CONFIG.timeAttackDuration);
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [sameColorTargetType, setSameColorTargetType] = useState("green");
  const [sequenceOrder, setSequenceOrder] = useState(["green", "blue", "pink"]);

  const refs = useMemo(() => ({
    ballsRef,
    missionRef,
    missionProgressRef,
    sequenceIndexRef,
    sequenceOrderRef,
    missionStartTimeRef,
    movingTargetRef,
    sameColorTargetTypeRef,
    staticTargetsRef,
  }), []);

  const initializeMission = useCallback(() => {
    setupMission({
      nextMission: mission,
      refs,
      setMissionProgress,
      setSequenceIndex,
      setMissionRemaining,
      setMissionStatus,
      setIsRunning,
      setIsMissionComplete,
      setIsTerminated,
      setSameColorTargetType,
      setSequenceOrder,
    });
  }, [mission, refs]);

  return {
    refs,
    state: {
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
    },
    setters: {
      setIsRunning,
      setElapsedTime,
      setSuccessCount,
      setMission,
      setMissionStatus,
      setMissionProgress,
      setSequenceIndex,
      setMissionRemaining,
      setIsMissionComplete,
      setIsTerminated,
      setSameColorTargetType,
      setSequenceOrder,
    },
    initializeMission,
  };
};
