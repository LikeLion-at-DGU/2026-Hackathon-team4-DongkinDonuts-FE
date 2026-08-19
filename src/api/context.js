import apiClient from "./client";

// SetupModal에서 쓰는 한글 라벨(디자인 목업 텍스트) ↔ 백엔드 StateOption.code 매핑.
// GET /common/state-options/ 응답의 label과 표기가 살짝 달라서(예: "눈이 피로해요" vs
// "눈이 피곤해요") 문자열 비교 대신 명시적으로 순서를 맞춰 매핑한다.
export const CONDITION_LABEL_TO_STATE_CODE = {
  "눈이 피로해요": "EYE_TIRED",
  "목과 어깨가 굳었어요": "BODY_STIFF",
  "집중이 안 돼요": "LOW_FOCUS",
  "머리가 멍하고 졸려요": "SLEEPY",
  "아직 괜찮아요": "OKAY",
};

// 활동 태그는 고정 카탈로그가 아니라 없는 코드가 오면 자동으로 커스텀 태그가
// 생성되므로(get_or_create), 굳이 사전 정의된 코드로 강제 매핑하지 않고 "#" 접두사만
// 떼어서 그대로 code로 보낸다.
export function activityLabelToCode(label) {
  return label.replace(/^#/, "").trim();
}

// "30분" / "1시간" / "2시간" 같은 프리셋 또는 자유 입력("45분", "1시간 30분" 등)을
// expected_activity_minutes(정수, 분 단위)로 변환한다.
export function timeLabelToMinutes(label) {
  if (!label) return null;

  const hourMatch = label.match(/(\d+)\s*시간/);
  const minuteMatch = label.match(/(\d+)\s*분/);

  if (!hourMatch && !minuteMatch) {
    // "90" 처럼 숫자만 입력한 경우 그대로 분으로 취급
    const numeric = parseInt(label, 10);
    return Number.isNaN(numeric) ? null : numeric;
  }

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
  const total = hours * 60 + minutes;
  return total > 0 ? total : null;
}

/**
 * 오늘 등록된 상태 스냅샷 중 최신 1건 조회. 오늘 등록된 게 없으면 404가 나는데,
 * 그 경우 null을 반환한다("내 계획 다시 설정"에서 오늘 스냅샷이 있는지 미리
 * 확인할 때 씀 — 없으면 AI 생성이 "오늘의 상태 스냅샷이 필요합니다"로 항상
 * 실패하기 때문).
 */
export async function getTodayContextSnapshot() {
  try {
    return await apiClient.get("/context/context-snapshots/today/");
  } catch (error) {
    if (error?.code === "NotFound") {
      return null;
    }
    throw error;
  }
}

/**
 * "지금 내 상태" 스냅샷 생성. SetupModal 1단계(상태 선택) 결과를 보낸다.
 * @param {string[]} stateCodes - StateOption.code 배열 (예: ["EYE_TIRED"])
 * @param {string} [note]
 */
export function createContextSnapshot(stateCodes, note = "") {
  return apiClient.post("/context/context-snapshots/", {
    state_options: stateCodes,
    note,
  });
}

/**
 * "앞으로의 활동/시간" 계획 생성. SetupModal 2단계 결과를 보낸다.
 * @param {object} params
 * @param {string[]} [params.activityTags] - ActivityTag.code 배열
 * @param {number|null} [params.expectedActivityMinutes]
 * @param {string|null} [params.contextSnapshotId] - 같은 온보딩 흐름에서 방금 만든 스냅샷과 연결
 */
export function createNextActivityPlan({
  activityTags = [],
  expectedActivityMinutes = null,
  contextSnapshotId = null,
} = {}) {
  return apiClient.post("/context/next-activity-plans/", {
    activity_tags: activityTags,
    expected_activity_minutes: expectedActivityMinutes,
    context_snapshot: contextSnapshotId,
  });
}

/**
 * 오늘 등록된 이후 활동 계획 중 최신 1건 조회. 오늘 등록된 게 없으면 404가 나는데,
 * 그 경우 null을 반환한다.
 */
export async function getTodayNextActivityPlan() {
  try {
    return await apiClient.get("/context/next-activity-plans/today/");
  } catch (error) {
    if (error?.code === "NotFound") {
      return null;
    }
    throw error;
  }
}

/**
 * AI 회복 계획 생성(POST /plans/recovery-plans/today/ai-generate/)은 오늘 날짜의
 * 상태 스냅샷 + 이후 활동 계획이 "둘 다" 이미 있어야만 성공한다(하나라도 없으면
 * 백엔드가 ValidationError로 거부). "내 계획 다시 설정"이나 "PC 사용 패턴으로
 * 휴식 타이머 생성"처럼, 정식 온보딩(SetupModal 1~2단계)을 거치지 않고도 AI
 * 생성을 트리거할 수 있는 진입점이 여러 곳이라, 그 앞에서 항상 이 함수를 먼저
 * 불러서 없는 것만 중립값으로 채워둔다.
 */
export async function ensureTodayGenerationInputs() {
  let contextSnapshot = await getTodayContextSnapshot();
  if (!contextSnapshot) {
    const fallbackStateCode = CONDITION_LABEL_TO_STATE_CODE["아직 괜찮아요"];
    contextSnapshot = await createContextSnapshot([fallbackStateCode]);
  }

  const nextActivityPlan = await getTodayNextActivityPlan();
  if (!nextActivityPlan) {
    await createNextActivityPlan({ contextSnapshotId: contextSnapshot.id });
  }
}
