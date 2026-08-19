export const TRACKING_CONFIG = {
  // 눈 깜빡임 (EAR: Eye Aspect Ratio, 양쪽 눈 평균)
  earClosedThreshold: 0.21,
  blinkHoldMs: 1000,

  // 시선 추적 (iris 위치를 눈 크기 기준 0~1 비율로 정규화한 값)
  gazeSensitivity: 6,
  gazeTolerance: 0.35,

  // 입 벌림 (MAR: Mouth Aspect Ratio)
  mouthOpenRatioThreshold: 0.5,

  // 얼음 깨기: 입 중심과 얼음 중심 사이 정규화 거리(0~1)가 이 값 이내여야 성공
  // (얼음 렌더 반경이 min(w,h)*0.1 ≈ 정규화 0.1이므로, 약 1.6배 여유를 둔 히트박스)
  iceHitRadius: 0.16,

  // 목 기울기: 세션 시작 시 캘리브레이션한 기준각 대비 변화량(deg)
  calibrationFrames: 20,
  neckTiltDeltaThresholdDeg: 8,

  // 어깨 으쓱: 기준값(귀-어깨 거리/어깨너비) 대비 이 비율만큼 줄어들면 으쓱으로 인정
  shoulderRaiseDropRatio: 0.12,

  // 엄지-검지 핀치 거리(정규화 좌표) -> 핀치 링 크기(%)
  pinchDistMin: 0.03,
  pinchDistMax: 0.22,
  pinchMatchTolerancePercent: 12,
  pinchHoldMs: 2000,
};
