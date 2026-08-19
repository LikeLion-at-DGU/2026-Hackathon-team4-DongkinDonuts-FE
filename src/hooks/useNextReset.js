import { useCallback, useEffect, useState } from "react";
import { getNextResetTime } from "../api/plans";

function formatClock(date) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function formatCountdown(ms) {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const ss = String(totalSeconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

// 다음 회복 슬롯("다음 리셋 시간") 조회 + 1초마다 카운트다운 갱신.
// GET /plans/recovery-slots/next-reset-time/ 가 404(오늘 예정된 슬롯 없음)면
// hasPlan=false로 내려주고, 화면은 "아직 계획이 없어요" 같은 안내를 보여주면 된다.
export function useNextReset() {
    const [nextResetAt, setNextResetAt] = useState(null);
    const [isOverdue, setIsOverdue] = useState(false);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => new Date());

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getNextResetTime();
            if (result) {
                setNextResetAt(new Date(result.next_reset_time));
                setIsOverdue(result.is_overdue);
            } else {
                setNextResetAt(null);
                setIsOverdue(false);
            }
        } catch (error) {
            console.error("다음 리셋 시간 조회 실패:", error);
            setNextResetAt(null);
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
        resetTimeLabel: nextResetAt ? formatClock(nextResetAt) : "--:--",
        countdownLabel: nextResetAt ? formatCountdown(nextResetAt.getTime() - now.getTime()) : "--:--",
        isOverdue,
        refresh,
    };
}
