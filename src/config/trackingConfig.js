export const TRACKING_CONFIG = {
  // 눈 깜빡임 (EAR: Eye Aspect Ratio, 양쪽 눈 평균)
  earClosedThreshold: 0.21,
  blinkHoldMs: 1000,

  // 아이-지선 노디 스캔: 코끝/턱/광대 좌표로 산출한 머리 회전(Pitch/Yaw) 원시 비율을
  // 포인터 정규화 값(-1~1 기준, ±1.4로 clamp)으로 증폭하는 배율. 낮출수록 같은 화면 거리를
  // 이동하는 데 필요한 실제 고개 회전량이 커진다 — clamp 상한(1.4)과 pointerRange는 그대로 두고
  // 이 값만 낮추면, 포인터가 도달할 수 있는 최대 거리(= 1.4 × pointerRange)는 그대로 유지한 채
  // 그 거리에 닿기까지 필요한 고개 회전량만 늘어난다.
  headYawSensitivity: 1.5,
  headPitchSensitivity: 1.8,
  // 포인터가 프레임 간 튐 없이 부드럽게 유영하도록 하는 LERP 보간 계수 (낮을수록 느리고 차분하게 반응)
  headPoseSmoothing: 0.09,
  // 증폭+clamp된 머리 회전 값을 화면 좌표(0~1) 오프셋으로 변환하는 배율 (getSafeTargetPosition과
  // 같은 좌표계). 포인터가 도달 가능한 최대 거리(= 1.4 × 이 값)를 결정하므로, 타겟 스캔 반경
  // (0.20~0.32)을 여유 있게 덮도록 유지한다.
  pointerRangeX: 0.26,
  pointerRangeY: 0.24,
  // 포인터와 타겟 사이 정규화 화면 거리(0~1 기준)가 이 값 이하면 "온 타겟"으로 판정
  nodTargetRadius: 0.14,
  // 타겟에 온 상태를 이만큼(ms) 연속 유지하면 해당 단계 성공 처리
  nodHoldMs: 800,

  // 입 벌림 (MAR: Mouth Aspect Ratio)
  mouthOpenRatioThreshold: 0.5,

  // 해 뜨기: 입 벌림 정도(MAR)를 0(닫힘)~1(완전히 크게 벌림) 상승도로 매핑하는 구간
  sunriseMouthRatioMin: 0.2,
  sunriseMouthRatioMax: 0.85,
  // 입을 다물 때 수렴 애니메이션이 시작되려면 그 전에 최소 이만큼 떠올라 있어야 함
  sunrisePeakRequiredProgress: 0.7,
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
  // 목표 각도 가이드: 과도하게 꺾지 않아도 되도록 15°~25° 범위(Target Zone) 안에만 들어오면 "정렬"로 판정
  neckTargetMinDeg: 15,
  neckTargetMaxDeg: 25,
  // 목표 각도 범위에 정렬된 상태로 이만큼(ms) 연속 유지하면 해당 방향 성공 처리
  neckAlignHoldMs: 1000,

  // 어깨 으쓱: normalizedShrugScore = (baseline 어깨 y - 현재 어깨 y) / 어깨너비.
  // 이 값이 이 임계값을 넘어야 "으쓱"으로 인정하고, releaseThreshold(임계값의 절반) 아래로
  // 떨어져야 "내렸다(release)"로 인정한다 (중간 구간은 히스테리시스로 흔들림 방지).
  shoulderShrugThreshold: 0.13,

  // 엄지-검지 핀치 거리(정규화 좌표) -> 핀치 링 크기(%)
  pinchDistMin: 0.03,
  pinchDistMax: 0.22,
  pinchMatchTolerancePercent: 12,
  pinchHoldMs: 2000,
};
