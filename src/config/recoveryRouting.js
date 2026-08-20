const ACTIVITY_ROUTE_MAP = {
  WAKE_BREATH: "/breathroutine",
  WAKE_EYE_MOVE: "/eye-tracking",
  SHIFT_EYE_RELAX: "/eye-blink",
  SHIFT_FOCUS_SWITCH: "/focus-pinch",
  SHIFT_BODY_STRETCH: "/neck-stretch",
  SHIFT_DROWSY_WAKE: "/wakeup-sunrise",
  SHIFT_LIGHT_REFRESH: "/handroutine",
  RESET_BREATH: "/breathroutine",
};

const DONE_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
]);

export function routeForActivityCode(activityCode) {
  return ACTIVITY_ROUTE_MAP[activityCode] ?? "/handroutine";
}

export function sortedRoutineInstances(slot) {
  return [...(slot?.routine_instances ?? [])].sort(
    (a, b) => a.sequence_no - b.sequence_no
  );
}

export function findRunnableRoutine(slot) {
  const routines = sortedRoutineInstances(slot);

  return (
    routines.find((routine) => routine.status === "AVAILABLE") ??
    routines.find((routine) => !DONE_STATUSES.has(routine.status)) ??
    null
  );
}

export function findNextRoutine(slot, currentRoutineId) {
  const routines = sortedRoutineInstances(slot);
  const currentIndex = routines.findIndex(
    (routine) => routine.id === currentRoutineId
  );

  if (currentIndex < 0) {
    return findRunnableRoutine(slot);
  }

  return (
    routines
      .slice(currentIndex + 1)
      .find((routine) => !DONE_STATUSES.has(routine.status)) ??
    null
  );
}

export function buildRecoveryRoutinePath(slot, routine) {
  if (!slot?.id || !routine?.id) return "/";

  const params = new URLSearchParams({
    slot: slot.id,
    routine: routine.id,
  });

  return `${routeForActivityCode(routine.activity?.code)}?${params.toString()}`;
}
