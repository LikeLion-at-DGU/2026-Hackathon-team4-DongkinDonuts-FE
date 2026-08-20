// 여러 세션 페이지(눈 깜빡이기 -> 목 스트레칭 -> ...)를 이동하며 이어지는 "지속 시간"을
// sessionStorage에 보관한다. 세션 페이지는 라우트 이동마다 컴포넌트가 통째로 언마운트/마운트되므로
// React state만으로는 지속 시간을 이어갈 수 없다. 홈(LandingPage)으로 돌아오면(완료 또는 종료)
// clearPersistedElapsedSeconds로 초기화된다.
const STORAGE_KEY = "activeRoutineElapsedSeconds";

export const getPersistedElapsedSeconds = () => {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number(stored) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const savePersistedElapsedSeconds = (seconds) => {
  sessionStorage.setItem(STORAGE_KEY, String(seconds));
};

export const clearPersistedElapsedSeconds = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
