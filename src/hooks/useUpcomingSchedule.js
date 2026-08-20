import { useCallback, useEffect, useState } from "react";

import {
    getRecoverySlotHistory,
    updateRecoverySlotNotification,
} from "../api/plans";
import { formatDateParam } from "../utils/dateUtils";

function todayDateParam() {
    return formatDateParam(new Date());
}

// 다른 컴포넌트(예: PC 사용 패턴 생성 흐름)에서 "오늘 예정된 일정이 바뀌었으니
// 다시 조회해줘"라고 알릴 때 쓰는 전역 이벤트. 두 트리가 서로 부모/자식 관계가
// 아니라서 그냥 콜백을 내려주기 어려운데, prop-drilling을 새로 만들지 않고도
// 신선한 상태를 유지하려고 가벼운 window 이벤트로 대신한다.
const SCHEDULE_UPDATED_EVENT = "brainfit:upcoming-schedule-updated";

export function notifyUpcomingScheduleChanged() {
    window.dispatchEvent(new Event(SCHEDULE_UPDATED_EVENT));
}

// "오늘의 추천 휴식 일정" 카드가 쓰는 데이터. PC 사용 패턴을 입력했는지와
// 완전히 무관하게, 오늘 실제로 "진행 예정"(아직 시작 전)인 회복 슬롯을
// History API에서 직접 조회한다 — "내 계획 다시 설정"으로만 계획을 만든
// 사용자도 이 카드를 볼 수 있어야 하기 때문이다.
export function useUpcomingSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [alarmStates, setAlarmStates] = useState({});
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);

        try {
            const result = await getRecoverySlotHistory(
                todayDateParam()
            );

            const slots = Array.isArray(result)
                ? result
                : result?.results ?? [];

            const upcoming = slots.filter(
                (slot) =>
                    slot.history_status_label === "진행 예정"
            );

            setSchedules(upcoming);

            setAlarmStates(
                Object.fromEntries(
                    upcoming.map((slot) => [
                        slot.id,
                        slot.notification_enabled ?? false,
                    ])
                )
            );
        } catch (error) {
            console.error(
                "오늘의 추천 휴식 일정 조회 실패:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        window.addEventListener(
            SCHEDULE_UPDATED_EVENT,
            refresh
        );

        return () => {
            window.removeEventListener(
                SCHEDULE_UPDATED_EVENT,
                refresh
            );
        };
    }, [refresh]);

    const toggleAlarm = async (slotId) => {
        const current = alarmStates[slotId] ?? false;
        const next = !current;

        setAlarmStates((prev) => ({
            ...prev,
            [slotId]: next,
        }));

        try {
            const slot = schedules.find(
                (item) => item.id === slotId
            );

            await updateRecoverySlotNotification(slotId, {
                notificationEnabled: next,
                repeatRule: slot?.repeat_rule ?? "",
            });
        } catch (error) {
            console.error(
                "알림 설정 변경 실패:",
                error
            );

            setAlarmStates((prev) => ({
                ...prev,
                [slotId]: current,
            }));
        }
    };

    return {
        schedules,
        alarmStates,
        loading,
        toggleAlarm,
        refresh,
    };
}
