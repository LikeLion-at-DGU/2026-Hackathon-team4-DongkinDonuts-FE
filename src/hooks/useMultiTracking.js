import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { getDistance, normalizeAngleDeg } from "../utils/handUtils";
import { TRACKING_CONFIG } from "../config/trackingConfig";

// MediaPipe FaceLandmarker 468 랜드마크 토폴로지 기준 눈 6포인트(EAR용) 인덱스
const RIGHT_EYE = { outer: 33, inner: 133, top1: 160, top2: 158, bottom1: 144, bottom2: 153 };
const LEFT_EYE = { outer: 263, inner: 362, top1: 385, top2: 387, bottom1: 380, bottom2: 373 };
const MOUTH = { top: 13, bottom: 14, left: 61, right: 291 };
// 머리 회전(Pitch/Yaw) 추정에 사용하는 코끝/턱/양쪽 광대 인덱스
const NOSE_TIP = 1;
const CHIN = 152;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;

// Vision WASM 런타임은 모든 트래킹 타입이 공유하므로 앱 수명 동안 한 번만 로드
let visionFilesetPromise = null;
const getVisionFileset = () => {
  if (!visionFilesetPromise) {
    visionFilesetPromise = FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
  }
  return visionFilesetPromise;
};

// GPU 위임이 실패하는 환경(GPU 드라이버/브라우저 문제)이 있어 실패 시 CPU로 재시도
const createWithFallback = async (LandmarkerClass, vision, options) => {
  try {
    return await LandmarkerClass.createFromOptions(vision, options);
  } catch (error) {
    console.error(`${LandmarkerClass.name} GPU 초기화 실패, CPU로 재시도합니다.`, error);
    return LandmarkerClass.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "CPU" },
    });
  }
};

