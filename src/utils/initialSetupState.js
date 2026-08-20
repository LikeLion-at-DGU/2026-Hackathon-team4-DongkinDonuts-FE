const INITIAL_SETUP_SEEN_STORAGE_KEY = "hasSeenSetupModal";

export const SKIP_SETUP_HOME_STATE = {
  skipSetup: true,
};

export function markInitialSetupHandled() {
  try {
    sessionStorage.setItem(INITIAL_SETUP_SEEN_STORAGE_KEY, "true");
  } catch {
    // sessionStorage를 쓸 수 없는 환경이면 이번 진입만 state로 막는다.
  }
}

export function hasInitialSetupBeenHandled() {
  try {
    return sessionStorage.getItem(INITIAL_SETUP_SEEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
