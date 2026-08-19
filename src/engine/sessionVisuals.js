// 세션별 캔버스 이펙트 (2D Canvas 기반 스타일라이즈 연출)

// Canvas 해상도를 컨테이너 크기 + devicePixelRatio에 맞춰 조율하고 컨텍스트를 비워서 반환
export const prepareCanvas = (canvas) => {
  if (!canvas) return null;
  const container = canvas.parentElement;
  if (!container) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return null;

  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
};

// ======================================================
// 눈 깜빡임 — 안개가 걷히는 연출 (fogClear: 0 안개 가득 ~ 1 완전히 걷힘)
// ======================================================
export const drawEyeFog = (ctx, w, h, { fogClear }) => {
  const clear = Math.min(1, Math.max(0, fogClear));

  const lake = ctx.createLinearGradient(0, 0, 0, h);
  lake.addColorStop(0, `rgba(130, 200, 225, ${0.14 * clear})`);
  lake.addColorStop(1, `rgba(40, 95, 135, ${0.2 * clear})`);
  ctx.fillStyle = lake;
  ctx.fillRect(0, 0, w, h);

  const fogAlpha = 0.55 * (1 - clear);
  if (fogAlpha > 0.01) {
    ctx.save();
    ctx.filter = "blur(18px)";
    ctx.fillStyle = `rgba(230, 240, 245, ${fogAlpha})`;
    ctx.fillRect(-20, -20, w + 40, h + 40);
    ctx.restore();
  }

  if (clear > 0.96) {
    ctx.fillStyle = `rgba(255,255,255,${(clear - 0.96) * 8})`;
    ctx.fillRect(0, 0, w, h);
  }
};

// ======================================================
// 시선 추적 — 네온 ∞ 궤적 + 목표 입자 (target/gaze: 중심 기준 대략 -1~1 정규화 오프셋)
// ======================================================
const INFINITY_SAMPLE_COUNT = 120;

export const drawInfinityPath = (ctx, w, h, { target, gaze, onTarget }) => {
  const cx = w / 2;
  const cy = h / 2;
  const amplitude = Math.min(w, h) * 0.32;

  ctx.save();
  ctx.strokeStyle = "rgba(120, 220, 255, 0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= INFINITY_SAMPLE_COUNT; i += 1) {
    const t = (i / INFINITY_SAMPLE_COUNT) * Math.PI * 2;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = cx + (Math.cos(t) / denom) * amplitude;
    const y = cy + ((Math.sin(t) * Math.cos(t)) / denom) * amplitude;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (gaze) {
    ctx.beginPath();
    ctx.arc(cx + gaze.x * amplitude, cy + gaze.y * amplitude, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
  }

  if (target) {
    const glow = onTarget ? "rgba(160, 255, 230, 1)" : "rgba(120, 220, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(cx + target.x * amplitude, cy + target.y * amplitude, onTarget ? 14 : 9, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.shadowColor = glow;
    ctx.shadowBlur = onTarget ? 30 : 14;
    ctx.fill();
  }
  ctx.restore();
};

// ======================================================
// 목/어깨 공용 — 실제 인식된 포즈 랜드마크 점 + 연결선을 그려서 인식 여부를 눈으로 확인
// (pose: MediaPipe PoseLandmarker의 raw 33포인트 배열, 좌표는 미러링 전 원본이라 x를 반전해서 그림)
// ======================================================
export const drawPoseLandmarks = (ctx, w, h, { pose }) => {
  if (!pose) return;
  const toPx = (point) => ({ x: (1 - point.x) * w, y: point.y * h });

  const nose = toPx(pose[0]);
  const leftEye = toPx(pose[2]);
  const rightEye = toPx(pose[5]);
  const leftEar = toPx(pose[7]);
  const rightEar = toPx(pose[8]);
  const leftShoulder = toPx(pose[11]);
  const rightShoulder = toPx(pose[12]);

  ctx.save();
  const drawLine = (a, b, color) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  drawLine(leftEye, rightEye, "rgba(160,255,230,0.7)");
  drawLine(leftEar, rightEar, "rgba(120,220,255,0.6)");
  drawLine(leftShoulder, rightShoulder, "rgba(255,190,140,0.85)");
  drawLine(nose, { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 }, "rgba(255,190,140,0.4)");

  [nose, leftEye, rightEye, leftEar, rightEar, leftShoulder, rightShoulder].forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(120,220,255,0.9)";
    ctx.shadowBlur = 8;
    ctx.fill();
  });
  ctx.restore();
};

// 좌상단에 작은 상태 텍스트 표시 (캘리브레이션 진행률/현재 수치 확인용)
export const drawDebugLabel = (ctx, w, h, text) => {
  if (!text) return;
  ctx.save();
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 4;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(text, 16, 16);
  ctx.restore();
};

