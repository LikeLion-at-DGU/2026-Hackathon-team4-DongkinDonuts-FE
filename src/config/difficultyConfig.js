// 세션별 난이도(하/중/상) 데이터. "중"은 기존 하드코딩 값과 동일하게 맞춰 기본 동작이
// 바뀌지 않도록 하고, "하"는 반복횟수를 줄이고 판정 기준(강도/정확도)을 관대하게,
// "상"은 반복횟수를 늘리고 판정 기준을 더 엄격하게 잡는다.

export const DIFFICULTY_LEVELS = ["low", "medium", "high"];

export const DIFFICULTY_LABELS = {
  low: "하",
  medium: "중",
  high: "상",
};

export const DEFAULT_DIFFICULTY = "medium";

export const DIFFICULTY_CONFIG = {
  "eye-blink": {
    // targetCount: 목표 깜빡임 반복 횟수, blinkHoldMs: 눈을 감고 있어야 하는 최소 시간(강도)
    low: { targetCount: 2, blinkHoldMs: 700 },
    medium: { targetCount: 3, blinkHoldMs: 1000 },
    high: { targetCount: 4, blinkHoldMs: 1300 },
  },
  "eye-tracking": {
    // totalStages: 맞춰야 하는 타겟 개수(반복횟수), nodTargetRadius: 온타겟 판정 반경(작을수록 정확도 요구 높음)
    // nodHoldMs: 타겟에 맞춘 채 유지해야 하는 시간(강도)
    low: { totalStages: 3, nodTargetRadius: 0.12, nodHoldMs: 600 },
    medium: { totalStages: 4, nodTargetRadius: 0.1, nodHoldMs: 800 },
    high: { totalStages: 5, nodTargetRadius: 0.08, nodHoldMs: 1000 },
  },
  "focus-pinch": {
    // targetCount: 반복횟수, pinchMatchTolerancePercent: 목표 크기와의 허용 오차(정확도)
    // pinchHoldMs: 목표 크기로 맞춘 채 유지해야 하는 시간(강도)
    low: { targetCount: 2, pinchMatchTolerancePercent: 18, pinchHoldMs: 1500 },
    medium: { targetCount: 3, pinchMatchTolerancePercent: 12, pinchHoldMs: 2000 },
    high: { targetCount: 4, pinchMatchTolerancePercent: 8, pinchHoldMs: 2500 },
  },
  "neck-stretch": {
    // cycles: 좌우 왕복 반복 횟수(반복횟수, 총 단계 수 = cycles * 2)
    // neckTargetMinDeg/MaxDeg: 정렬로 인정하는 각도 구간(구간이 좁을수록 정확도 요구 높음)
    // neckAlignHoldMs: 정렬 상태를 유지해야 하는 시간(강도)
    low: { cycles: 1, neckTargetMinDeg: 10, neckTargetMaxDeg: 25, neckAlignHoldMs: 700 },
    medium: { cycles: 1, neckTargetMinDeg: 15, neckTargetMaxDeg: 25, neckAlignHoldMs: 1000 },
    high: { cycles: 2, neckTargetMinDeg: 18, neckTargetMaxDeg: 25, neckAlignHoldMs: 1300 },
  },
  "shoulder-pmr": {
    // totalReps: 반복횟수, shoulderShrugThreshold: 으쓱으로 인정하는 최소 상승량(정확도)
    // holdMs: 임계값 이상을 유지해야 하는 시간(강도)
    low: { totalReps: 2, shoulderShrugThreshold: 0.1, holdMs: 700 },
    medium: { totalReps: 2, shoulderShrugThreshold: 0.13, holdMs: 1000 },
    high: { totalReps: 3, shoulderShrugThreshold: 0.16, holdMs: 1300 },
  },
  "wakeup-sunrise": {
    // targetCount: 반복횟수, mouthRatioMin/Max: 입 벌림 정도를 상승도로 매핑하는 구간(강도)
    // peakRequiredProgress: 입을 다물었을 때 성공으로 인정하기 위해 미리 도달해야 하는 상승도(정확도)
    low: { targetCount: 2, mouthRatioMin: 0.15, mouthRatioMax: 0.75, peakRequiredProgress: 0.6 },
    medium: { targetCount: 3, mouthRatioMin: 0.2, mouthRatioMax: 0.85, peakRequiredProgress: 0.7 },
    high: { targetCount: 5, mouthRatioMin: 0.25, mouthRatioMax: 0.95, peakRequiredProgress: 0.8 },
  },
};
