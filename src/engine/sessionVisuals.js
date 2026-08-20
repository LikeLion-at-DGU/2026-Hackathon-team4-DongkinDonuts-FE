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
// 눈 깜빡임 — 중앙의 미니멀한 링이 눈을 감을수록 차분한 웜톤으로 작게 축소되고,
// EAR 센싱으로 완전 밀폐(1초 유지) 후 눈을 뜨는 순간 파스텔 입자를 남기며
// 사방으로 '퐁' 퍼지다 잔물결처럼 사라지는 파동 연출.
// closeAmount: 0(눈 뜸) ~ 1(완전히 감음), popProgress: 0~1(뜬 직후 파동 진행도)
// ======================================================
const EYE_PULSE_PARTICLE_COLORS = [
  [255, 209, 220], // pastel pink
  [200, 244, 222], // pastel mint
  [224, 200, 255], // pastel lavender
  [255, 224, 181], // pastel peach
  [200, 232, 255], // pastel sky
];
const EYE_PULSE_PARTICLE_COUNT = 14;

export const drawEyeBlinkPulse = (ctx, w, h, { closeAmount = 0, popProgress = 0 }) => {
  const cx = w / 2;
  const cy = h / 2;
  const baseRadius = Math.min(w, h) * 0.13;

  ctx.save();

  const close = Math.min(1, Math.max(0, closeAmount));
  const ringRadius = baseRadius * (1 - close * 0.55);
  const warmAlpha = 0.25 + close * 0.35;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, ${Math.round(214 - close * 30)}, ${Math.round(190 - close * 60)}, ${warmAlpha})`;
  ctx.lineWidth = 2.5 + close * 1.5;
  ctx.stroke();

  if (popProgress > 0) {
    const p = Math.min(1, popProgress);
    const ease = easeOutCubic(p);
    const maxRadius = Math.min(w, h) * 0.42;

    ctx.save();
    [0, 0.15, 0.3].forEach((delay) => {
      const rp = p - delay;
      if (rp <= 0 || rp > 1) return;
      const re = easeOutCubic(rp);
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + re * (maxRadius - baseRadius), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 236, 225, ${(1 - rp) * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    const particleDistance = baseRadius + ease * (maxRadius - baseRadius);
    const particleAlpha = 1 - p;
    for (let i = 0; i < EYE_PULSE_PARTICLE_COUNT; i += 1) {
      const angle = (Math.PI * 2 * i) / EYE_PULSE_PARTICLE_COUNT + p * 0.6;
      const [r, g, b] = EYE_PULSE_PARTICLE_COLORS[i % EYE_PULSE_PARTICLE_COLORS.length];
      const px = cx + Math.cos(angle) * particleDistance;
      const py = cy + Math.sin(angle) * particleDistance;
      const size = 4 * (1 - p * 0.5);

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particleAlpha})`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${particleAlpha * 0.8})`;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
};

// 모서리가 둥근 사각형 경로를 만든다 (여러 인디케이터에서 공용으로 사용)
const roundedRectPath = (ctx, x, y, w, h, r) => {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

// ======================================================
// 목 좌우 기울이기 — 대형 기울기 인디케이터. 화면 중앙에 가로 막대(Track)를 두고,
// 현재 Head Roll 각도(currentDeg)에 따라 굵은 막대 인디케이터가 실제 고개를 기울이는
// 방향과 동일한 방향으로 좌우 이동한다. 목표 각도 범위(targetMinDeg~targetMaxDeg)가
// 막대 위에 밝게 표시되고, 인디케이터가 그 범위 안에 들어와 정렬되면(aligned) 민트색으로
// 빛나며 하단의 유지(hold) 진행 바 + 남은 시간 숫자가 목표 유지 시간 동안 채워진다.
// burstProgress(0~1)가 주어지면 단계 성공 순간 중앙에서 은은한 파동이 한 번 퍼지며 사라진다.
// ======================================================
export const drawTiltIndicator = (ctx, w, h, {
  currentDeg = 0,
  targetMinDeg = 15,
  targetMaxDeg = 25,
  maxDeg = 30,
  aligned = false,
  holdProgress = 0,
  holdRemainingSec = 0,
  isCalibrating = false,
  burstProgress = 0,
}) => {
  const cx = w / 2;
  const cy = h * 0.5;
  const barWidth = Math.min(w * 0.78, 720);
  const barHeight = Math.max(36, Math.min(w, h) * 0.075);
  const markerWidth = barHeight * 0.85;
  const markerHeight = barHeight * 2.3;
  const usableHalfWidth = barWidth / 2 - markerWidth / 2;

  const clampDeg = (d) => Math.min(maxDeg, Math.max(-maxDeg, d));
  const degToX = (d) => cx + (clampDeg(d) / maxDeg) * usableHalfWidth;

  const mintColor = "rgba(160,255,210,0.95)";
  const neutralColor = "rgba(255,255,255,0.9)";
  const activeColor = aligned ? mintColor : "rgba(120,200,255,0.75)";

  ctx.save();

  // 배경 트랙
  roundedRectPath(ctx, cx - barWidth / 2, cy - barHeight / 2, barWidth, barHeight, barHeight / 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 정면(0°) 기준선
  ctx.beginPath();
  ctx.moveTo(cx, cy - barHeight / 2 - 12);
  ctx.lineTo(cx, cy + barHeight / 2 + 12);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (!isCalibrating) {
    // 목표 각도 가이드 영역 (Target Zone: targetMinDeg ~ targetMaxDeg)
    const zoneX0 = degToX(targetMinDeg);
    const zoneX1 = degToX(targetMaxDeg);
    ctx.save();
    if (aligned) {
      ctx.shadowColor = mintColor;
      ctx.shadowBlur = 22;
    }
    roundedRectPath(
      ctx,
      Math.min(zoneX0, zoneX1),
      cy - barHeight / 2,
      Math.max(10, Math.abs(zoneX1 - zoneX0)),
      barHeight,
      barHeight / 2
    );
    ctx.fillStyle = activeColor;
    ctx.globalAlpha = aligned ? 0.55 : 0.4;
    ctx.fill();
    ctx.restore();

    // 현재 각도 인디케이터 막대
    const markerX = degToX(currentDeg);
    const markerColor = aligned ? mintColor : neutralColor;
    ctx.save();
    if (aligned) {
      ctx.shadowColor = mintColor;
      ctx.shadowBlur = 20;
    }
    roundedRectPath(ctx, markerX - markerWidth / 2, cy - markerHeight / 2, markerWidth, markerHeight, markerWidth / 2);
    ctx.fillStyle = markerColor;
    ctx.fill();
    ctx.restore();
  }

  // 현재 각도 숫자 (막대 위, 대형 표시)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(Math.min(w, h) * 0.1)}px sans-serif`;
  ctx.fillStyle = aligned ? mintColor : "rgba(255,255,255,0.95)";
  ctx.fillText(
    isCalibrating ? "···" : `${currentDeg >= 0 ? "+" : ""}${Math.round(currentDeg)}°`,
    cx,
    cy - markerHeight / 2 - 48
  );

  // 목표 각도 범위 라벨 (막대 아래) — 정렬 중에는 남은 유지 시간 카운트다운으로 전환
  ctx.font = "16px sans-serif";
  ctx.fillStyle = aligned ? mintColor : "rgba(255,255,255,0.6)";
  const zoneLabel = `${targetMinDeg >= 0 ? "+" : ""}${targetMinDeg}° ~ ${targetMaxDeg >= 0 ? "+" : ""}${targetMaxDeg}°`;
  ctx.fillText(
    isCalibrating
      ? "정면을 향해 잠시 정렬해 주세요"
      : aligned
        ? `유지 중... ${Math.max(0, holdRemainingSec).toFixed(1)}s`
        : `목표 범위 ${zoneLabel}`,
    cx,
    cy + markerHeight / 2 + 30
  );

  // 유지(hold) 진행 바 — 정렬 상태를 목표 시간만큼 유지해야 채워짐
  if (!isCalibrating) {
    const holdBarY = cy + markerHeight / 2 + 54;
    const holdBarHeight = 6;
    roundedRectPath(ctx, cx - barWidth / 2, holdBarY, barWidth, holdBarHeight, holdBarHeight / 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();

    const fillWidth = barWidth * Math.min(1, Math.max(0, holdProgress));
    if (fillWidth > 0) {
      roundedRectPath(ctx, cx - barWidth / 2, holdBarY, fillWidth, holdBarHeight, holdBarHeight / 2);
      ctx.fillStyle = mintColor;
      ctx.fill();
    }
  }

  // 단계 성공 파동 — 중앙에서 한 번 은은하게 퍼지며 사라짐
  if (burstProgress > 0) {
    const p = Math.min(1, burstProgress);
    ctx.save();
    [0, 0.15].forEach((delay) => {
      const rp = p - delay;
      if (rp <= 0 || rp > 1) return;
      const radius = rp * Math.min(w, h) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160,255,210,${(1 - rp) * 0.6})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    const glowAlpha = Math.sin(p * Math.PI) * 0.3;
    if (glowAlpha > 0.01) {
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.45);
      glow.addColorStop(0, `rgba(160,255,210,${glowAlpha})`);
      glow.addColorStop(1, "rgba(160,255,210,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  ctx.restore();
};

// ======================================================
// 어깨 으쓱 — 화면 중앙에 놓인 실제 조약돌 같은 울퉁불퉁한 스톤. 어깨를 으쓱 올려
// 긴장하는 동안(phase:'hold', squeezeAmount: 0~1) 돌이 점점 조밀하게 웅크러들며
// 표면이 어둡고 단단하게 다져진다 (1.5초 유지 유도). 어깨를 툭 떨어뜨리는 순간
// (phase:'release', releaseProgress: 0~1) 돌이 형태를 잃고 미세한 파스텔 가루
// 입자로 부서지며 아래로 스르륵 쏟아져 내린다.
// ======================================================
const STONE_PARTICLE_COUNT = 36;
const STONE_PARTICLE_COLORS = [
  [223, 219, 232], // stone dust lavender-grey
  [236, 220, 210], // pastel clay
  [214, 228, 224], // pastel sage
  [226, 216, 236], // pastel lilac
  [232, 230, 220], // pastel sand
];

// seed로부터 0~1 사이 값을 결정론적으로 생성 (프레임마다 위치가 흔들리지 않도록 Math.random 대신 사용)
const pseudoRandom = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// 조약돌의 울퉁불퉁한 윤곽 — 각 꼭짓점의 각도 흔들림/반지름 배율을 한 번만 결정론적으로
// 생성해 고정된 "돌 모양"으로 재사용한다 (프레임마다 흔들리지 않도록).
const STONE_VERTEX_COUNT = 11;
const STONE_SHAPE = Array.from({ length: STONE_VERTEX_COUNT }, (_, i) => {
  const angle = (Math.PI * 2 * i) / STONE_VERTEX_COUNT;
  const angleJitter = (pseudoRandom(i * 4.7 + 11) - 0.5) * 0.4;
  const radiusMult = 0.72 + pseudoRandom(i * 8.3 + 21) * 0.34;
  return { angle: angle + angleJitter, radiusMult };
});
// 표면 얼룩(스펙클) 위치 — 돌 텍스처를 표현하는 작은 반점들
const STONE_SPECKLE_COUNT = 12;
const STONE_SPECKLES = Array.from({ length: STONE_SPECKLE_COUNT }, (_, i) => ({
  x: (pseudoRandom(i * 6.1 + 31) - 0.5) * 1.5,
  y: (pseudoRandom(i * 3.9 + 41) - 0.5) * 1.5,
  r: 0.05 + pseudoRandom(i * 7.3 + 51) * 0.09,
  a: 0.1 + pseudoRandom(i * 2.9 + 61) * 0.16,
}));

// 부드러운 다각형 윤곽선을 그린다 (꼭짓점 사이를 이차 곡선으로 이어 둥글둥글한 돌 느낌을 낸다)
const traceStonePath = (ctx, halfW, halfH, roundness) => {
  const pts = STONE_SHAPE.map(({ angle, radiusMult }) => {
    const mult = lerpValue(radiusMult, 1, roundness);
    return { x: Math.cos(angle) * halfW * mult, y: Math.sin(angle) * halfH * mult };
  });
  const n = pts.length;
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(pts[n - 1], pts[0]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i < n; i += 1) {
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const m = mid(cur, next);
    ctx.quadraticCurveTo(cur.x, cur.y, m.x, m.y);
  }
  ctx.closePath();
};

export const drawShoulderStone = (ctx, w, h, { phase = "idle", squeezeAmount = 0, releaseProgress = 0 }) => {
  const cx = w / 2;
  const cy = h * 0.54;
  const baseHalfW = Math.min(w, h) * 0.17;
  const baseHalfH = Math.min(w, h) * 0.145;

  const squeeze = Math.min(1, Math.max(0, squeezeAmount));
  const scale = 1 - squeeze * 0.18;
  const halfW = baseHalfW * scale;
  const halfH = baseHalfH * scale;
  // 긴장이 쌓일수록 표면 굴곡이 매끈하게 다져지는 느낌 (0: 울퉁불퉁 ~ 1: 둥글게 다져짐)
  const roundness = squeeze * 0.35;

  const p = Math.min(1, Math.max(0, releaseProgress));
  const dissolve = phase === "release" ? Math.min(1, p / 0.3) : 0;
  const stoneAlpha = phase === "release" ? 1 - dissolve : 0.55 + squeeze * 0.45;

  ctx.save();

  // 바닥 그림자 — 긴장이 쌓일수록 짙고 좁게 고정되고, 이완되면 옅어지며 흩어진다
  const shadowW = halfW * (1.5 - squeeze * 0.25);
  const shadowAlpha = (0.22 + squeeze * 0.2) * stoneAlpha;
  if (shadowAlpha > 0.01) {
    const shadowY = cy + baseHalfH * 0.92;
    const shadowGlow = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowW);
    shadowGlow.addColorStop(0, `rgba(20,20,24,${shadowAlpha})`);
    shadowGlow.addColorStop(1, "rgba(20,20,24,0)");
    ctx.beginPath();
    ctx.ellipse(cx, shadowY, shadowW, shadowW * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = shadowGlow;
    ctx.fill();
  }

  if (stoneAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = stoneAlpha;
    ctx.translate(cx, cy);

    const tone = (a, b) => Math.round(lerpValue(a, b, squeeze));

    traceStonePath(ctx, halfW, halfH, roundness);

    // 좌상단에서 비치는 조명을 받는 몸체 — 긴장이 쌓일수록 어둡고 짙은 회색 돌로 다져진다
    const body = ctx.createRadialGradient(
      -halfW * 0.35, -halfH * 0.45, Math.min(halfW, halfH) * 0.1,
      0, 0, Math.max(halfW, halfH) * 1.15
    );
    body.addColorStop(0, `rgb(${tone(214, 158)},${tone(210, 154)},${tone(218, 164)})`);
    body.addColorStop(0.55, `rgb(${tone(170, 116)},${tone(166, 112)},${tone(176, 122)})`);
    body.addColorStop(1, `rgb(${tone(112, 66)},${tone(108, 64)},${tone(118, 72)})`);
    ctx.fillStyle = body;
    ctx.fill();

    // 표면 얼룩 — 돌의 자연스러운 질감
    ctx.save();
    ctx.clip();
    STONE_SPECKLES.forEach((s) => {
      ctx.beginPath();
      ctx.ellipse(s.x * halfW, s.y * halfH, s.r * halfW, s.r * halfH * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tone(70, 40)},${tone(66, 38)},${tone(74, 44)},${s.a})`;
      ctx.fill();
    });
    ctx.restore();

    // 긴장이 쌓일수록 또렷해지는 얇은 엣지 하이라이트
    traceStonePath(ctx, halfW, halfH, roundness);
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + squeeze * 0.25})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();

  if (phase === "release" && p > 0) {
    ctx.save();
    const fall = easeOutCubic(p) * h * 0.5;
    for (let i = 0; i < STONE_PARTICLE_COUNT; i += 1) {
      const seedX = pseudoRandom(i * 3.1 + 1);
      const seedY = pseudoRandom(i * 7.7 + 2);
      const seedSpeed = pseudoRandom(i * 5.3 + 3);
      const seedDrift = pseudoRandom(i * 9.1 + 4);
      const seedSize = pseudoRandom(i * 2.3 + 5);

      const startX = cx + (seedX - 0.5) * baseHalfW * 2;
      const startY = cy + (seedY - 0.5) * baseHalfH * 2;
      const speed = 0.6 + seedSpeed * 0.8;

      const x = startX + Math.sin(p * Math.PI * (1 + seedDrift)) * (seedDrift - 0.5) * 26;
      const y = startY + fall * speed;
      const alpha = Math.max(0, 1 - p) * (0.55 + seedSize * 0.45);
      const size = 1.2 + seedSize * 2;

      const [r, g, b] = STONE_PARTICLE_COLORS[i % STONE_PARTICLE_COLORS.length];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }
};

// ======================================================
// 아이-지선 노디 스캔 — 무작위로 배치된 3개 타겟을 순서대로 응시 + 고개로 맞추는 트래킹.
// targets/pointer는 handUtils의 getSafeTargetPosition과 동일한 정규화 화면 좌표(0~1,
// x/y)이며, pointer는 머리 회전을 LERP로 부드럽게 스무딩한 값을 화면 좌표로 매핑한 것이다.
// activeIndex 이전 타겟은 완료 표시, activeIndex 타겟은 홀드 진행 링(0.8초)이 함께
// 표시되고, burstIndex/burstProgress로 방금 완료된 타겟 위치에서 은은한 파동이 퍼진다.
// ======================================================
export const drawGazeNodTargets = (ctx, w, h, {
  pointer = { x: 0.5, y: 0.5 },
  targets = [],
  activeIndex = 0,
  onTarget = false,
  holdProgress = 0,
  burstProgress = 0,
  burstIndex = 0,
}) => {
  const toPx = (pos) => ({ x: pos.x * w, y: pos.y * h });
  const targetRadius = Math.min(w, h) * 0.055;

  ctx.save();

  targets.forEach((target, i) => {
    const pos = toPx(target);
    const isDone = i < activeIndex;
    const isActive = i === activeIndex;

    if (isDone) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, targetRadius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(160,255,210,0.9)";
      ctx.shadowColor = "rgba(160,255,210,0.6)";
      ctx.shadowBlur = 14;
      ctx.fill();
      return;
    }

    const active = isActive && onTarget;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, targetRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isActive
      ? (active ? "rgba(160,255,230,0.95)" : "rgba(120,220,255,0.85)")
      : "rgba(255,255,255,0.22)";
    ctx.lineWidth = isActive ? 3 : 2;
    if (isActive) {
      ctx.shadowColor = active ? "rgba(160,255,230,0.9)" : "rgba(120,220,255,0.55)";
      ctx.shadowBlur = active ? 24 : 10;
    }
    ctx.stroke();

    if (isActive && holdProgress > 0) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, targetRadius + 9, -Math.PI / 2, -Math.PI / 2 + holdProgress * Math.PI * 2);
      ctx.strokeStyle = "rgba(160,255,230,0.95)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  });

  // 현재 머리 방향 포인터
  const pointerPos = toPx(pointer);
  ctx.beginPath();
  ctx.arc(pointerPos.x, pointerPos.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fill();

  // 단계 성공 파동 — 방금 완료된 타겟 위치에서 한 번 은은하게 퍼지며 사라짐
  if (burstProgress > 0 && targets[burstIndex]) {
    const p = Math.min(1, burstProgress);
    const burstPos = toPx(targets[burstIndex]);
    ctx.save();
    [0, 0.15].forEach((delay) => {
      const rp = p - delay;
      if (rp <= 0 || rp > 1) return;
      const radius = targetRadius + rp * Math.min(w, h) * 0.22;
      ctx.beginPath();
      ctx.arc(burstPos.x, burstPos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160,255,210,${(1 - rp) * 0.65})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    ctx.restore();
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
// 목/어깨 공용 — 미니멀 진행 링 (3D 오브젝트/게이지 대신 사용하는 단순 피드백)
// progress: 0~1, active: 목표 동작을 유지 중이면 true (링 색이 민트로 바뀜)
// ======================================================
export const drawMinimalFeedback = (ctx, w, h, { progress, active }) => {
  const ratio = Math.min(1, Math.max(0, progress));
  const cx = w / 2;
  const cy = h * 0.16;
  const radius = Math.min(w, h) * 0.05;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.stroke();

  if (ratio > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
    ctx.strokeStyle = active ? "rgba(150,230,190,0.95)" : "rgba(255,255,255,0.85)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();
};

// ======================================================
// 핀치 링 — 손별 핀치 링 + 중앙 목표 원 (rings: [{x,y,sizePercent}], 좌표는 0~1 정규화)
// ======================================================
export const drawPinchRings = (ctx, w, h, { rings, targetSizePercent, matched, holdProgress = 0 }) => {
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

  // 유지(hold) 진행 링 — 링 크기가 목표에 맞춰진 채로 유지될수록 목표 원 테두리를 따라 점점 채워진다
  if (holdProgress > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, targetRadius + 9, -Math.PI / 2, -Math.PI / 2 + holdProgress * Math.PI * 2);
    ctx.strokeStyle = "rgba(160,255,230,0.95)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
  }

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

const easeSmoothstep = (t) => t * t * (3 - 2 * t);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const lerpValue = (a, b, t) => a + (b - a) * t;

const SUN_RAY_COUNT = 10;

// 해 본체 + 은은한 글로우 + 절제된 광선을 (x,y)에 그린다. intensity(0~1)는 떠오른 정도에 따른 광선 길이 계수.
const drawSunGlowAndRays = (ctx, x, y, radius, alpha, intensity) => {
  ctx.save();

  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.6);
  glow.addColorStop(0, `rgba(255,236,205,${0.45 * alpha})`);
  glow.addColorStop(1, "rgba(255,236,205,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius * 2.6, y - radius * 2.6, radius * 5.2, radius * 5.2);

  ctx.strokeStyle = `rgba(255,238,210,${0.2 * alpha})`;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  for (let i = 0; i < SUN_RAY_COUNT; i += 1) {
    const angle = (Math.PI * 2 * i) / SUN_RAY_COUNT;
    const rayLen = radius * (1.5 + 0.5 * intensity);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * radius * 1.05, y + Math.sin(angle) * radius * 1.05);
    ctx.lineTo(x + Math.cos(angle) * rayLen, y + Math.sin(angle) * rayLen);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  const disc = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.3, radius * 0.1, x, y, radius);
  disc.addColorStop(0, `rgba(255,247,232,${alpha})`);
  disc.addColorStop(0.55, `rgba(255,214,158,${alpha})`);
  disc.addColorStop(1, `rgba(255,186,120,${alpha * 0.9})`);
  ctx.fillStyle = disc;
  ctx.fill();

  ctx.restore();
};

// ======================================================
// 해 뜨기 — 입을 벌린 정도(riseProgress, 0~1)에 비례해 지평선 아래에서 따뜻한 햇살이 천천히 떠오르고,
// 입을 다무는 순간(convergeProgress, 0~1) 화면 중앙으로 모여들며 전체가 은은하게 밝아진다.
// convergeFromRise: 수렴이 시작된 순간 해가 떠 있던 높이 — 그 위치를 출발점으로 중앙까지 이동한다.
// 원색·파티클 대신 절제된 그라데이션과 얇은 광선만 사용한다.
// ======================================================
export const drawSunrise = (ctx, w, h, { riseProgress = 0, convergeProgress = 0, convergeFromRise = 0 }) => {
  const horizonY = h * 0.76;
  const skyTopY = h * 0.2;
  const baseRadius = Math.min(w, h) * 0.15;
  const cx = w / 2;

  ctx.save();

  if (convergeProgress > 0) {
    const ease = easeOutCubic(Math.min(1, convergeProgress));
    const startY = horizonY - easeSmoothstep(convergeFromRise) * (horizonY - skyTopY);
    const sunY = lerpValue(startY, h / 2, ease);
    const radius = baseRadius * (1 - ease * 0.3);
    const sunAlpha = 1 - ease * 0.5;

    drawSunGlowAndRays(ctx, cx, sunY, radius, sunAlpha, ease);

    // 화면 전체를 은은하게 밝히는 플래시 — 수렴 진행의 중간에서 가장 밝고 다시 가라앉는다
    const flashAlpha = Math.sin(Math.min(1, convergeProgress) * Math.PI) * 0.85;
    if (flashAlpha > 0.01) {
      const flash = ctx.createRadialGradient(cx, h / 2, 0, cx, h / 2, Math.max(w, h) * 0.75);
      flash.addColorStop(0, `rgba(255,244,222,${flashAlpha})`);
      flash.addColorStop(0.6, `rgba(255,225,180,${flashAlpha * 0.55})`);
      flash.addColorStop(1, "rgba(255,225,180,0)");
      ctx.fillStyle = flash;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
    return;
  }

  const rise = Math.min(1, Math.max(0, riseProgress));
  const ease = easeSmoothstep(rise);
  const sunY = horizonY - ease * (horizonY - skyTopY);
  const radius = baseRadius * (0.82 + ease * 0.18);

  // 해가 떠오르기 전부터 지평선 아래에서 미리 은은하게 밝아오는 여명
  const dawnAlpha = 0.1 + ease * 0.2;
  const dawn = ctx.createRadialGradient(cx, horizonY, 0, cx, horizonY, Math.min(w, h) * 0.5);
  dawn.addColorStop(0, `rgba(255,210,150,${dawnAlpha})`);
  dawn.addColorStop(1, "rgba(255,210,150,0)");
  ctx.fillStyle = dawn;
  ctx.fillRect(0, skyTopY, w, horizonY - skyTopY + 2);

  // 지평선 위쪽으로만 보이도록 클리핑해 해가 서서히 떠오르는 것처럼 보이게 한다
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, horizonY);
  ctx.clip();
  drawSunGlowAndRays(ctx, cx, sunY, radius, 0.35 + ease * 0.65, ease);
  ctx.restore();

  // 지평선 라인 — 가늘고 은은한 골드 그라데이션
  const lineGrad = ctx.createLinearGradient(cx - w * 0.32, horizonY, cx + w * 0.32, horizonY);
  lineGrad.addColorStop(0, "rgba(255,225,180,0)");
  lineGrad.addColorStop(0.5, `rgba(255,230,190,${0.3 + ease * 0.3})`);
  lineGrad.addColorStop(1, "rgba(255,225,180,0)");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.32, horizonY);
  ctx.lineTo(cx + w * 0.32, horizonY);
  ctx.stroke();

  ctx.restore();
};
