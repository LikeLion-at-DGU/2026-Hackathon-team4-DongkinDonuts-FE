// 세션별 캔버스 이펙트 (2D Canvas 기반 스타일라이즈 연출)

// Canvas 해상도를 컨테이너 크기 + devicePixelRatio에 맞춰 조율하고 컨텍스트를 비워서 반환
export const prepareCanvas = (canvas) => {
  if (!canvas) return null;
  const container = canvas.parentElement;
  if (!container) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return null;

  // App.jsx의 반응형 전체 배율(CSS zoom)이 적용되면 clientWidth/Height는 확대되기 전의
  // 논리 크기를 그대로 돌려주는 반면, getBoundingClientRect()는 실제로 화면에 렌더링되는
  // 픽셀 크기를 돌려준다. devicePixelRatio만으로 캔버스 백킹 해상도를 잡으면 이 zoom
  // 배율만큼 해상도가 모자라 게이지가 흐릿하게 보이므로, 실제 렌더 크기와의 비율을
  // devicePixelRatio에 곱해 보정한다.
  const rect = container.getBoundingClientRect();
  const zoomScale = rect.width / width;
  const dpr = (window.devicePixelRatio || 1) * zoomScale;
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
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

export const drawEyeBlinkPulse = (ctx, w, h, { closeAmount = 0, popProgress = 0, failInfo = null }) => {
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

  // 성공 조건(blinkHoldMs)을 채우지 못하고 눈을 뜬 경우, "목표 대비 얼마나 부족했는지"가
  // 한눈에 보이도록 목표 전체를 점선 링으로 두고 실제로 유지한 만큼만 경고색 아크로 채워
  // 그 차이(부족분)를 시각적으로 드러낸다. 중앙에는 실제 유지 시간을, 그 아래 작게 필요한
  // 목표 시간을 함께 적어 "이만큼 부족했다"는 원인을 바로 읽을 수 있게 한다.
  if (failInfo) {
    const target = failInfo.targetSeconds || 1;
    const p = Math.min(1, Math.max(0, failInfo.progress));
    const fadeAlpha = p < 0.12 ? p / 0.12 : p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
    // 부족분이 항상 눈에 보이도록 아크가 완전히 닫히지는 않게 살짝 캡을 둔다
    const ratio = Math.min(0.94, Math.max(0.04, target > 0 ? failInfo.seconds / target : 0));
    const indicatorRadius = baseRadius + 16;
    const shortR = 255;
    const shortG = 122;
    const shortB = 105;

    ctx.save();
    ctx.globalAlpha = fadeAlpha;

    // 목표치 전체를 나타내는 은은한 점선 가이드 링
    ctx.beginPath();
    ctx.arc(cx, cy, indicatorRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 실제로 유지한 시간만큼만 채운 경고색 아크 — 링과의 빈틈이 곧 "부족했던 만큼"
    ctx.beginPath();
    ctx.arc(cx, cy, indicatorRadius, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
    ctx.strokeStyle = `rgba(${shortR}, ${shortG}, ${shortB}, 0.95)`;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.shadowColor = `rgba(${shortR}, ${shortG}, ${shortB}, 0.6)`;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 중앙에 실제 유지 시간을 큼직하게, 그 아래 필요한 목표 시간을 작게 덧붙인다
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${Math.round(Math.min(w, h) * 0.075)}px sans-serif`;
    ctx.fillStyle = `rgba(${shortR}, ${shortG + 30}, ${shortB + 30}, 1)`;
    ctx.fillText(`${failInfo.seconds.toFixed(1)}초`, cx, cy + Math.min(w, h) * 0.02);

    ctx.restore();
  }

  ctx.restore();
};

// ======================================================
// 목 좌우 기울이기 — 속도계 스타일의 소형 원호(Arc) 게이지. 캔버스 중앙에 ±maxDeg 범위만큼의
// 원호 트랙(5°/10° 눈금 포함)을 두고, 중심(cx,cy)에서 뻗어나가는 니들(바늘)이 현재 Head Roll
// 각도(currentDeg)를 가리킨다(오른쪽으로 기울이면 시계방향, 왼쪽으로 기울이면 반시계방향).
// 목표 각도 범위(targetMinDeg~targetMaxDeg)는 원호 위 구간(파란색)으로 강조되고, 니들이 그
// 구간에 들어와 정렬되면(aligned) 민트색으로 빛나면서 목표 유지 시간(holdProgress: 0~1) 동안
// 이 강조 구간이 점점 양쪽으로 넓어져 유지가 끝나는 순간 게이지 전체(±maxDeg)를 가득 채운다.
// burstProgress(0~1)가 주어지면 단계 성공 순간 중앙에서 파동이 한 번 퍼진다.
// ======================================================
export const drawTiltIndicator = (ctx, w, h, {
  currentDeg = 0,
  targetMinDeg = 15,
  targetMaxDeg = 25,
  maxDeg = 30,
  aligned = false,
  holdProgress = 0,
  burstProgress = 0,
}) => {
  const cx = w / 2;
  const cy = h * 0.6;
  const radius = Math.min(w, h) * 0.2;
  const trackWidth = Math.max(8, Math.min(w, h) * 0.018);

  const mintColor = "rgba(160,255,210,0.95)";
  const neutralColor = "rgba(255,255,255,0.9)";
  const activeColor = aligned ? mintColor : "rgba(120,200,255,0.85)";

  const clampDeg = (d) => Math.min(maxDeg, Math.max(-maxDeg, d));
  // 0°가 원호 맨 위(12시 방향)를 가리키도록 -90°를 기준점으로 잡고 deg를 그대로 더한다.
  // (오른쪽으로 기울이면(+deg) 시계방향, 왼쪽으로 기울이면(-deg) 반시계방향으로 회전)
  const degToCanvasAngle = (d) => -Math.PI / 2 + clampDeg(d) * (Math.PI / 180);

  ctx.save();

  // 배경 트랙 — 풀서클이 아닌 ±maxDeg 범위만 그리는 소형 원호
  const arcStart = degToCanvasAngle(-maxDeg);
  const arcEnd = degToCanvasAngle(maxDeg);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, arcStart, arcEnd);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = trackWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  // 5°/10° 간격 눈금 (10° 단위는 길고 밝게, 5° 단위는 짧고 흐리게)
  for (let d = -maxDeg; d <= maxDeg; d += 5) {
    const a = degToCanvasAngle(d);
    const isMajor = d % 10 === 0;
    const inner = radius - trackWidth / 2 - (isMajor ? 11 : 6);
    const outer = radius - trackWidth / 2 - 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.18)";
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.stroke();
  }

  // 목표 각도 가이드 구간 (Target Zone: targetMinDeg ~ targetMaxDeg)을 트랙 위 구간으로 강조.
  // 정렬 유지 중(holdProgress: 0~1)에는 이 구간이 양쪽으로 점점 넓어져, 유지가 끝나는 순간
  // 게이지 전체(-maxDeg~+maxDeg)를 가득 채우는 진행 표시를 겸한다.
  const holdP = Math.min(1, Math.max(0, holdProgress));
  const zoneMinDeg = Math.min(targetMinDeg, targetMaxDeg) + (-maxDeg - Math.min(targetMinDeg, targetMaxDeg)) * holdP;
  const zoneMaxDeg = Math.max(targetMinDeg, targetMaxDeg) + (maxDeg - Math.max(targetMinDeg, targetMaxDeg)) * holdP;
  const zoneStart = degToCanvasAngle(zoneMinDeg);
  const zoneEnd = degToCanvasAngle(zoneMaxDeg);
  ctx.save();
  if (aligned) {
    ctx.shadowColor = mintColor;
    ctx.shadowBlur = 18;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, zoneStart, zoneEnd);
  ctx.strokeStyle = activeColor;
  ctx.globalAlpha = aligned ? 0.9 : 0.65;
  ctx.lineWidth = trackWidth;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  // 현재 각도 니들 — 중심(허브)에서 뻗어나가 화살촉 모양으로 각도를 가리킨다
  const needleAngle = degToCanvasAngle(currentDeg);
  const shaftLen = radius - trackWidth / 2 - 12;
  const tipLen = shaftLen + 14;
  const perpAngle = needleAngle + Math.PI / 2;
  const arrowHalfWidth = 6;
  const shaftEndX = cx + Math.cos(needleAngle) * shaftLen;
  const shaftEndY = cy + Math.sin(needleAngle) * shaftLen;
  const tipX = cx + Math.cos(needleAngle) * tipLen;
  const tipY = cy + Math.sin(needleAngle) * tipLen;
  const markerColor = aligned ? mintColor : neutralColor;

  ctx.save();
  if (aligned) {
    ctx.shadowColor = mintColor;
    ctx.shadowBlur = 16;
  }
  // 니들 축
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(shaftEndX, shaftEndY);
  ctx.strokeStyle = markerColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  // 화살촉
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(shaftEndX + Math.cos(perpAngle) * arrowHalfWidth, shaftEndY + Math.sin(perpAngle) * arrowHalfWidth);
  ctx.lineTo(shaftEndX - Math.cos(perpAngle) * arrowHalfWidth, shaftEndY - Math.sin(perpAngle) * arrowHalfWidth);
  ctx.closePath();
  ctx.fillStyle = markerColor;
  ctx.fill();
  // 중심 허브
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = markerColor;
  ctx.fill();
  ctx.restore();

  // 현재 각도 숫자 (허브 아래, 속도계 디지털 리드아웃처럼 표시)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(Math.min(w, h) * 0.075)}px sans-serif`;
  ctx.fillStyle = aligned ? mintColor : "rgba(255,255,255,0.95)";
  ctx.fillText(`${currentDeg >= 0 ? "+" : ""}${Math.round(currentDeg)}°`, cx, cy + 46);

  // 단계 성공 파동 — 중앙에서 한 번 은은하게 퍼지며 사라짐
  if (burstProgress > 0) {
    const p = Math.min(1, burstProgress);
    ctx.save();
    [0, 0.15].forEach((delay) => {
      const rp = p - delay;
      if (rp <= 0 || rp > 1) return;
      const burstRadius = rp * Math.min(w, h) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, burstRadius, 0, Math.PI * 2);
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
// 목/기준점 오버레이 — 실제 카메라 프리뷰 위에, 목 기울기 계산에 쓰이는 두 기준점
// (정수리 근사 위치 headPoint, 목 중앙 피벗 neckPoint)을 그 프레임에 실제로 감지된 위치
// 그대로 점으로 찍어 인식이 어디를 보고 있는지 눈으로 확인시켜준다. 이 값은 가공하지 않은
// "진짜" 기준이며, 캔버스 쪽 게이지(drawTiltIndicator)가 이 실제 인식값을 잘 따라가는지는
// 게이지 쪽 스무딩/보정 로직을 조정해서 맞춘다. 두 점은 useMultiTracking이 돌려주는 원본
// (미러링 전) 정규화 좌표라, 실제 화면(미러링된 프리뷰) 기준 위치에 맞추기 위해 x를
// 반전(1-x)해서 그린다.
// ======================================================
export const drawHeadShoulderPoints = (ctx, w, h, { headPoint, neckPoint }) => {
  if (!headPoint || !neckPoint) return;
  const toPx = (p) => ({ x: (1 - p.x) * w, y: p.y * h });
  const head = toPx(headPoint);
  const neck = toPx(neckPoint);

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(neck.x, neck.y);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  const drawDot = (point, color) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
  };
  drawDot(head, "rgba(160,255,210,0.95)");
  drawDot(neck, "rgba(120,200,255,0.95)");

  ctx.restore();
};

// ======================================================
// 어깨 으쓱 — 화면 중앙의 원. 어깨를 으쓱 올려 긴장하는 동안(squeezeAmount: 0~1)
// 원이 점점 작게 스퀴즈되며 차분한 색에서 긴장을 나타내는 색으로 서서히 물들고,
// 어깨를 툭 떨어뜨리면 같은 값을 거꾸로 따라가며 원래 크기/색으로 그대로
// 원상복구된다 (별도의 등장/소멸 연출 없이 squeezeAmount 하나로만 왕복).
// ======================================================
export const drawShoulderCircle = (ctx, w, h, { squeezeAmount = 0 }) => {
  const cx = w / 2;
  const cy = h * 0.54;
  const baseR = Math.min(w, h) * 0.17;

  const squeeze = Math.min(1, Math.max(0, squeezeAmount));
  const r = baseR * (1 - squeeze * 0.32);

  const tone = (a, b) => Math.round(lerpValue(a, b, squeeze));
  // 이완: 차분한 파스텔 스카이블루 → 긴장: 따뜻한 코랄
  const bodyTop = [tone(214, 255), tone(232, 158), tone(255, 128)];
  const bodyMid = [tone(168, 244), tone(198, 108), tone(240, 96)];
  const bodyEdge = [tone(120, 210), tone(150, 74), tone(214, 70)];

  ctx.save();

  // 바닥 그림자 — 긴장이 쌓일수록 살짝 짙어지고 좁아진다
  const shadowW = r * 1.4;
  const shadowAlpha = 0.16 + squeeze * 0.14;
  const shadowY = cy + baseR * 0.92;
  const shadowGlow = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowW);
  shadowGlow.addColorStop(0, `rgba(20,20,24,${shadowAlpha})`);
  shadowGlow.addColorStop(1, "rgba(20,20,24,0)");
  ctx.beginPath();
  ctx.ellipse(cx, shadowY, shadowW, shadowW * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = shadowGlow;
  ctx.fill();

  // 긴장이 쌓일수록 또렷해지는 은은한 외곽 글로우
  const glowAlpha = squeeze * 0.35;
  if (glowAlpha > 0.01) {
    const glow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.6);
    glow.addColorStop(0, `rgba(${bodyEdge[0]},${bodyEdge[1]},${bodyEdge[2]},${glowAlpha})`);
    glow.addColorStop(1, `rgba(${bodyEdge[0]},${bodyEdge[1]},${bodyEdge[2]},0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }

  // 원 몸체 — 좌상단에서 비치는 조명을 받는 그라데이션
  const body = ctx.createRadialGradient(
    cx - r * 0.35, cy - r * 0.4, r * 0.1,
    cx, cy, r * 1.05
  );
  body.addColorStop(0, `rgb(${bodyTop[0]},${bodyTop[1]},${bodyTop[2]})`);
  body.addColorStop(0.6, `rgb(${bodyMid[0]},${bodyMid[1]},${bodyMid[2]})`);
  body.addColorStop(1, `rgb(${bodyEdge[0]},${bodyEdge[1]},${bodyEdge[2]})`);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // 긴장이 쌓일수록 또렷해지는 얇은 엣지 하이라이트
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255,255,255,${0.15 + squeeze * 0.25})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
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
