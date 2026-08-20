import { DIFFICULTY_LEVELS } from "./difficultyConfig";

// 6개 세션의 순서와 고정 정보(제목/안내문구/트래킹 타입). 난이도별 페이지 id/경로는
// 아래에서 이 순서를 바탕으로 자동 생성한다.
// guideText는 난이도별로 문구가 달라진다 - DIFFICULTY_CONFIG의 반복횟수/유지시간 수치를
// 그대로 안내문에 반영해, 사용자가 지금 난이도에서 뭘 몇 번 해야 하는지 바로 알 수 있게 한다.
const SESSION_ORDER = [
  {
    id: "eye-blink",
    title: "지그시 눈 깜빡이기",
    guideText: {
      low: "눈을 1초간 감았다가 떠주세요. 2회만 반복하면 완료돼요.",
      medium: "눈을 2초간 감았다가 떠주세요. 3회 반복해주세요.",
      high: "눈을 3초간 꾹 감았다가 떠주세요. 5회 반복해주세요.",
    },
    trackingType: "FACE_EYE",
  },
  {
    id: "eye-tracking",
    title: "타겟 바라보기",
    guideText: {
      low: "타겟을 눈으로 바라보며 고개를 움직이세요. 타겟 2개를 0.6초씩 맞추면 완료돼요.",
      medium: "타겟을 눈으로 바라보며 고개를 움직이세요. 타겟 3개를 0.8초씩 맞춰주세요.",
      high: "타겟을 눈으로 바라보며 고개를 움직이세요. 타겟 4개를 1초씩 정확히 맞춰주세요.",
    },
    trackingType: "FACE_EYE",
  },
  {
    id: "neck-stretch",
    title: "목 스트레칭",
    guideText: {
      low: "목을 좌우로 기울여 0.7초간 유지해주세요. 1세트만 완료하면 끝나요.",
      medium: "목을 좌우로 기울여 1초간 유지해주세요.",
      high: "목을 좌우로 기울여 1.3초간 유지해주세요. 2세트 반복해주세요.",
    },
    trackingType: "POSE",
  },
  {
    id: "shoulder-pmr",
    title: "어깨 스트레칭",
    guideText: {
      low: "어깨를 으쓱 올려 0.7초간 유지해주세요. 2회만 반복하면 완료돼요.",
      medium: "어깨를 으쓱 올려 1초간 유지해주세요.",
      high: "어깨를 으쓱 올려 1.3초간 유지해주세요. 3회 반복해주세요.",
    },
    trackingType: "POSE",
  },
  {
    id: "focus-pinch",
    title: "크기 맞추기",
    guideText: {
      low: "손을 벌리고 좁혀 고리 크기에 맞춰보세요. 여유있게 맞춰도 돼요. 2회면 완료돼요.",
      medium: "손을 벌리고 좁혀 고리 크기에 맞춰보세요. 3회 반복해주세요.",
      high: "손을 벌리고 좁혀 고리 크기를 정확히 맞춰 2.5초간 유지해주세요. 4회 반복해주세요.",
    },
    trackingType: "HAND",
  },
  {
    id: "wakeup-sunrise",
    title: "입 크게 벌리기",
    guideText: {
      low: "입을 크게 벌려 햇살을 끌어올렸다가, 다물어 퍼뜨려보세요. 3회면 완료돼요.",
      medium: "입을 크게 벌려 햇살을 끌어올렸다가, 다물어 퍼뜨려보세요. 5회 반복해주세요.",
      high: "입을 최대한 크게 벌려 햇살을 끌어올렸다가, 다물어 퍼뜨려보세요. 7회 반복해주세요.",
    },
    trackingType: "FACE_EYE",
  },
];

// 마지막 세션(wakeup-sunrise) 다음은 난이도 구분이 없는 심호흡 세션으로 이어진다.
const FINAL_NEXT_PATH = "/breathroutine";

// baseId + 난이도로 실제 페이지 id를 만든다 (예: "eye-blink" + "low" -> "eye-blink-low")
export const sessionIdFor = (baseId, difficulty) => `${baseId}-${difficulty}`;

// 세션 순서 x 난이도(하/중/상) 조합마다 별도의 페이지 id/경로를 갖는 세션 데이터를 생성한다.
// 예: eye-blink-low, eye-blink-medium, eye-blink-high, eye-tracking-low, ...
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
      guideText: base.guideText[difficulty],
      trackingType: base.trackingType,
      nextSessionPath,
    };
  });
});

// SESSION.nextSessionPath("/eye-tracking-medium" 등)로부터 해당 세션이 쓰는 MediaPipe 트래킹
// 타입을 조회. 세션 전환 시 다음 모델을 미리 로드(preload)할 때 사용
// (일치하는 세션이 없으면 null - 예: 심호흡 세션은 카메라 미사용)
export const getTrackingTypeForPath = (path) => {
  const session = Object.values(ROUTINE_SESSIONS).find((item) => `/${item.id}` === path);
  return session?.trackingType ?? null;
};
