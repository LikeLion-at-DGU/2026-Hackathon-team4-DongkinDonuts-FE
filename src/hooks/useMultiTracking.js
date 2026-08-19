import { useCallback, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { getDistance } from "../utils/handUtils";
import { TRACKING_CONFIG } from "../config/trackingConfig";

// MediaPipe FaceLandmarker 468 랜드마크 토폴로지 기준 눈 6포인트(EAR용) 인덱스
const RIGHT_EYE = { outer: 33, inner: 133, top1: 160, top2: 158, bottom1: 144, bottom2: 153 };
const LEFT_EYE = { outer: 263, inner: 362, top1: 385, top2: 387, bottom1: 380, bottom2: 373 };
const RIGHT_IRIS = 468;
const LEFT_IRIS = 473;
const MOUTH = { top: 13, bottom: 14, left: 61, right: 291 };

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

const getEAR = (face, eye) => {
  const vertical =
    getDistance(face[eye.top1], face[eye.bottom1]) +
    getDistance(face[eye.top2], face[eye.bottom2]);
  const horizontal = getDistance(face[eye.outer], face[eye.inner]) || 1e-6;
  return vertical / (2 * horizontal);
};

const getEyeGazeRatio = (face, eye, iris) => {
  const eyeLeftX = Math.min(face[eye.outer].x, face[eye.inner].x);
  const eyeWidth = Math.abs(face[eye.outer].x - face[eye.inner].x) || 1e-6;
  const eyeTopY = Math.min(face[eye.top1].y, face[eye.top2].y);
  const eyeHeight = Math.abs(face[eye.bottom1].y - face[eye.top1].y) || 1e-6;

  return {
    x: (face[iris].x - eyeLeftX) / eyeWidth,
    y: (face[iris].y - eyeTopY) / eyeHeight,
  };
};

export const useMultiTracking = (trackingType = "HAND") => {
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

  // 2. MediaPipe 세션별 모델 초기화
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return;
    try {
      const vision = await getVisionFileset();

      if (trackingType === "FACE_EYE") {
        landmarkerRef.current = await createWithFallback(FaceLandmarker, vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });
      } else if (trackingType === "POSE") {
        landmarkerRef.current = await createWithFallback(PoseLandmarker, vision, {
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
      } else {
        landmarkerRef.current = await createWithFallback(HandLandmarker, vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });
      }
    } catch (error) {
      console.error(`MediaPipe(${trackingType}) 초기화에 실패했습니다.`, error);
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

      // 시선(iris) 위치를 눈 안에서의 상대 비율(0~1, 0.5=정면)로 정규화 후 양쪽 눈 평균
      // 화면엔 좌우 반전된(거울 모드) 영상이 보이므로 x는 반전해서 반환
      const rightGaze = getEyeGazeRatio(face, RIGHT_EYE, RIGHT_IRIS);
      const leftGaze = getEyeGazeRatio(face, LEFT_EYE, LEFT_IRIS);
      const gaze = { x: 1 - (rightGaze.x + leftGaze.x) / 2, y: (rightGaze.y + leftGaze.y) / 2 };
      const pupil = { x: 1 - face[RIGHT_IRIS].x, y: face[RIGHT_IRIS].y };

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

      parsedMetrics = { isBlinking, earAvg, gaze, pupil, isMouthOpen, mouthRatio, mouthCenter, raw: face };
    }
    else if (trackingType === "POSE" && res.landmarks?.[0]) {
      const pose = res.landmarks[0];
      const nose = pose[0];
      const leftEye = pose[2];
      const rightEye = pose[5];
      const leftEar = pose[7];
      const rightEar = pose[8];
      const leftShoulder = pose[11];
      const rightShoulder = pose[12];

      // 목 기울기: 눈-라인과 귀-라인 두 기준을 평균해 어깨-라인과 비교
      const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
      const earAngle = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x);
      const shoulderAngle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
      const headAngle = (eyeAngle + earAngle) / 2;
      const neckTiltDeg = (headAngle - shoulderAngle) * (180 / Math.PI);

      // 어깨 으쓱: 코-어깨중점 거리와 양쪽 귀-어깨 거리를 함께 평균해 어깨너비로 정규화
      const shoulderMid = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
      const noseToShoulder = getDistance(nose, shoulderMid);
      const earToShoulder = (getDistance(leftEar, leftShoulder) + getDistance(rightEar, rightShoulder)) / 2;
      const shoulderWidth = getDistance(leftShoulder, rightShoulder) || 1e-6;
      const shoulderRatio = ((noseToShoulder + earToShoulder) / 2) / shoulderWidth;

      parsedMetrics = { neckTiltDeg, shoulderRatio, raw: pose };
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

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    try {
      landmarkerRef.current?.close();
    } catch (error) {
      console.error("MediaPipe close error:", error);
    }
    landmarkerRef.current = null;
  }, []);

  return { videoRef, cameraReady, trackingData, startCamera, initLandmarker, detectFrame, cleanup };
};