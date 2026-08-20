import { DIFFICULTY_LEVELS } from "./difficultyConfig";

// 6개 세션의 순서와 고정 정보(제목/안내문구/트래킹 타입). 난이도별 페이지 id/경로는
// 아래에서 이 순서를 바탕으로 자동 생성한다.
const SESSION_ORDER = [
  {
    id: "eye-blink",
    title: "지그시 눈 깜빡이기",
    guideText: "눈을 2초간 감았다가 떠주세요.",
    trackingType: "FACE_EYE",
  },
  {
    id: "eye-tracking",
    title: "타겟 바라보기",
    guideText: "타겟을 바라보며 고개를 움직이세요.",
    trackingType: "FACE_EYE",
  },
  {
    id: "neck-stretch",
    title: "목 스트레칭",
    guideText: "목을 좌우로 기울여주세요.",
    trackingType: "POSE",
  },
  {
    id: "shoulder-pmr",
    title: "어깨 스트레칭",
    guideText: "어깨를 으쓱 올려주세요.",
    trackingType: "POSE",
  },
  {
    id: "focus-pinch",
    title: "크기 맞추기",
    guideText: "손을 오므려서 고리 크기에 맞춰보세요",
    trackingType: "HAND",
  },
  {
    id: "wakeup-sunrise",
    title: "입 크게 벌리기",
    guideText: "입을 크게 벌려 햇살을 끌어올렸다가, 다물어 퍼뜨려보세요.",
    trackingType: "FACE_EYE",
  },
];

// 마지막 세션(wakeup-sunrise) 다음은 난이도 구분이 없는 심호흡 세션으로 이어진다.
const FINAL_NEXT_PATH = "/breathroutine";

// baseId + 난이도로 실제 페이지 id를 만든다 (예: "eye-blink" + "low" -> "eye-blink-low")
export const sessionIdFor = (baseId, difficulty) => `${baseId}-${difficulty}`;

// 세션 순서 x 난이도(하/중/상) 조합마다 별도의 페이지 id/경로를 갖는 세션 데이터를 생성한다.
// 각 세션의 nextSessionPath는 항상 "같은 난이도의 다음 세션"을 가리키도록 미리 연결해둔다.
export const ROUTINE_SESSIONS = {};
DIFFICULTY_LEVELS.forEach((difficulty) => {
  SESSION_ORDER.forEach((base, index) => {
    const id = sessionIdFor(base.id, difficulty);
    const nextBase = SESSION_ORDER[index + 1];
    const nextSessionPath = nextBase ? `/${sessionIdFor(nextBase.id, difficulty)}` : FINAL_NEXT_PATH;

    ROUTINE_SESSIONS[id] = {
      id,
      baseId: base.id,
      difficulty,
      title: base.title,
      guideText: base.guideText,
      trackingType: base.trackingType,
      nextSessionPath,
    };
  });
});

// SESSION.nextSessionPath("/eye-tracking-medium" 등)로부터 해당 세션이 쓰는 MediaPipe 트래킹
// 타입을 조회. 세션 전환 시 다음 모델을 미리 로드(preload)할 때 사용
// (일치하는 세션이 없으면 null - 예: 심호흡 세션은 카메라 미사용)
export const getTrackingTypeForPath = (path) => {
  const pathname = path?.split("?")[0] ?? "";
  const session = Object.values(ROUTINE_SESSIONS).find((item) => `/${item.id}` === pathname);
  if (session) return session.trackingType;

  const baseId = pathname.replace(/^\//, "");
  const baseSession = SESSION_ORDER.find((item) => item.id === baseId);
  return baseSession?.trackingType ?? null;
};

export const getNextRoutineBaseId = (baseId) => {
  const currentIndex = SESSION_ORDER.findIndex((session) => session.id === baseId);
  return SESSION_ORDER[currentIndex + 1]?.id ?? null;
};

// SESSION_ORDER의 6개 세션 뒤에는 항상 심호흡 세션이 이어지므로 전체 흐름은 7단계다.
const TOTAL_LOCAL_STEPS = SESSION_ORDER.length + 1;

// 현재 세션(baseId) 이후에 남은 세션 개수(같은 난이도 흐름 기준, 심호흡 포함).
// SESSION_ORDER에 없는 baseId(예: 독립 실행되는 handroutine)에 대해서는 0을 반환한다.
export const remainingSessionsAfter = (baseId) => {
  const index = SESSION_ORDER.findIndex((session) => session.id === baseId);
  if (index < 0) return 0;
  return TOTAL_LOCAL_STEPS - index - 1;
};

// "맞춤세션" 단계(SESSION_ORDER의 6개 세션)의 총 개수.
export const TOTAL_CUSTOM_SESSIONS = SESSION_ORDER.length;

// SESSION_ORDER 상의 위치를 바탕으로 (현재 세션 단계 / 총 세션 개수)를 반환한다.
// SESSION_ORDER에 없는 baseId에 대해서는 null을 반환한다.
export const customSessionStepInfo = (baseId) => {
  const index = SESSION_ORDER.findIndex((session) => session.id === baseId);
  if (index < 0) return null;
  return { current: index + 1, total: TOTAL_CUSTOM_SESSIONS };
};
