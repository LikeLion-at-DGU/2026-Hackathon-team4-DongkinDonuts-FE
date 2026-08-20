const ACTIVITY_ROUTE_MAP = {
  WAKE_HAND_ROUTINE: "/handroutine",
  WAKE_BREATH: "/breathroutine",
  WAKE_EYE_MOVE: "/eye-tracking",
  SHIFT_EYE_RELAX: "/eye-blink",
  SHIFT_EYE_TRACKING: "/eye-tracking",
  SHIFT_FOCUS_SWITCH: "/focus-pinch",
  SHIFT_BODY_STRETCH: "/neck-stretch",
  SHIFT_SHOULDER_PMR: "/shoulder-pmr",
  SHIFT_DROWSY_WAKE: "/wakeup-sunrise",
  SHIFT_LIGHT_REFRESH: "/handroutine",
  RESET_BREATH: "/breathroutine",
};

const DONE_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
]);

const ROUTINE_PROGRESS_STATUSES = new Set([
  "IN_PROGRESS",
  "COMPLETED",
]);

const SLOT_OPEN_STATUSES = new Set([
  "RECOMMENDED",
  "SCHEDULED",
  "CHANGED",
]);

export const STAGE_TYPES = {
  BRAIN_WAKE: "BRAIN_WAKE",
  BRAIN_SHIFT: "BRAIN_SHIFT",
  BRAIN_RESET: "BRAIN_RESET",
};

export const STAGE_ORDER = [
  STAGE_TYPES.BRAIN_WAKE,
  STAGE_TYPES.BRAIN_SHIFT,
  STAGE_TYPES.BRAIN_RESET,
];

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
    routines.find((routine) => routine.status === "IN_PROGRESS") ??
    routines.find((routine) => routine.status === "AVAILABLE") ??
    null
  );
}

export function routinesForStage(slot, stageType) {
  return sortedRoutineInstances(slot).filter(
    (routine) => routine.stage_type === stageType
  );
}

export function isRoutineDone(routine) {
  return DONE_STATUSES.has(routine?.status);
}

export function isStageComplete(slot, stageType) {
  const routines = routinesForStage(slot, stageType);
  return routines.length > 0 && routines.every(isRoutineDone);
}

export function arePreviousStagesComplete(slot, stageType) {
  const stageIndex = STAGE_ORDER.indexOf(stageType);
  if (stageIndex <= 0) return true;

  return STAGE_ORDER.slice(0, stageIndex).every((previousStage) =>
    isStageComplete(slot, previousStage)
  );
}

export function findRunnableRoutineForStage(slot, stageType) {
  if (!arePreviousStagesComplete(slot, stageType)) return null;

  const routines = routinesForStage(slot, stageType);
  return (
    routines.find((routine) => routine.status === "IN_PROGRESS") ??
    routines.find((routine) => routine.status === "AVAILABLE") ??
    null
  );
}

export function stageStatusLabel(slot, stageType) {
  return isStageComplete(slot, stageType) ? "완료" : "미완료";
}

export function hasRoutineProgress(slot) {
  return sortedRoutineInstances(slot).some((routine) =>
    ROUTINE_PROGRESS_STATUSES.has(routine.status)
  );
}

export function selectHomeRoutineSlot(slots = []) {
  const orderedSlots = [...slots].sort((a, b) => {
    const aTime = new Date(a.effective_time ?? a.recommended_at ?? 0).getTime();
    const bTime = new Date(b.effective_time ?? b.recommended_at ?? 0).getTime();
    return aTime - bTime || (a.sequence_no ?? 0) - (b.sequence_no ?? 0);
  });

  return (
    orderedSlots.find((slot) => slot.status === "STARTED") ??
    [...orderedSlots].reverse().find((slot) => hasRoutineProgress(slot)) ??
    orderedSlots.find((slot) => SLOT_OPEN_STATUSES.has(slot.status)) ??
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
