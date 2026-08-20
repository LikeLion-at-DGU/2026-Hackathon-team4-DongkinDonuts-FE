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
 * 정책 기반 오늘의 회복 계획 생성.
 *
 * contextSnapshot, nextActivityPlan을 생략하면 백엔드가 오늘 생성된 최신 값을 사용한다.
 * URL은 기존 호환을 위해 /ai-generate/를 유지하지만, 서버 내부에서는 LLM을 호출하지 않는다.
 */
export function generateRecoveryPlan({
  contextSnapshot,
  nextActivityPlan,
  notificationEnabled = true,
} = {}) {
  const body = {
    notification_enabled: notificationEnabled,
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

export const generateAIRecoveryPlan = generateRecoveryPlan;

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
 * 특정 회복 슬롯 취소.
 *
 * 백엔드 cancel_slot이 연결된 대기 알림도 CANCELED로 동기화한다.
 */
export function cancelRecoverySlot(slotId) {
  return apiClient.post(
    `/plans/recovery-slots/${slotId}/cancel/`
  );
}

/**
 * 선택한 시간 이전의 스냅샷 기반 회복 슬롯을 일괄 취소한다.
 * 빈도 기반 슬롯은 백엔드에서 제외한다.
 */
export function cancelSnapshotRecoverySlotsBefore({
  before,
  excludeSlot = null,
}) {
  return apiClient.post(
    "/plans/recovery-slots/cancel-before/",
    {
      before,
      exclude_slot: excludeSlot,
    }
  );
}

/**
 * 서비스 재진입 시 가장 가까운 미래 스냅샷 기반 알림 1개를 소비 처리한다.
 */
export function consumeNearestSnapshotRecoverySlot() {
  return apiClient.post(
    "/plans/recovery-slots/consume-nearest-snapshot/"
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
