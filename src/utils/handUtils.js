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

// 각도를 -180~180 범위로 정규화한다 (예: 350 -> -10).
// atan2 기반 각도는 ±180° 경계를 넘나들 때 350°처럼 불연속적으로 튀는 값을 반환할 수 있어,
// 두 각도의 차이를 계산하기 전에 이 함수로 정규화해야 UI가 순간이동(teleport)하지 않는다.
export const normalizeAngleDeg = (deg) => {
  let normalized = deg % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
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
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = {
      x: 0.20 + Math.random() * 0.60,
      y: 0.35 + Math.random() * 0.20,
    };

    if (existing.every(ball => getDistance(candidate, ball) > 0.18)) {
      return candidate;
    }
  }

  return { x: 0.50, y: 0.42 };
};

// ======================================================
// 안전한 타겟 위치 (원형 스캔) — getSafeBallPosition과 동일한 재시도 + 최소 간격 방식이되,
// 화면 중심(0.5, 0.5)에서 먼 반경대(0.20~0.32)에 무작위 각도로 배치해 매번 다른 원 위치를 만든다.
// x/y 클램프 범위는 상단 카메라 미리보기·데이터 박스, 하단 자막·진행 바 영역과 겹치지 않도록
// 화면 중앙에 가깝게 좁혀져 있다.
// ======================================================
export const getSafeTargetPosition = (existing = []) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 0.20 + Math.random() * 0.12;
    const candidate = {
      x: Math.min(0.82, Math.max(0.18, 0.5 + Math.cos(angle) * distance)),
      y: Math.min(0.68, Math.max(0.3, 0.5 + Math.sin(angle) * distance)),
    };

    if (existing.every(target => getDistance(candidate, target) > 0.14)) {
      return candidate;
    }
  }

  return { x: 0.5, y: 0.32 };
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