// 세션 페이지를 넘나들 때, 방금 떠난 페이지가 stop()한 카메라 장치를 OS/드라이버가 아직
// 완전히 반납하지 않은 찰나에 다음 페이지가 getUserMedia()를 부르면 장치를 점유하지 못해
// AbortError("Timeout starting video source")나 NotReadableError로 실패하는 경우가 있다.
// 이런 종류는 아주 잠깐 뒤에 다시 시도하면 대부분 성공하므로 재시도 대상으로 삼는다. 반면
// 권한 거부(NotAllowedError)나 카메라 자체가 없는 경우(NotFoundError)는 다시 시도해도 똑같이
// 실패할 게 뻔하므로 곧바로 포기한다.
const isTransientCameraError = (err) => err?.name === "AbortError" || err?.name === "NotReadableError";
const CAMERA_RETRY_DELAYS_MS = [300, 800];

export const getUserMediaWithRetry = async (constraints) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (!isTransientCameraError(err) || attempt >= CAMERA_RETRY_DELAYS_MS.length) throw err;
      await new Promise((resolve) => setTimeout(resolve, CAMERA_RETRY_DELAYS_MS[attempt]));
    }
  }
};
