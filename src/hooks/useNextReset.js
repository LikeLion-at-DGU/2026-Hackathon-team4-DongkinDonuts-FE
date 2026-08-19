import { useCallback, useEffect, useState } from "react";
import { getNextResetTime } from "../api/plans";

function formatClock(date) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function formatCountdown(ms) {
    if (ms <= 0) return "00:00";

    const totalSeconds =
        Math.floor(ms / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    // 1시간 이상 남았을 때
    if (hours > 0) {
        return `${hh}:${mm}:${ss}`;
    }

    // 1시간 미만
    return `${mm}:${ss}`;
}

// 다음 회복 슬롯("다음 리셋 시간") 조회 + 1초마다 카운트다운 갱신.
// GET /plans/recovery-slots/next-reset-time/ 가 404(오늘 예정된 슬롯 없음)면
// hasPlan=false로 내려주고, 화면은 "아직 계획이 없어요" 같은 안내를 보여주면 된다.
export function useNextReset() {
    const [nextResetAt, setNextResetAt] = useState(null);
    const [recoverySlotId, setRecoverySlotId] = useState(null);
    const [isOverdue, setIsOverdue] = useState(false);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => new Date());

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getNextResetTime();
            if (result) {
                setNextResetAt(new Date(result.next_reset_time));
                setRecoverySlotId(result.recovery_slot);
                setIsOverdue(result.is_overdue);
            } else {
                setNextResetAt(null);
                setRecoverySlotId(null);
                setIsOverdue(false);
            }
        } catch (error) {
            console.error("다음 리셋 시간 조회 실패:", error);
            setNextResetAt(null);
            setRecoverySlotId(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return {
        loading,
        hasPlan: nextResetAt !== null,
        recoverySlotId,
        resetTimeLabel: nextResetAt ? formatClock(nextResetAt) : "--:--",
        countdownLabel: nextResetAt ? formatCountdown(nextResetAt.getTime() - now.getTime()) : "--:--",
        isOverdue,
        refresh,
    };
}
