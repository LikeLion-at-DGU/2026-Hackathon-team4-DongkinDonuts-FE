import { MISSIONS } from "../config/handMissions";

// ======================================================
// 시간
// ======================================================
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

// ======================================================
// 거리
// ======================================================
export const getDistance = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const lerp = (current, target, amount) => {
  return current + (target - current) * amount;
};

// ======================================================
// 랜덤 미션
// ======================================================
export const getRandomMission = (excludeType = null) => {
  const candidates = MISSIONS.filter(
    item => item.type !== excludeType
  );

  const pool = candidates.length ? candidates : MISSIONS;
  const index = Math.floor(Math.random() * pool.length);

  return pool[index];
};

// ======================================================
// 공 생성
// ======================================================
export const createBall = (id, type, x, y) => {
  return {
    id,
    type,
    x,
    y,
    radius: 42,
    grabbed: false,
    grabbedBy: null,
    grabOffsetX: 0,
    grabOffsetY: 0,
    releaseStartTime: null,
  };
};

// ======================================================
// 안전한 공 위치
// ======================================================
export const getSafeBallPosition = (existing = []) => {
  const MIN_DISTANCE = 0.18;
  // The camera preview occupies the upper-left corner through roughly x=0.33.
  // Keep every spawned ball to its right with a visible safety margin.
  const BALL_SPAWN_X_MIN = 0.20;
  const BALL_SPAWN_X_MAX = 0.86;
  const BALL_SPAWN_Y_MIN = 0.45;
  const BALL_SPAWN_Y_MAX = 0.72;
  const randomCandidate = () => ({
    x: BALL_SPAWN_X_MIN + Math.random() * (BALL_SPAWN_X_MAX - BALL_SPAWN_X_MIN),
    y: BALL_SPAWN_Y_MIN + Math.random() * (BALL_SPAWN_Y_MAX - BALL_SPAWN_Y_MIN),
  });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = randomCandidate();

    if (existing.every(ball => getDistance(candidate, ball) > MIN_DISTANCE)) {
      return candidate;
    }
  }

  // 좁은 스폰 영역에 공이 많아 40번 모두 실패하면, 기존 공들과의 최소 거리가
  // 가장 큰 후보를 골라 반환한다. 고정된 좌표를 반환하면 실패한 공들이 서로
  // 완전히 겹쳐서 나오는 문제가 있었다.
  let bestCandidate = randomCandidate();
  let bestMinDistance = existing.length
    ? Math.min(...existing.map(ball => getDistance(bestCandidate, ball)))
    : Infinity;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = randomCandidate();
    const minDistance = existing.length
      ? Math.min(...existing.map(ball => getDistance(candidate, ball)))
      : Infinity;

    if (minDistance > bestMinDistance) {
      bestMinDistance = minDistance;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
};

// ======================================================
// 안전한 타겟 위치 (원형 스캔) — getSafeBallPosition과 동일한 재시도 + 최소 간격 방식이되,
// 화면 중심(0.5, 0.5)을 기준으로 "실제 화면(픽셀)에서 진짜 원"이 되는 테두리(경계선) 위에만
// 무작위 각도로 배치한다 (반경은 항상 EYE_TARGET_ZONE_MAX_RADIUS로 고정 — 임시로 그려지는
// 범위 가이드 원의 테두리와 정확히 일치시키기 위함).
//
// 캔버스는 정사각형이 아니라(디자인 기준 1345x721px, EYE_TARGET_ZONE_ASPECT ≈ 0.536)
// 정규화 좌표(x/y 모두 0~1)에 같은 반경을 그대로 쓰면 화면에는 가로로 퍼진 타원으로
// 보인다. 그래서 반경(EYE_TARGET_ZONE_MAX_RADIUS, 캔버스 "너비" 기준 비율)을 정하고 y축
// 오프셋에는 1/EYE_TARGET_ZONE_ASPECT를 곱해, 화면 픽셀 기준으로 정원이 되도록 보정한다.
// sessionVisuals.js의 drawGazeNodTargets가 같은 상수로 이 범위를 화면에 원으로 그려준다.
// ======================================================
export const EYE_TARGET_ZONE_ASPECT = 721 / 1345; // 캔버스 세로/가로 비율(App.jsx 반응형 zoom으로 항상 일정)
export const EYE_TARGET_ZONE_MAX_RADIUS = 0.13; // 캔버스 너비 기준 반경 비율

// 좌상단 카메라 미리보기 박스(디자인 기준 left 55px/top 28px/390x239px, 캔버스 1345x721px
// 기준 정규화 시 x 0~0.33, y 0~0.37)와 겹치지 않도록 타겟 반경만큼 여유를 더해 제외한다.
const CAMERA_PREVIEW_EXCLUSION_X = 0.36;
const CAMERA_PREVIEW_EXCLUSION_Y = 0.43;

export const getSafeTargetPosition = (existing = []) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const candidate = {
      x: 0.5 + Math.cos(angle) * EYE_TARGET_ZONE_MAX_RADIUS,
      y: 0.5 + Math.sin(angle) * (EYE_TARGET_ZONE_MAX_RADIUS / EYE_TARGET_ZONE_ASPECT),
    };

    if (candidate.x < CAMERA_PREVIEW_EXCLUSION_X && candidate.y < CAMERA_PREVIEW_EXCLUSION_Y) {
      continue;
    }

    if (existing.every(target => getDistance(candidate, target) > 0.1)) {
      return candidate;
    }
  }

  return { x: 0.5, y: 0.5 - EYE_TARGET_ZONE_MAX_RADIUS / EYE_TARGET_ZONE_ASPECT };
};

export const createNormalBalls = () => {
  const balls = [];
  ["green", "blue", "pink"].forEach((type, index) => {
    const position = getSafeBallPosition(balls);
    balls.push(createBall(`${type}-${index + 1}`, type, position.x, position.y));
  });
  return balls;
};

// ======================================================
// 같은 색 3개
// ======================================================
export const createSameColorBalls = () => {
  const types = ["green", "blue", "pink"];
  const targetType = types[Math.floor(Math.random() * types.length)];
  const balls = [];

  for (let i = 0; i < 3; i += 1) {
    const position = getSafeBallPosition(balls);
    balls.push(createBall(`${targetType}-target-${i + 1}`, targetType, position.x, position.y));
  }

  types.filter(type => type !== targetType).forEach((type, index) => {
    const position = getSafeBallPosition(balls);
    balls.push(createBall(`${type}-distractor-${index + 1}`, type, position.x, position.y));
  });

  return { balls, targetType };
};

// ======================================================
// 움직이는 목표 공 3개
// ======================================================
export const createMovingTargetBalls = () => {
  const balls = [];
  ["green", "blue", "pink"].forEach((type, index) => {
    const position = getSafeBallPosition(balls);
    balls.push(createBall(`moving-${type}-${index + 1}`, type, position.x, position.y));
  });
  return balls;
};
