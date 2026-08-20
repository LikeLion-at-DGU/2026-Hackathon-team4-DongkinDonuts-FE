export const CONFIG = {
  positionSmooth: 0.32,
  fistEnterThreshold: 3.7,
  fistExitThreshold: 2.4,

  ballGrabDistance: 0.10,
  ballFollowSmooth: 0.35,
  ballReleaseDelay: 120,

  lostHandGraceTime: 350,
  distanceUpdateInterval: 100,
  handLostMaxFrames: 15,

  // 움직이는 목표(MOVING_TARGET)의 이동 범위.
  // 좌상단 카메라 미리보기 박스(디자인 기준 left 55px/top 28px/390x239px, 캔버스
  // 1345x721px 기준 정규화 시 x 0~0.33, y 0~0.37)와 겹치지 않도록, 타겟 반경(0.11)만큼
  // 여유를 둔 x >= 0.40을 항상 만족시켜 카메라 뒤로 넘어가지 않게 한다.
  // (참고: utils/handUtils.js의 CAMERA_PREVIEW_EXCLUSION_X/Y와 동일한 제외 영역 기준)
  movingTargetBounds: { xMin: 0.40, xMax: 0.80, yMin: 0.25, yMax: 0.60 },
};