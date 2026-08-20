import { useEffect, useState } from "react";
import { getRecoverySlotHistory } from "../api/plans";
import { formatDateParam } from "../utils/dateUtils";

// recommended_routines에는 슬롯 하나당 Wake/Shift/Reset 3개가 다 들어있는데, 개인화가
// 실제로 적용되는 건 Brain Shift 하나뿐이라 표에는 그것만 대표로 보여준다.
function pickShiftRoutineName(routines) {
    const shift = (routines ?? []).find(
        (routine) => routine.stage_type === "BRAIN_SHIFT"
    );
    return shift?.activity?.name ?? null;
}

// "코딩 / 피곤함"처럼 이후 활동 태그와 그 순간 상태를 슬래시로 이어 붙인다.
function buildActivityLabel(contextSnapshotDetail, nextActivityPlanDetail) {
    const stateLabels = (contextSnapshotDetail?.state_options ?? []).map(
        (state) => state.label
    );
    const activityNames = (nextActivityPlanDetail?.activity_tags ?? []).map(
        (tag) => tag.name
    );

    return `${activityNames.join(", ")} / ${stateLabels.join(", ")}`;
}

// "Your History" 표(YourHistory.jsx) 데이터. GET /plans/recovery-slots/history/를
// 그대로 표에 필요한 형태로 가공한다. date가 바뀔 때마다 다시 조회한다.
export function useHistoryData(date) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(null);

        getRecoverySlotHistory(formatDateParam(date))
            .then((result) => {
                if (cancelled) return;

                const slots = Array.isArray(result)
                    ? result
                    : (result?.results ?? []);

                // "진행 예정"(아직 시작 전인 미래 알림)은 여기(Your History)가 아니라
                // "오늘의 추천 휴식 일정" 카드에 뜬다 — History에는 이미 지나간/끝난
                // 기록(완료·취소·진행중·미완료)만 남긴다.
                const pastOrActiveSlots = slots.filter(
                    (slot) => slot.history_status_label !== "진행 예정"
                );

                setRows(
                    pastOrActiveSlots.map((slot) => ({
                        id: slot.id,
                        time: slot.start_time ?? "--:--",
                        activity: buildActivityLabel(
                            slot.context_snapshot_detail,
                            slot.next_activity_plan_detail
                        ),
                        routine: pickShiftRoutineName(
                            slot.recommended_routines
                        ),
                        status: slot.history_status_label,
                        remark: slot.remark,
                    }))
                );
            })
            .catch((fetchError) => {
                if (cancelled) return;

                console.error("사용 기록 조회 실패:", fetchError);
                setError(fetchError);
                setRows([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [date]);

    return { rows, loading, error };
}
