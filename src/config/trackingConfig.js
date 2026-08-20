export const TRACKING_CONFIG = {
  // 눈 깜빡임 (EAR: Eye Aspect Ratio, 양쪽 눈 평균)
  earClosedThreshold: 0.21,

  // 눈 트래킹: 코끝/턱/광대 좌표로 산출한 머리 회전(Pitch/Yaw) 원시 비율을
  // 포인터 정규화 값(-1~1 기준, ±1.4로 clamp)으로 증폭하는 배율. 낮출수록 같은 화면 거리를
  // 이동하는 데 필요한 실제 고개 회전량이 커진다 — clamp 상한(1.4)과 pointerRange는 그대로 두고
  // 이 값만 낮추면, 포인터가 도달할 수 있는 최대 거리(= 1.4 × pointerRange)는 그대로 유지한 채
  // 그 거리에 닿기까지 필요한 고개 회전량만 늘어난다.
  headYawSensitivity: 0.46,
  // Pitch는 위/아래 방향의 원시 회전량 자체가 비대칭이라(고개를 젖히는 것보다 숙이는 쪽이
  // 좁게 감지됨) 방향별로 다른 배율을 둔다. headPitch가 양수(위)면 Up, 음수(아래)면 Down 적용.
  headPitchUpSensitivity: 0.85,
  headPitchDownSensitivity: 1.8,
  // 포인터가 프레임 간 튐 없이 부드럽게 유영하도록 하는 LERP 보간 계수 (낮을수록 느리고 차분하게 반응)
  headPoseSmoothing: 0.085,
  // 증폭+clamp된 머리 회전 값을 화면 좌표(0~1) 오프셋으로 변환하는 배율 (getSafeTargetPosition과
  // 같은 좌표계). 포인터가 도달 가능한 최대 거리(= 1.4 × 이 값)를 결정하므로, 타겟 스캔 반경
  // (0.20~0.32)을 여유 있게 덮도록 유지한다.
  pointerRangeX: 0.26,
  pointerRangeY: 0.24,
  // 온타겟 판정 반경(정확도)과 유지 시간(강도)은 세션 난이도에 따라 달라지므로 difficultyConfig.js로 옮겼다.

  // 입 벌림 (MAR: Mouth Aspect Ratio)
  mouthOpenRatioThreshold: 0.5,

  // 해 뜨기: 입 벌림 정도(MAR)를 상승도로 매핑하는 구간(강도)과 다물었을 때 성공으로 인정하는
  // 최소 상승도(정확도)는 세션 난이도에 따라 달라지므로 difficultyConfig.js로 옮겼다.
  // 상승도가 매 프레임 목표값에 다가가는 보간 비율(낮을수록 느리고 부드럽게 떠오름)
  sunriseRiseSmoothing: 0.04,
  // 입을 다문 순간부터 해가 중앙에 모여 화면이 밝아지기까지 걸리는 시간(ms)
  sunriseConvergeMs: 800,

  // 목 기울기: 세션 시작 시 캘리브레이션한 기준각 대비 변화량(deg). 표본 수가 너무 적으면
  // 카메라가 막 켜진 직후처럼 자세가 아직 안정되지 않은 구간의 소수 표본에도 기준각이
  // 쉽게 흔들리므로(median으로 완화하더라도) 여유 있게 잡는다.
  calibrationFrames: 30,
  // 인디케이터 표시 범위: 이 각도(deg)에서 막대가 트랙 끝까지 도달함 (그 이상은 clamp).
  // 목표 구간 상한(neckTargetMaxDeg=25)보다 여유를 넉넉히 둬야 사람이 그보다 더 크게(30~45°)
  // 기울여도 게이지가 끝에 박혀 "오버플로우"처럼 보이지 않는다.
  neckTiltMaxDeg: 45,
  // 인디케이터가 각도 변화를 따라가는 부드러움 정도(LERP 계수, 1에 가까울수록 즉각 반응).
  // 감지값이 프레임 사이에 크게 튀어도 막대가 순간이동하지 않고 관성 있게 따라가도록 낮게 유지한다.
  neckIndicatorSmoothing: 0.18,
  // 목표 각도 범위(정확도)와 유지 시간(강도)은 세션 난이도에 따라 달라지므로 difficultyConfig.js로 옮겼다.

  // 어깨 으쓱: normalizedShrugScore = (baseline 어깨 y - 현재 어깨 y) / 어깨너비.
  // "으쓱"으로 인정하는 임계값(정확도)과 유지 시간(강도)은 세션 난이도에 따라 달라지므로
  // difficultyConfig.js로 옮겼다. releaseThreshold는 그 임계값의 절반 아래로 떨어져야
  // "내렸다(release)"로 인정한다 (중간 구간은 히스테리시스로 흔들림 방지).

  // 다섯 손가락 끝(엄지·검지·중지·약지·새끼) 중 가장 멀리 떨어진 두 점 사이 거리(정규화 좌표)
  // -> 핀치 링 크기(%). 손을 오므릴수록 작고, 다섯 손가락을 활짝 펼수록 크다.
  pinchDistMin: 0.05,
  pinchDistMax: 0.40,
  // 목표 크기와의 허용 오차(정확도)와 유지 시간(강도)은 세션 난이도에 따라 달라지므로 difficultyConfig.js로 옮겼다.

  // 화면 거리 측정(useMultiTracking, useHandTracking 공통): 트래킹 타입별 크기 지표(손 = 손목-중지
  // MCP 거리, 얼굴 = 양쪽 광대 사이 거리, 포즈 = 어깨너비)가 far~near 구간이면 "적정", 그 밖이면
  // 너무 멀거나 가깝다고 판정한다.
  distanceUpdateInterval: 100,
  distanceLostMaxFrames: 15,
  handDistanceFar: 0.15,
  handDistanceNear: 0.32,
  handDistanceClose: 0.42,
  faceDistanceFar: 0.13,
  faceDistanceNear: 0.26,
  faceDistanceClose: 0.39,
  poseDistanceFar: 0.35,
  poseDistanceNear: 0.50,
  poseDistanceClose: 0.7,
};
