export const ROUTINE_SESSIONS = {
  "eye-blink": {
    id: "eye-blink",
    title: "지그시 눈 깜빡이기",
    guideText: "눈을 2초간 감았다가 떠주세요. (3회 반복)",
    trackingType: "FACE_EYE",
    nextSessionPath: "/eye-tracking",
  },
  "eye-tracking": {
    id: "eye-tracking",
    title: "타겟 바라보기",
    guideText: "타겟을 눈으로 바라보며 고개를 움직이세요.",
    trackingType: "FACE_EYE",
    nextSessionPath: "/neck-stretch",
  },
  "neck-stretch": {
    id: "neck-stretch",
    title: "목 스트레칭",
    guideText: "목을 좌우로 기울려 1초간 유지해주세요.",
    trackingType: "POSE",
    nextSessionPath: "/shoulder-pmr",
  },
  "shoulder-pmr": {
    id: "shoulder-pmr",
    title: "어깨 스트레칭",
    trackingType: "POSE",
    nextSessionPath: "/focus-pinch",
  },
  "focus-pinch": {
    id: "focus-pinch",
    title: "크기 맞추기",
    guideText: "양손을 벌리고 좁혀 고리 크기에 맞춰보세요.",
    trackingType: "HAND",
    nextSessionPath: "/wakeup-sunrise",
  },
  "wakeup-sunrise": {
    id: "wakeup-sunrise",
    title: "입 크게 벌리기",
    guideText: "입을 크게 벌려 햇살을 끌어올렸다가, 다물어 온몸 가득 퍼뜨려보세요.",
    trackingType: "FACE_EYE",
    nextSessionPath: "/breathroutine",
  },
};

// SESSION.nextSessionPath("/eye-tracking" 등)로부터 해당 세션이 쓰는 MediaPipe 트래킹 타입을 조회.
// 세션 전환 시 다음 모델을 미리 로드(preload)할 때 사용 (일치하는 세션이 없으면 null - 예: 심호흡 세션은 카메라 미사용)
export const getTrackingTypeForPath = (path) => {
  const session = Object.values(ROUTINE_SESSIONS).find((item) => `/${item.id}` === path);
  return session?.trackingType ?? null;
};