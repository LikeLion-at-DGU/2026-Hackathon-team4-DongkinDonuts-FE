import apiClient from "./client";

/**
 * 다음 리셋 시간 조회.
 * 오늘 활성 회복 계획에 예정된 슬롯이 없으면 404가 나는데,
 * 그 경우 null을 반환해서 호출부가 "아직 계획 없음" 상태를 그리기 쉽게 한다.
 */
export async function getNextResetTime() {
  try {
    return await apiClient.get(
      "/plans/recovery-slots/next-reset-time/"
    );
  } catch (error) {
    if (error?.code === "NotFound") {
      return null;
    }

    throw error;
  }
}

/**
 * 오늘 활성 회복 계획에 포함된 슬롯 목록 조회.
 */
export function getTodayRecoverySlots() {
  return apiClient.get("/plans/recovery-slots/today/");
}

/**
 * 현재 가장 먼저 수행할 회복 슬롯 상세 조회.
 */
export function getNextRecoverySlot() {
  return apiClient.get("/plans/recovery-slots/next/");
}

/**
 * 특정 회복 슬롯 상세 조회.
 */
export function getRecoverySlot(slotId) {
  return apiClient.get(`/plans/recovery-slots/${slotId}/`);
}

/**
 * AI 기반 오늘의 회복 계획 생성
 *
 * contextSnapshot, nextActivityPlan을 생략하면
 * 백엔드가 오늘 생성된 최신 값을 사용한다.
 *
 * useAiDecision: My Digital State에서 PC 사용 패턴을 입력하고 "생성"을 눌렀을
 * 때만 true로 보낸다 — 그때만 백엔드가 실제 LLM(개수/시각 자율 판단)을 시도하고,
 * 그 외(상태 선택 모달로 진행하는 "회복 루틴 시작하기" 등)는 기본값 false로
 * 원래의 서버 정책 엔진 로직만 탄다.
 */
export function generateAIRecoveryPlan({
  contextSnapshot,
  nextActivityPlan,
  notificationEnabled = true,
  useAiDecision = false,
} = {}) {
  const body = {
    notification_enabled: notificationEnabled,
    use_ai_decision: useAiDecision,
  };

  if (contextSnapshot) {
    body.context_snapshot = contextSnapshot;
  }

  if (nextActivityPlan) {
    body.next_activity_plan = nextActivityPlan;
  }

  return apiClient.post(
    "/plans/recovery-plans/today/ai-generate/",
    body
  );
}

/**
 * 특정 회복 슬롯의 예정 시간 변경.
 * scheduledAt은 ISO 8601 문자열이어야 한다.
 */
export function updateRecoverySlotSchedule(
  slotId,
  scheduledAtIso
) {
  return apiClient.patch(
    `/plans/recovery-slots/${slotId}/schedule/`,
    {
      scheduled_at: scheduledAtIso,
    }
  );
}

/**
 * 특정 회복 슬롯의 웹 알림 on/off + 반복 규칙 변경
 */
export function updateRecoverySlotNotification(
  slotId,
  {
    notificationEnabled,
    repeatRule = "",
  }
) {
  return apiClient.patch(
    `/plans/recovery-slots/${slotId}/notification/`,
    {
      notification_enabled: notificationEnabled,
      repeat_rule: repeatRule,
    }
  );
}

/**
 * 활성 활동 구간에 서비스로 재진입했을 때 즉시 수행할 회복 슬롯 생성.
 * 알림은 만들지 않고, 백엔드에서 가장 가까운 미래 상태 기반 알림 1개만 취소한다.
 */
export function createReentryRecoverySlot({
  contextSnapshot,
  nextActivityPlan,
} = {}) {
  return apiClient.post(
    "/plans/recovery-slots/reentry/",
    {
      context_snapshot: contextSnapshot,
      next_activity_plan: nextActivityPlan,
    }
  );
}

/**
 * PushManager.subscribe()에 넘길 applicationServerKey(VAPID 공개키) 조회.
 * 공개키라 노출돼도 문제없음 — 개인정보 아님.
 */
export function getVapidPublicKey() {
  return apiClient.get("/plans/notification-subscriptions/vapid-public-key/");
}

/**
 * 브라우저 Web Push 구독 등록. subscription.toJSON()의 endpoint/keys를 그대로 보낸다.
 */
export function createWebPushSubscription({ endpoint, keys, userAgent = "" }) {
  return apiClient.post("/plans/notification-subscriptions/", {
    endpoint,
    keys,
    user_agent: userAgent,
  });
}

/**
 * 특정 날짜의 회복 슬롯 기록("Your History" 표) 조회.
 * date는 "YYYY-MM-DD" 문자열이어야 한다.
 */
export function getRecoverySlotHistory(date) {
  return apiClient.get("/plans/recovery-slots/history/", {
    params: { date },
  });
}
