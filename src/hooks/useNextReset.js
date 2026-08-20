import { useCallback, useEffect, useRef, useState } from "react";
import { getNextResetTime } from "../api/plans";

// 별도 오디오 파일 없이 WebAudio로 짧은 삐 소리를 낸다. 브라우저 자동재생 정책상
// 사용자가 페이지와 한 번도 상호작용하지 않았으면 소리가 안 날 수 있는데, 그건
// 브라우저 제약이라 어쩔 수 없다(화면 표시는 그대로 됨).
function playBeep() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.6);
        oscillator.onended = () => ctx.close();
    } catch (error) {
        console.error("알림음 재생 실패:", error);
    }
}

// 권한이 이미 허용돼 있으면 브라우저 시스템 알림 팝업도 띄운다(탭이 백그라운드여도 뜸).
// 권한이 없거나(default/denied) 브라우저가 Notification API를 지원 안 하면 조용히 넘어간다.
// onClick을 주면, 알림 팝업을 클릭했을 때 이 탭으로 포커스를 옮기고 그 콜백을 실행한다.
function showBrowserNotification(message, onClick) {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    try {
        const notification = new Notification("Brainfit", { body: message });
        if (onClick) {
            notification.onclick = () => {
                window.focus();
                onClick();
                notification.close();
            };
        }
    } catch (error) {
        console.error("브라우저 알림 표시 실패:", error);
    }
}

// "이미 이 (슬롯, 목표시각)에 대해 알람을 울렸다"는 걸 새로고침해도 기억하기 위한
// localStorage 키. useRef만으로는 F5 한 번에 기억이 날아가서, 슬롯이 여전히
// 지나있으면 방금 울렸던 알람이 새로고침할 때마다 계속 다시 울리는 문제가 있었다.
const ALERTED_KEY_STORAGE_KEY = "brainfit_alerted_slot_key";

function readAlertedKey() {
    try {
        return window.localStorage.getItem(ALERTED_KEY_STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeAlertedKey(key) {
    try {
        window.localStorage.setItem(ALERTED_KEY_STORAGE_KEY, key);
    } catch {
        // localStorage 접근 불가(프라이빗 모드 등)면 그냥 이번 탭 안에서만 못 기억함
    }
}

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
// onAlertClick: 카운트다운 종료 알림(브라우저 알림 팝업)을 클릭했을 때 실행할 콜백.
// 보통 회복 루틴 시작 페이지로 이동시키는 용도로 넘긴다(예: () => navigate("/handroutine")).
export function useNextReset(onAlertClick) {
    const [nextResetAt, setNextResetAt] = useState(null);
    const [recoverySlotId, setRecoverySlotId] = useState(null);
    const [isOverdue, setIsOverdue] = useState(false);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => new Date());

    // 이번 (슬롯, 목표시각) 조합에 대해 이미 알람을 울렸는지 — 카운트다운이 0
    // 밑으로 내려간 뒤에도 1초마다 계속 렌더링되니, 한 번만 울리게 막는다.
    // recoverySlotId만으로 키를 잡으면, "시간 변경하기"로 같은 슬롯의 목표시각만
    // 바뀌었을 때(슬롯 id는 그대로) 재알림이 안 울리는 버그가 생겨서 시각도 같이 키에 넣는다.
    // localStorage에서 초기값을 읽어와서, F5로 새로고침해도(useRef만 쓰면 새로고침
    // 때마다 리셋돼서 이미 지나간 슬롯의 알람이 계속 다시 울리는 문제가 있었음)
    // 이미 울린 알람은 기억한다.
    const alertedKeyRef = useRef(readAlertedKey());

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

    // 탭이 열려있는 동안, 카운트다운이 0이 되는 순간 딱 한 번 알림음을 준다(서버
    // 푸시 아니라 클라이언트 타이머 기반 — 탭 닫으면 안 옴).
    //
    // 브라우저 알림 팝업(showBrowserNotification)은 usePushSubscription()의 진짜
    // Web Push 구독이 이미 있으면 건너뛴다 — 원래 이건 "Push 구독이 안 되는
    // 브라우저/권한 거부 상황의 최소 대안"으로 만든 건데, Notification.permission만
    // 보고 구독 여부는 안 따져서 최신 브라우저에서는 서버 푸시 알림("회복 세션
    // 알림")과 이 팝업이 항상 같이 떠서 알림이 중복으로 두 번 나오는 문제가 있었다.
    useEffect(() => {
        if (!nextResetAt || !recoverySlotId) return;
        if (now.getTime() < nextResetAt.getTime()) return;

        const key = `${recoverySlotId}-${nextResetAt.getTime()}`;
        if (alertedKeyRef.current === key) return;

        alertedKeyRef.current = key;
        writeAlertedKey(key);
        playBeep();

        (async () => {
            try {
                if ("serviceWorker" in navigator && "PushManager" in window) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    const subscription = await registration?.pushManager.getSubscription();
                    // 활성 Push 구독이 있으면 서버가 이미 "회복 세션 알림"을 보내주니
                    // 여기서 또 띄우면 중복이다.
                    if (subscription) return;
                }
            } catch {
                // 구독 여부 확인 자체가 실패하면, 안전하게 폴백 알림을 띄운다.
            }

            showBrowserNotification("회복 타이머가 끝났어요. 잠깐 쉬어갈까요?", onAlertClick);
        })();
    }, [now, nextResetAt, recoverySlotId, onAlertClick]);

    // 계획이 생기는 시점에 자연스럽게 알림 권한을 한 번 물어본다(이미 허용/거부된
    // 상태면 다시 안 물어봄 — Notification.permission이 "default"일 때만).
    useEffect(() => {
        if (!recoverySlotId) return;
        if (typeof Notification === "undefined") return;
        if (Notification.permission === "default") {
            Notification.requestPermission().catch(() => {});
        }
    }, [recoverySlotId]);

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
