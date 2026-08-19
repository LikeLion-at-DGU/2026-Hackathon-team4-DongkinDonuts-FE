// 회복 타이머 종료 웹 푸시 알림을 받아서 보여주고, 클릭 시 앱으로 돌아가게 하는
// 서비스워커. 탭이 백그라운드에서 오래 방치되거나(브라우저가 재우거나) 아예 닫혀
// 있어도 독립적으로 동작한다 — 페이지 안에서 직접 new Notification()을 쓰는
// 방식(useNextReset.js)은 그 탭의 JS가 살아있어야만 동작해서 오래 기다리면
// 놓치는 문제가 있었는데, 서비스워커는 그 문제가 없다.

self.addEventListener("push", (event) => {
  let payload = { title: "Brainfit", body: "" };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (_error) {
      payload = { title: "Brainfit", body: event.data.text() };
    }
  }

  const title = payload.title || "Brainfit";
  const options = {
    body: payload.body || "",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            if ("navigate" in client) {
              client.navigate(targetUrl).catch(() => {});
            }
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});