const loadLandmarker = async (trackingType) => {
  const vision = await getVisionFileset();

  if (trackingType === "FACE_EYE") {
    return createWithFallback(FaceLandmarker, vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
  }
  if (trackingType === "POSE") {
    return createWithFallback(PoseLandmarker, vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.4,
      minPosePresenceConfidence: 0.4,
      minTrackingConfidence: 0.4,
    });
  }
  return createWithFallback(HandLandmarker, vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
};

// 트래킹 타입별 랜드마커 캐시. 같은 타입의 세션으로 전환될 때 모델을 다시 내려받지 않도록
// 앱 수명 동안 재사용하며, 세션 페이지가 마운트되기 전에 미리 로드를 시작할 수 있게 export한다.
const landmarkerCache = new Map();

export const preloadTracking = (trackingType) => {
  if (!trackingType) return null;
  if (!landmarkerCache.has(trackingType)) {
    const promise = loadLandmarker(trackingType).catch((error) => {
      console.error(`MediaPipe(${trackingType}) 프리로드에 실패했습니다.`, error);
      landmarkerCache.delete(trackingType);
      throw error;
    });
    landmarkerCache.set(trackingType, promise);
  }
  return landmarkerCache.get(trackingType);
};

const getEAR = (face, eye) => {
  const vertical =
    getDistance(face[eye.top1], face[eye.bottom1]) +
    getDistance(face[eye.top2], face[eye.bottom2]);
  const horizontal = getDistance(face[eye.outer], face[eye.inner]) || 1e-6;
  return vertical / (2 * horizontal);
};

// 코끝(1)·턱(152)·양쪽 광대(234,454)로 머리 회전(Pitch/Yaw)을 추정한다.
// 좌표는 다른 필드(noseTip 등)와 동일하게 미러링(1-x)을 반영한 뒤 계산해 부호 기준을 통일한다.
// yaw: 코끝이 광대 중점 대비 좌우로 치우친 정도 (양수 = 오른쪽으로 회전)
// pitch: 코끝이 광대-턱 기준선 대비 위로 들린 정도 (양수 = 위를 향해 회전)
const getHeadPose = (face) => {
  const nose = face[NOSE_TIP];
  const chin = face[CHIN];
  const leftCheek = face[LEFT_CHEEK];
  const rightCheek = face[RIGHT_CHEEK];

  const noseX = 1 - nose.x;
  const leftCheekX = 1 - leftCheek.x;
  const rightCheekX = 1 - rightCheek.x;
  const cheekMidX = (leftCheekX + rightCheekX) / 2;
  const cheekHalfWidth = Math.abs(rightCheekX - leftCheekX) / 2 || 1e-6;
  const yaw = (noseX - cheekMidX) / cheekHalfWidth;

  const cheekMidY = (leftCheek.y + rightCheek.y) / 2;
  const faceHeight = Math.abs(chin.y - cheekMidY) || 1e-6;
  const pitch = (cheekMidY - nose.y) / faceHeight;

  return { yaw, pitch };
};

export const useMultiTracking = (trackingType = "HAND", { paused = false } = {}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [trackingData, setTrackingData] = useState({});

  // 1. 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error("카메라 접근 실패:", err);
    }
  }, []);

  // 완료 모달이 떠 있는 동안(paused) 실제 카메라 영상 재생도 멈춰서 뒤 화면이 완전히 정지된 것처럼
  // 보이게 하고, 취소로 세션이 재개되면 다시 재생한다.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else if (cameraReady) {
      video.play().catch(() => {});
    }
  }, [paused, cameraReady]);

  // 2. MediaPipe 세션별 모델 초기화 (모듈 캐시에 이미 있으면 즉시 반환 - 프리로드된 경우 대기 없음)
  const initLandmarker = useCallback(async () => {
    try {
      landmarkerRef.current = await preloadTracking(trackingType);
    } catch {
      // 실패 로그는 preloadTracking/createWithFallback에서 이미 출력됨
    }
  }, [trackingType]);

  // 3. 실시간 프레임 감지 분석
  const detectFrame = useCallback((timestamp) => {
    const video = videoRef.current;
    const detector = landmarkerRef.current;
    if (!video || !detector || video.readyState < 2) return null;

    const res = detector.detectForVideo(video, timestamp);
    let parsedMetrics = {};

    if (trackingType === "FACE_EYE" && res.faceLandmarks?.[0]) {
      const face = res.faceLandmarks[0];

      // EAR (Eye Aspect Ratio): 눈 크기로 정규화되어 카메라 거리와 무관하게 동작
      const earAvg = (getEAR(face, RIGHT_EYE) + getEAR(face, LEFT_EYE)) / 2;
      const isBlinking = earAvg < TRACKING_CONFIG.earClosedThreshold;

      // 머리 회전(Pitch/Yaw): 코끝/턱/광대 좌표 기반 원시 비율 (세션에서 기준값 대비 델타로 사용)
      const { yaw: headYaw, pitch: headPitch } = getHeadPose(face);

      // MAR (Mouth Aspect Ratio): 입 벌림 감지
      const mouthRatio = getDistance(face[MOUTH.top], face[MOUTH.bottom]) /
        (getDistance(face[MOUTH.left], face[MOUTH.right]) || 1e-6);
      const isMouthOpen = mouthRatio > TRACKING_CONFIG.mouthOpenRatioThreshold;

      // 입 중심 좌표 (미러링 반영) - 얼음 위치와의 거리 판정 등에 사용
      const mouthCenterRaw = {
        x: (face[MOUTH.top].x + face[MOUTH.bottom].x + face[MOUTH.left].x + face[MOUTH.right].x) / 4,
        y: (face[MOUTH.top].y + face[MOUTH.bottom].y + face[MOUTH.left].y + face[MOUTH.right].y) / 4,
      };
      const mouthCenter = { x: 1 - mouthCenterRaw.x, y: mouthCenterRaw.y };

      parsedMetrics = { isBlinking, earAvg, headYaw, headPitch, isMouthOpen, mouthRatio, mouthCenter, raw: face };
    }
    else if (trackingType === "POSE" && res.landmarks?.[0]) {
      const pose = res.landmarks[0];
      const leftEye = pose[2];
      const rightEye = pose[5];
      const leftEar = pose[7];
      const rightEar = pose[8];
      const leftShoulder = pose[11];
      const rightShoulder = pose[12];

      // 목 기울기: 눈-라인/귀-라인처럼 서로 가까운 두 점의 각도(atan2)를 쓰면 분모(두 점 사이
      // 거리)가 작아 랜드마크 노이즈가 각도로 크게 증폭되어 감지가 매우 불안정해진다.
      // 대신 "머리 기준점 → 어깨 중점" 벡터(거리가 훨씬 길어 노이즈에 강함)의 기울기를 쓴다.
      // 머리 기준점은 눈 중점과 귀 중점을 각각의 visibility로 가중 평균해 구하며, 큰 각도로
      // 기울일수록 한쪽 귀/눈이 가려져 visibility가 낮아지므로 더 신뢰도 높은 쪽에 가중치를 싣는다.
      const eyeMid = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
      const earMid = { x: (leftEar.x + rightEar.x) / 2, y: (leftEar.y + rightEar.y) / 2 };
      const eyeVisibility = Math.min(leftEye.visibility ?? 1, rightEye.visibility ?? 1);
      const earVisibility = Math.min(leftEar.visibility ?? 1, rightEar.visibility ?? 1);
      const visibilityTotal = eyeVisibility + earVisibility;
      const headPoint = visibilityTotal > 1e-3
        ? {
            x: (eyeMid.x * eyeVisibility + earMid.x * earVisibility) / visibilityTotal,
            y: (eyeMid.y * eyeVisibility + earMid.y * earVisibility) / visibilityTotal,
          }
        : { x: (eyeMid.x + earMid.x) / 2, y: (eyeMid.y + earMid.y) / 2 };
      const shoulderMid = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };

      // atan2는 이론상 -180°~180°까지 반환하지만, 사람이 고개를 옆으로 기울이는 동작이나
      // 어깨가 기울어지는 정도는 절대 ±90°를 넘지 않으므로 여기서 미리 클램프해 랜드마크
      // 노이즈로 인한 극단값 유입을 막는다.
      const clampAngleRad = (rad) => Math.min(Math.PI / 2, Math.max(-Math.PI / 2, rad));
      // 이미지 좌표는 y가 아래로 증가하므로, 머리가 어깨보다 위(정상 자세)일 때 dy(=shoulderMid.y - headPoint.y)가
      // 양수가 되도록 잡아 atan2(dx, dy)가 "수직 위"를 0°로 삼는 각도를 돌려주게 한다.
      const headLeanAngle = clampAngleRad(
        Math.atan2(headPoint.x - shoulderMid.x, shoulderMid.y - headPoint.y)
      );
      const shoulderAngle = clampAngleRad(Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x));
      // 몸 전체(또는 카메라)가 기울어진 만큼(shoulderAngle)을 빼서 어깨 대비 순수한 목 기울기만 남긴다.
      // 원본 좌표계 기준 각도를 그대로 쓰면 화면(미러링된 화면 기준) 상 지표 이동 방향이
      // 실제 고개를 기울이는 방향과 반대로 보이므로 부호를 반전해 방향을 일치시킨다.
      // normalizeAngleDeg: 두 각도의 차가 ±180° 경계를 넘나들 때(예: 179° - (-179°) = 358°)
      // 발생하는 불연속 점프를 -180~180 범위로 감싸 UI 순간이동(teleport)을 방지한다.
      const neckTiltDeg = -normalizeAngleDeg((headLeanAngle - shoulderAngle) * (180 / Math.PI));

      // 어깨 으쓱: 코/귀 등 머리 랜드마크를 기준으로 삼으면 고개를 숙이거나 젖히기만 해도
      // 머리-어깨 거리가 줄어들어 "어깨를 으쓱했다"로 오인식된다. 머리 움직임과 완전히
      // 무관하도록 어깨 랜드마크 자체의 수직(y) 위치와 어깨너비(카메라 거리 정규화용)만
      // 원시값으로 넘기고, "평소 어깨 위치" 대비 변화량(Delta) 계산은 세션별로 baseline을
      // 보정해야 하는 페이지 쪽(ShoulderPmrRoutinePage)에서 담당한다.
      const shoulderWidth = getDistance(leftShoulder, rightShoulder) || 1e-6;

      parsedMetrics = { neckTiltDeg, shoulderY: shoulderMid.y, shoulderWidth, raw: pose };
    }
    else if (trackingType === "HAND" && res.landmarks?.length) {
      // 손마다 엄지(4)-검지(8) 핀치 거리를 계산 (양손 핀치 링 미션용)
      const hands = res.landmarks.map((hand) => ({
        palmCenter: { x: 1 - hand[9].x, y: hand[9].y },
        pinchDist: getDistance(hand[4], hand[8]),
      }));

      parsedMetrics = {
        isPinching: hands[0] ? hands[0].pinchDist < 0.05 : false,
        palmCenter: hands[0]?.palmCenter,
        hands,
        handCount: hands.length,
        raw: res.landmarks,
      };
    }

    setTrackingData(parsedMetrics);
    return parsedMetrics;
  }, [trackingType]);

  // 랜드마커는 모듈 캐시가 소유(다음 세션에서 재사용)하므로 여기서는 close()하지 않고
  // 카메라 스트림(페이지별 자원)만 정리한다.
  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current = null;
  }, []);

  return { videoRef, cameraReady, trackingData, startCamera, initLandmarker, detectFrame, cleanup };
};