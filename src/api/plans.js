import apiClient from "./client";

/**
 * 다음 리셋 시간 조회. 오늘 활성 회복 계획에 예정된 슬롯이 없으면 404가 나는데,
 * 그 경우 null을 반환해서 호출부가 "아직 계획 없음" 상태를 그리기 쉽게 한다.
 */
export async function getNextResetTime() {
  try {
    return await apiClient.get("/plans/recovery-slots/next-reset-time/");
    // -> { recovery_slot, next_reset_time, is_overdue }
  } catch (error) {
    if (error?.code === "NotFound") {
      return null;
    }
    throw error;
  }
}

export function generateAIRecoveryPlan(notificationEnabled = true) {
  return apiClient.post("/plans/recovery-plans/today/ai-generate/", {
    notification_enabled: notificationEnabled,
  });
}

/** 특정 회복 슬롯의 예정 시간 변경. scheduledAt은 ISO 8601 문자열이어야 한다. */
export function updateRecoverySlotSchedule(slotId, scheduledAtIso) {
  return apiClient.patch(`/plans/recovery-slots/${slotId}/schedule/`, {
    scheduled_at: scheduledAtIso,
  });
}

/** 특정 회복 슬롯의 웹 알림 on/off + 반복 규칙 변경. */
export function updateRecoverySlotNotification(slotId, { notificationEnabled, repeatRule = "" }) {
  return apiClient.patch(`/plans/recovery-slots/${slotId}/notification/`, {
    notification_enabled: notificationEnabled,
    repeat_rule: repeatRule,
  });
}