// ======================================================
// 목 스트레칭 — 좌/우 젤리 블롭이 눌리는 연출
// ======================================================
export const drawNeckJelly = (ctx, w, h, { holdRatio, side }) => {
  const ratio = Math.min(1, Math.max(0, holdRatio));
  const squish = 1 - ratio * 0.55;
  const stretch = 1 + ratio * 0.35;
  const baseRadius = Math.min(w, h) * 0.09;

  ["left", "right"].forEach((blobSide) => {
    const active = blobSide === side && ratio > 0;
    const cx = blobSide === "left" ? w * 0.22 : w * 0.78;
    const cy = h * 0.28;
    const rx = baseRadius * (active ? stretch : 1);
    const ry = baseRadius * (active ? squish : 1);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

    const gradient = ctx.createRadialGradient(cx, cy - ry * 0.3, ry * 0.2, cx, cy, rx);
    gradient.addColorStop(0, active ? "rgba(255,214,214,0.85)" : "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, active ? "rgba(240,140,150,0.55)" : "rgba(255,255,255,0.12)");
    ctx.fillStyle = gradient;
    ctx.shadowColor = active ? "rgba(255,150,160,0.6)" : "transparent";
    ctx.shadowBlur = active ? 20 : 0;
    ctx.fill();
    ctx.restore();
  });
};

// ======================================================
// 어깨 PMR — 얇은 게이지 (fillRatio: 0~1, phase: 'idle' | 'raising' | 'release')
// ======================================================
export const drawShoulderGauge = (ctx, w, h, { fillRatio, phase }) => {
  const ratio = Math.min(1, Math.max(0, fillRatio));
  const barWidth = w * 0.42;
  const barHeight = 14;
  const x = w / 2 - barWidth / 2;
  const y = h * 0.14;

  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, barWidth, barHeight, barHeight / 2);
  else ctx.rect(x, y, barWidth, barHeight);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();

  const fillWidth = barWidth * (phase === "release" ? 0 : ratio);
  if (fillWidth > 0.5) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, fillWidth, barHeight, barHeight / 2);
    else ctx.rect(x, y, fillWidth, barHeight);

    const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, "rgba(255,150,170,0.9)");
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(255,170,180,0.5)";
    ctx.shadowBlur = 12;
    ctx.fill();
  }

  if (phase === "release" && ratio > 0) {
    ctx.beginPath();
    ctx.arc(w / 2, y + barHeight / 2, barWidth * 0.55 * ratio, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,190,200,${0.5 * ratio})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }
  ctx.restore();
};

// ======================================================
// 핀치 링 — 손별 핀치 링 + 중앙 목표 원 (rings: [{x,y,sizePercent}], 좌표는 0~1 정규화)
// ======================================================
export const drawPinchRings = (ctx, w, h, { rings, targetSizePercent, matched }) => {
  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.min(w, h) * 0.32;
  const targetRadius = maxRadius * (Math.min(100, Math.max(0, targetSizePercent)) / 100);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, targetRadius, 0, Math.PI * 2);
  ctx.strokeStyle = matched ? "rgba(160,255,210,0.95)" : "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  (rings || []).forEach((ring) => {
    const x = ring.x * w;
    const y = ring.y * h;
    const radius = maxRadius * (Math.min(100, Math.max(0, ring.sizePercent)) / 100);
    const color = matched ? "rgba(160,255,210,0.95)" : "rgba(120,200,255,0.85)";

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.shadowColor = color;
    ctx.shadowBlur = matched ? 26 : 14;
    ctx.stroke();
  });

  if (matched) {
    ctx.beginPath();
    ctx.arc(cx, cy, targetRadius, 0, Math.PI * 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(160,255,210,0.15)";
    ctx.fill();
  }
  ctx.restore();
};

// ======================================================
// 얼음 깨기 — 화면 무작위 위치에 얼음이 하나씩 등장, 깨질 때 파편 애니메이션 (x/y는 0~1 정규화 좌표)
// ======================================================
export const drawFloatingIce = (ctx, w, h, { x, y, burstProgress }) => {
  const cx = x * w;
  const cy = y * h;
  const size = Math.min(w, h) * 0.1;
  const progress = burstProgress ?? 0;

  ctx.save();
  if (progress > 0) {
    ctx.globalAlpha = 1 - progress;
    const scale = 1 + progress * 0.7;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
  }

  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size * 0.8, cy - size * 0.2);
  ctx.lineTo(cx + size * 0.5, cy + size);
  ctx.lineTo(cx - size * 0.5, cy + size);
  ctx.lineTo(cx - size * 0.8, cy - size * 0.2);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(cx, cy - size, cx, cy + size);
  gradient.addColorStop(0, "rgba(220,245,255,0.9)");
  gradient.addColorStop(1, "rgba(140,200,230,0.55)");
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(160,220,255,0.55)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};
