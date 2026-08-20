import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { getDistance } from "../utils/handUtils";
import { getUserMediaWithRetry } from "../utils/cameraUtils";
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
export const getVisionFileset = () => {
  if (!visionFilesetPromise) {
    visionFilesetPromise = FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
  }
  return visionFilesetPromise;
};

// GPU 위임이 실패하는 환경(GPU 드라이버/브라우저 문제)이 있어 실패 시 CPU로 재시도
export const createWithFallback = async (LandmarkerClass, vision, options) => {
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

// MediaPipe Hands 손가락 끝 랜드마크 인덱스: 엄지·검지·중지·약지·새끼
const FINGERTIPS = [4, 8, 12, 16, 20];

// 다섯 손가락 끝 중 가장 멀리 떨어진 두 점 사이 거리(= 다섯 점을 모두 담는 원의 지름 근사치)
const getFingertipSpanDist = (hand) => {
  let maxDist = 0;
  for (let i = 0; i < FINGERTIPS.length; i += 1) {
    for (let j = i + 1; j < FINGERTIPS.length; j += 1) {
      const dist = getDistance(hand[FINGERTIPS[i]], hand[FINGERTIPS[j]]);
      if (dist > maxDist) maxDist = dist;
    }
  }
  return maxDist;
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

const CAMERA_CONSTRAINTS = { video: { width: 1280, height: 720, facingMode: "user" } };

// 트래킹 타입별 화면 거리 판정 임계값(정규화 좌표 기준 크기 지표) 매핑
const DISTANCE_THRESHOLDS = {
  HAND: { far: TRACKING_CONFIG.handDistanceFar, near: TRACKING_CONFIG.handDistanceNear, close: TRACKING_CONFIG.handDistanceClose },
  FACE_EYE: { far: TRACKING_CONFIG.faceDistanceFar, near: TRACKING_CONFIG.faceDistanceNear, close: TRACKING_CONFIG.faceDistanceClose },
  POSE: { far: TRACKING_CONFIG.poseDistanceFar, near: TRACKING_CONFIG.poseDistanceNear, close: TRACKING_CONFIG.poseDistanceClose },
};

export const useMultiTracking = (trackingType = "HAND", { paused = false } = {}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  // 진행 중인 getUserMedia() 요청을 담아둔다(중복 요청 방지용, 아래 startCamera 주석 참고).
  const cameraRequestRef = useRef(null);
  const distanceRef = useRef({ value: 50, status: "적정" });
  const lastDistanceUpdateRef = useRef(0);
  const distanceLostCountRef = useRef(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [trackingData, setTrackingData] = useState({});
  const [screenDistance, setScreenDistance] = useState({ value: 50, status: "적정" });

  // 1. 카메라 시작
  const startCamera = useCallback(() => {
    // 이미 진행 중인 요청이 있으면 새로 getUserMedia()를 또 부르지 않고 그 요청을 그대로
    // 재사용한다. React StrictMode(개발 모드)의 mount→unmount→mount 이중 실행이나 세션 페이지를
    // 빠르게 오갈 때 startCamera()가 응답이 오기 전에 다시 호출되면, 같은 카메라 장치를 향해
    // getUserMedia()를 동시에 두 번 요청하게 되어 장치를 점유하지 못하고
    // "AbortError: Timeout starting video source"로 실패하는 경우가 있었다 — 요청을 하나로
    // 합쳐서 애초에 동시 요청 자체가 발생하지 않게 막는다.
    if (cameraRequestRef.current) return cameraRequestRef.current;

    const request = (async () => {
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const stream = await getUserMediaWithRetry(CAMERA_CONSTRAINTS);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error("카메라 접근 실패:", err);
      } finally {
        cameraRequestRef.current = null;
      }
    })();
    cameraRequestRef.current = request;
    return request;
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
    // 화면 거리 지표: 손 = 손목-중지 MCP 거리, 얼굴 = 양쪽 광대 사이 거리, 포즈 = 어깨너비.
    // 각 분기에서 랜드마크가 감지된 경우에만 채워지며, 아래에서 DISTANCE_THRESHOLDS로 판정한다.
    let distanceSize = null;

    if (trackingType === "FACE_EYE" && res.faceLandmarks?.[0]) {
      const face = res.faceLandmarks[0];
      distanceSize = getDistance(face[LEFT_CHEEK], face[RIGHT_CHEEK]);

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
      const mouthLeft = pose[9];
      const mouthRight = pose[10];
      const leftShoulder = pose[11];
      const rightShoulder = pose[12];

      // 정수리(머리 꼭대기) 근사: Pose 랜드마크에는 정수리가 없어, 눈 중점 → 입 중점 벡터로
      // "얼굴이 향하는 아래쪽 방향"을 구한 뒤 그 반대(위쪽)로 일정 비율 더 뻗어 정수리 위치를
      // 추정한다. 어깨 방향 벡터로 외삽하면 지금 구하려는 목 기울기 자체가 근사에 다시 섞여
      // 들어가므로(순환 오차), 얼굴 랜드마크만으로 독립적으로 추정한다.
      // 단, 눈-입 벡터는 두 점 사이 거리가 짧아 랜드마크 노이즈에 민감하다(외삽 비율을 키울수록
      // 그 노이즈도 함께 증폭됨) — 30° 근처에서 값이 튀어 최대치로 튕겨나가는(overflow) 원인이
      // 될 수 있어 외삽 비율을 크지 않게(1.1→0.6) 낮춰 안정성을 우선한다.
      const eyeMid = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
      const mouthMid = { x: (mouthLeft.x + mouthRight.x) / 2, y: (mouthLeft.y + mouthRight.y) / 2 };
      const CROWN_EXTEND_RATIO = 0.6;
      const headPoint = {
        x: eyeMid.x + (eyeMid.x - mouthMid.x) * CROWN_EXTEND_RATIO,
        y: eyeMid.y + (eyeMid.y - mouthMid.y) * CROWN_EXTEND_RATIO,
      };
      const shoulderMid = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };

      // 어깨 으쓱: 코/귀 등 머리 랜드마크를 기준으로 삼으면 고개를 숙이거나 젖히기만 해도
      // 머리-어깨 거리가 줄어들어 "어깨를 으쓱했다"로 오인식된다. 머리 움직임과 완전히
      // 무관하도록 어깨 랜드마크 자체의 수직(y) 위치와 어깨너비(카메라 거리 정규화용)만
      // 원시값으로 넘기고, "평소 어깨 위치" 대비 변화량(Delta) 계산은 세션별로 baseline을
      // 보정해야 하는 페이지 쪽(ShoulderPmrRoutinePage)에서 담당한다.
      const shoulderWidth = getDistance(leftShoulder, rightShoulder) || 1e-6;

      // 목 기울기 계산의 기준점(pivot)을 어깨 중점이 아니라 그보다 살짝 위인 "목 중앙"으로 잡는다.
      // headPoint(정수리)-shoulderMid 직선을 따라 그대로 위로 옮기면 방향이 같아 각도 계산상
      // 아무 의미가 없으므로(atan2는 벡터 스케일에 불변), 화면 수직 방향(image y축)으로 어깨너비에
      // 비례한 만큼만 살짝 띄워 실제로 다른 피벗이 되도록 한다.
      const NECK_CENTER_UP_RATIO = 0.28;
      const neckPoint = { x: shoulderMid.x, y: shoulderMid.y - shoulderWidth * NECK_CENTER_UP_RATIO };

      // 목 기울기 = "어깨선(왼쪽→오른쪽 벡터)에 목선(목 중앙→정수리 벡터)이 수직인 상태"를 0°로
      // 삼는 부호 있는 각도. 두 벡터의 내적(dot)·외적(cross)에 atan2(dot, cross)를 취하면
      // - 완전히 수직일 때 dot=0 → 0°
      // - 오른쪽 어깨 쪽으로 목이 기울수록 dot>0 → 양수(+)
      // - 왼쪽 어깨 쪽으로 목이 기울수록 dot<0 → 음수(-)
      // 가 되고, 몸/카메라 전체가 함께 회전해도 어깨선·목선이 같이 돌아가 dot·cross 관계가
      // 그대로 유지되므로(회전에 대해 불변) 예전처럼 어깨 기울기를 별도로 빼서 보정할 필요가
      // 없다. atan2라 항상 -180°~180° 범위의 값을 끊김 없이(선형적으로) 돌려준다.
      const shoulderVec = { x: rightShoulder.x - leftShoulder.x, y: rightShoulder.y - leftShoulder.y };
      const neckVec = { x: headPoint.x - neckPoint.x, y: headPoint.y - neckPoint.y };
      const dot = shoulderVec.x * neckVec.x + shoulderVec.y * neckVec.y;
      const cross = shoulderVec.x * neckVec.y - shoulderVec.y * neckVec.x;
      const neckTiltDeg = Math.atan2(dot, cross) * (180 / Math.PI);

      distanceSize = shoulderWidth;

      // headPoint/neckPoint: 카메라 원본(미러링 전) 좌표 그대로 노출한다. 화면(미러링된
      // 프리뷰) 위에 그릴 때는 그리는 쪽에서 x를 반전(1-x)해서 사용한다.
      parsedMetrics = { neckTiltDeg, headPoint, neckPoint, shoulderY: shoulderMid.y, shoulderWidth, raw: pose };
    }
    else if (trackingType === "HAND" && res.landmarks?.length) {
      // 손마다 5개 손가락 끝(엄지 4·검지 8·중지 12·약지 16·새끼 20)이 만드는 원의 크기를 계산
      // (양손 핀치 링 미션용). 다섯 손가락 끝 중 가장 멀리 떨어진 두 점 사이 거리를 그 원의
      // 지름으로 삼아, 손을 오므리면 작아지고 다섯 손가락을 활짝 펴면 커지도록 한다.
      const hands = res.landmarks.map((hand) => ({
        palmCenter: { x: 1 - hand[9].x, y: hand[9].y },
        pinchDist: getFingertipSpanDist(hand),
      }));
      // 화면 거리는 첫 번째 손의 손목(0)-중지 MCP(9) 거리로 판정 (useHandTracking과 동일한 지표)
      distanceSize = getDistance(res.landmarks[0][0], res.landmarks[0][9]);

      parsedMetrics = {
        isPinching: hands[0] ? hands[0].pinchDist < 0.05 : false,
        palmCenter: hands[0]?.palmCenter,
        hands,
        handCount: hands.length,
        raw: res.landmarks,
      };
    }

    if (distanceSize != null) {
      distanceLostCountRef.current = 0;
      const { far, near, close } = DISTANCE_THRESHOLDS[trackingType];
      const status = distanceSize < far ? "너무 멀어요" : distanceSize < near ? "적정" : "너무 가까워요";
      const rawValue =
        distanceSize < far
          ? (distanceSize / far) * 35
          : distanceSize < near
            ? 35 + ((distanceSize - far) / (near - far)) * 30
            : 65 + Math.min(35, ((distanceSize - near) / (close - near)) * 35);
      const value = Math.max(0, Math.min(100, rawValue));
      const smoothValue = distanceRef.current.value * 0.75 + value * 0.25;
      distanceRef.current = { value: smoothValue, status };
      if (timestamp - lastDistanceUpdateRef.current >= TRACKING_CONFIG.distanceUpdateInterval) {
        lastDistanceUpdateRef.current = timestamp;
        setScreenDistance({ value: smoothValue, status });
      }
    } else if (++distanceLostCountRef.current >= TRACKING_CONFIG.distanceLostMaxFrames) {
      setScreenDistance((current) => (current.status === "인식하지 못함" ? current : { value: 5, status: "인식하지 못함" }));
    }

    setTrackingData(parsedMetrics);
    return parsedMetrics;
  }, [trackingType]);

  // 랜드마커는 모듈 캐시가 소유(다음 세션에서 재사용)하므로 여기서는 close()하지 않고
  // 카메라 스트림(페이지별 자원)만 정리한다. srcObject도 비워서 비디오 엘리먼트가 스트림을
  // 붙잡고 있지 않게 하면, 브라우저가 카메라 장치를 더 빨리 반납해 다음 startCamera() 호출이
  // "장치 사용 중" 타임아웃 없이 곧바로 성공할 가능성이 높아진다.
  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current = null;
  }, []);

  return { videoRef, cameraReady, trackingData, screenDistance, startCamera, initLandmarker, detectFrame, cleanup };
};