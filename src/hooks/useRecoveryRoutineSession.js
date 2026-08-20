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
  findNextRoutine,
} from "../config/recoveryRouting";

export function useRecoveryRoutineSession({
  isMissionComplete,
  metrics = null,
  accuracy = 100,
} = {}) {
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get("slot");
  const routineInstanceId = searchParams.get("routine");
  const isBackendRoutine = Boolean(slotId && routineInstanceId);

  const [backendSession, setBackendSession] = useState(null);
  const [nextSessionPath, setNextSessionPath] = useState(null);
  const [sessionError, setSessionError] = useState(null);

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
    return path;
  }, [routineInstanceId, slotId]);

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
    refreshNextPath,
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

    completeSession(backendSession.id, {
      accuracy,
      metrics,
    })
      .then(() => refreshNextPath())
      .catch((error) => {
        completedRef.current = false;
        console.error("백엔드 세션 완료 실패:", error);
        setSessionError(error);
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
    isPreparingNextSession:
      isBackendRoutine &&
      isMissionComplete &&
      !nextSessionPath &&
      !sessionError,
    sessionError,
    abortSession,
  };
}
