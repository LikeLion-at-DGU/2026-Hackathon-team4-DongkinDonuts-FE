import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getRecoverySlot } from "../api/plans";
import {
  abortSession as abortBackendSession,
  completeSession,
  getActiveSession,
  startSession,
} from "../api/sessions";
import {
  buildRecoveryRoutinePath,
  countRemainingRoutines,
  findNextRoutine,
} from "../config/recoveryRouting";

export function useRecoveryRoutineSession({
  isMissionComplete,
  metrics = null,
  accuracy = 100,
  localRemainingCount = 0,
} = {}) {
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get("slot");
  const routineInstanceId = searchParams.get("routine");
  const isBackendRoutine = Boolean(slotId && routineInstanceId);

  const [backendSession, setBackendSession] = useState(null);
  const [nextSessionPath, setNextSessionPath] = useState(null);
  const [remainingCount, setRemainingCount] = useState(0);
  const [sessionError, setSessionError] = useState(null);
  const [isCompletingSession, setIsCompletingSession] = useState(false);

  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const backendSessionRef = useRef(null);

  useEffect(() => {
    backendSessionRef.current = backendSession;
  }, [backendSession]);

  const refreshNextPath = useCallback(async () => {
    if (!slotId || !routineInstanceId) return null;

    const slot = await getRecoverySlot(slotId);
    const nextRoutine = findNextRoutine(slot, routineInstanceId);
    const path = nextRoutine
      ? buildRecoveryRoutinePath(slot, nextRoutine)
      : "/";

    setNextSessionPath(path);
    setRemainingCount(countRemainingRoutines(slot, routineInstanceId));
    return path;
  }, [routineInstanceId, slotId]);

  useEffect(() => {
    if (!isBackendRoutine) return;

    refreshNextPath().catch((error) => {
      console.error("다음 백엔드 세션 경로 조회 실패:", error);
    });
  }, [isBackendRoutine, refreshNextPath]);

  useEffect(() => {
    if (!isBackendRoutine || startedRef.current) return;

    let isMounted = true;
    startedRef.current = true;

    const ensureSessionStarted = async () => {
      try {
        const activeSession = await getActiveSession();
        if (activeSession?.routine_instance_id === routineInstanceId) {
          if (isMounted) {
            setBackendSession(activeSession);
          }
          return;
        }

        const session = await startSession({
          routineInstanceId,
          cameraPermissionStatus: "UNKNOWN",
        });

        if (isMounted) {
          setBackendSession(session);
        }
      } catch (error) {
        console.error("백엔드 세션 시작 실패:", error);
        if (isMounted) {
          setSessionError(error);
        }
      }
    };

    ensureSessionStarted();

    return () => {
      isMounted = false;
    };
  }, [
    isBackendRoutine,
    routineInstanceId,
  ]);

  useEffect(() => {
    if (
      !isBackendRoutine ||
      !isMissionComplete ||
      !backendSession?.id ||
      completedRef.current
    ) {
      return;
    }

    completedRef.current = true;
    setIsCompletingSession(true);

    completeSession(backendSession.id, {
      accuracy,
      metrics,
    })
      .then(async () => {
        await refreshNextPath();
      })
      .catch((error) => {
        console.error("백엔드 세션 완료 실패:", error);
        setSessionError(error);
      })
      .finally(() => {
        setIsCompletingSession(false);
      });
  }, [
    accuracy,
    backendSession,
    isBackendRoutine,
    isMissionComplete,
    metrics,
    refreshNextPath,
  ]);

  const abortSession = useCallback(async () => {
    if (!isBackendRoutine || !backendSessionRef.current?.id || completedRef.current) {
      return;
    }

    try {
      await abortBackendSession(backendSessionRef.current.id);
    } catch (error) {
      console.error("백엔드 세션 중단 실패:", error);
      setSessionError(error);
    }
  }, [isBackendRoutine]);

  return {
    isBackendRoutine,
    nextSessionPath,
    remainingSessionsCount: isBackendRoutine ? remainingCount : localRemainingCount,
    isPreparingNextSession: isCompletingSession,
    sessionError,
    slotId,
    routineInstanceId,
    abortSession,
  };
}
