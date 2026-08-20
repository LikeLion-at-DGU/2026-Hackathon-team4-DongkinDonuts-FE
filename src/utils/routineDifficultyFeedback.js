import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_LEVELS,
} from "../config/difficultyConfig";

const ROUTINE_DIFFICULTY_STORAGE_KEY = "brainfit_routine_difficulty_feedback";
const SLOT_COMPLETIONS_STORAGE_KEY = "brainfit_completed_routine_difficulties";

const DIFFICULTY_INDEX_BY_KEY = Object.fromEntries(
  DIFFICULTY_LEVELS.map((difficulty, index) => [difficulty, index])
);

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage 저장 실패는 서버 기반 난이도 추천으로 보완한다.
  }
}

export function normalizeDifficultyKey(value, fallback = DEFAULT_DIFFICULTY) {
  return DIFFICULTY_LEVELS.includes(value) ? value : fallback;
}

export function adjustedDifficultyForFeedback(
  completedDifficulty,
  difficultyFeedback
) {
  const normalizedDifficulty = normalizeDifficultyKey(completedDifficulty);
  const currentIndex = DIFFICULTY_INDEX_BY_KEY[normalizedDifficulty];

  if (difficultyFeedback === "TOO_EASY") {
    return DIFFICULTY_LEVELS[
      Math.min(DIFFICULTY_LEVELS.length - 1, currentIndex + 1)
    ];
  }

  if (difficultyFeedback === "A_BIT_HARD") {
    return DIFFICULTY_LEVELS[Math.max(0, currentIndex - 1)];
  }

  return normalizedDifficulty;
}

export function getStoredRoutineDifficulty(baseId) {
  if (!baseId) return null;

  const stored = readJson(ROUTINE_DIFFICULTY_STORAGE_KEY, {});
  return normalizeDifficultyKey(stored[baseId]?.recommendedDifficulty, null);
}

export function rememberCompletedRoutineDifficulty({
  slotId,
  baseId,
  difficulty,
}) {
  if (!slotId || !baseId || !difficulty) return;

  const stored = readJson(SLOT_COMPLETIONS_STORAGE_KEY, {});
  const completions = Array.isArray(stored[slotId]) ? stored[slotId] : [];
  const nextCompletion = {
    baseId,
    difficulty: normalizeDifficultyKey(difficulty),
    completedAt: new Date().toISOString(),
  };

  stored[slotId] = [
    ...completions.filter((item) => item?.baseId !== baseId),
    nextCompletion,
  ];

  writeJson(SLOT_COMPLETIONS_STORAGE_KEY, stored);
}

export function applyDifficultyFeedbackToSlot({
  slotId,
  difficultyFeedback,
  fallbackRoutines = [],
}) {
  if (!slotId || !difficultyFeedback) return;

  const pendingBySlot = readJson(SLOT_COMPLETIONS_STORAGE_KEY, {});
  const pendingCompletions = Array.isArray(pendingBySlot[slotId])
    ? pendingBySlot[slotId]
    : [];
  const fallbackCompletions = fallbackRoutines
    .map((routine) => ({
      baseId: routine?.frontend_session_base_id,
      difficulty: routine?.recommended_difficulty,
    }))
    .filter((item) => item.baseId);
  const completions = pendingCompletions.length
    ? pendingCompletions
    : fallbackCompletions;

  if (!completions.length) return;

  const stored = readJson(ROUTINE_DIFFICULTY_STORAGE_KEY, {});
  const submittedAt = new Date().toISOString();

  completions.forEach((completion) => {
    if (!completion?.baseId) return;

    stored[completion.baseId] = {
      completedDifficulty: normalizeDifficultyKey(completion.difficulty),
      difficultyFeedback,
      recommendedDifficulty: adjustedDifficultyForFeedback(
        completion.difficulty,
        difficultyFeedback
      ),
      submittedAt,
    };
  });

  delete pendingBySlot[slotId];
  writeJson(ROUTINE_DIFFICULTY_STORAGE_KEY, stored);
  writeJson(SLOT_COMPLETIONS_STORAGE_KEY, pendingBySlot);
}
