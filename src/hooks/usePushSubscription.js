import { useEffect } from "react";
import { getVapidPublicKey, createWebPushSubscription } from "../api/plans";

// PushManager.subscribe()의 applicationServerKey는 Uint8Array를 요구하는데,
// 백엔드는 base64url(패딩 없음) 문자열로 내려준다 — 표준 변환.
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

// 탭이 백그라운드에서 오래 방치되거나 아예 닫혀 있어도 회복 타이머 알림이 오게
// 하려는 서비스워커 기반 진짜 Web Push 구독. useNextReset.js의 클라이언트 타이머
// 알림(탭이 열려있고 JS가 살아있을 때만 동작)과 별개로, 이건 서버가 실제로
// 브라우저 푸시 서비스에 메시지를 쏴주는 방식이라 탭 상태와 무관하게 동작한다.
//
// 지원 안 하는 브라우저(구형 Safari 등)나 권한을 거부한 경우엔 조용히 아무것도
// 안 한다 — 클라이언트 타이머 알림이 그 경우의 최소한의 대안으로 남아있다.
export function usePushSubscription() {
    useEffect(() => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            return;
        }

        let cancelled = false;

        const setup = async () => {
            try {
                const registration = await navigator.serviceWorker.register(
                    "/service-worker.js"
                );

                if (Notification.permission === "default") {
                    const permission = await Notification.requestPermission();
                    if (permission !== "granted") return;
                } else if (Notification.permission !== "granted") {
                    return;
                }

                let subscription = await registration.pushManager.getSubscription();

                if (!subscription) {
                    const { public_key: vapidPublicKey } = await getVapidPublicKey();
                    if (!vapidPublicKey) return;

                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                    });
                }

                if (cancelled) return;

                const { endpoint, keys } = subscription.toJSON();
                await createWebPushSubscription({
                    endpoint,
                    keys,
                    userAgent: navigator.userAgent,
                });
            } catch (error) {
                console.error("Web Push 구독 등록 실패:", error);
            }
        };

        setup();

        return () => {
            cancelled = true;
        };
    }, []);
}
