import { BALL_TYPES } from "../config/ballTypes";
import { getDistance } from "../utils/handUtils";

// 헥스 색상을 지정한 비율만큼 어둡게 만든다.
// 모든 공 테두리에 고정된 파란빛 회색을 쓰면 초록/파랑처럼 채도가 낮은 색끼리
// 서로 비슷하게 보여 헷갈리므로, 공 타입 고유 색상을 어둡게 만들어 사용한다.
const darkenColor = (hex, amount = 0.45) => {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);

  const scale = (channel) => Math.round(channel * (1 - amount));

  return `rgb(${scale(r)}, ${scale(g)}, ${scale(b)})`;
};

// 공 그리기
export const drawBall = (ctx, ball, width, height) => {
  if (ball.x < 0 || ball.y < 0) return;

  const x = ball.x * width;
  const y = ball.y * height;
  const radius = ball.radius;
  const type = BALL_TYPES[ball.type];

  if (!type) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 16;

  const gradient = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.35,
    radius * 0.08,
    x,
    y,
    radius
  );

  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(0.18, type.color);
  gradient.addColorStop(0.75, type.color);
  gradient.addColorStop(1, darkenColor(type.color));

  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  // 빛 반사 효과
  ctx.beginPath();
  ctx.arc(
    x - radius * 0.28,
    y - radius * 0.3,
    radius * 0.055,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();

  // 잡고 있는 공 강조 표시
  if (ball.grabbed) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

// 목표 영역 그리기 — 텍스트 라벨 없이, 웰니스 앱의 "숨쉬는 원"처럼
// 은은한 글로우 + 얇은 링 + 부드러운 브리딩(breathing) 애니메이션만으로
// 절제되고 고급스럽게 목표 지점을 표현한다.
export const drawTarget = (ctx, target, width, height) => {
  if (!target) return;

  const x = target.x * width;
  const y = target.y * height;
  // target 객체의 radius 속성을 활용하도록 수정 (기본값 0.11 비율 대응)
  const radius = target.radius ? target.radius * height : 65;

  // sin 파형으로 끊김 없이 부드럽게 오가는 브리딩 값 (0~1), 4초 주기
  const breath = (Math.sin((performance.now() / 4000) * Math.PI * 2) + 1) / 2;
  const breathScale = radius * (1 + breath * 0.05);

  ctx.save();

  // 1. 은은하게 번지는 외곽 글로우
  ctx.beginPath();
  ctx.arc(x, y, breathScale, 0, Math.PI * 2);
  ctx.shadowColor = target.color;
  ctx.shadowBlur = 28 + breath * 10;
  ctx.fillStyle = target.color;
  ctx.globalAlpha = 0.06;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 2. 유리 같은 은은한 내부 채움
  const fill = ctx.createRadialGradient(x, y, 0, x, y, radius);
  fill.addColorStop(0, "rgba(255,255,255,0.18)");
  fill.addColorStop(1, `${target.color}22`);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.globalAlpha = 1;
  ctx.fillStyle = fill;
  ctx.fill();

  // 3. 얇고 단정한 테두리 링 (브리딩에 맞춰 살짝 밝아졌다 옅어짐)
  ctx.beginPath();
  ctx.arc(x, y, breathScale, 0, Math.PI * 2);
  ctx.strokeStyle = target.color;
  ctx.globalAlpha = 0.55 + breath * 0.25;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
};

// 손 그리기
export const drawHands = (ctx, width, height, hands, balls) => {
  hands.forEach((hand) => {
    const x = hand.x * width;
    const y = hand.y * height;

    // 손 영역
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = hand.fist
      ? "rgba(233,155,155,0.18)"
      : "rgba(255,255,255,0.08)";
    ctx.fill();

    // 중앙 점
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = hand.fist ? "#E99B9B" : "#FFFFFF";
    ctx.fill();

    // 테두리
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = hand.fist ? "#E99B9B" : "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 가장 가까운 공 찾기
    let nearestBall = null;
    let nearestDistance = Infinity;

    balls.forEach((ball) => {
      if (ball.x < 0) return;

      const distance = getDistance(hand, ball);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBall = ball;
      }
    });

    // 손과 공 연결 점선
    if (nearestBall && nearestDistance < 0.13) {
      const ballX = nearestBall.x * width;
      const ballY = nearestBall.y * height;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ballX, ballY);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
};

// 전체 Canvas 렌더링
export const renderSession = ({
  canvas,
  mission,
  balls,
  hands,
  movingTarget,
  staticTargets,
}) => {
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  // Canvas 해상도 조율
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // 1. 목표 영역 그리기
  if (mission.type === "MOVING_TARGET") {
    drawTarget(ctx, movingTarget, width, height);
  } else if (mission.type !== "SEQUENCE") {
    staticTargets.forEach((target) => {
      drawTarget(ctx, target, width, height);
    });
  }

  // 2. 공 그리기
  balls.forEach((ball) => {
    drawBall(ctx, ball, width, height);
  });

  // 3. 손 그리기
  drawHands(ctx, width, height, hands, balls);
};