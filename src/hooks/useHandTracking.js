import { useCallback, useRef, useState } from "react";
import { HandLandmarker } from "@mediapipe/tasks-vision";
import { CONFIG } from "../config/handRoutineConfig";
import { TRACKING_CONFIG } from "../config/trackingConfig";
import { getDistance, lerp } from "../utils/handUtils";
import { getUserMediaWithRetry } from "../utils/cameraUtils";
import { getVisionFileset, createWithFallback } from "./useMultiTracking";

// HandRoutinePage 전용 HandLandmarker 캐시. useMultiTracking의 landmarkerCache(HAND)와는
// confidence 임계값이 달라(여기는 손 쥐기 판정에 맞춘 0.55) 같은 캐시 키를 공유하면 방문 순서에
// 따라 FocusPinchRoutinePage와 서로 다른 설정을 가로채는 문제가 생긴다. 대신 WASM 런타임 로드
// (getVisionFileset)와 GPU 실패 시 CPU 재시도(createWithFallback)만 공유해 중복 초기화 코드를
// 줄이고, 모델 자체는 이 페이지 전용으로 앱 수명 동안 한 번만 로드해 재방문 시 재다운로드를 막는다.
let handRoutineLandmarkerPromise = null;
const loadHandRoutineLandmarker = () => {
  if (!handRoutineLandmarkerPromise) {
    handRoutineLandmarkerPromise = (async () => {
      const vision = await getVisionFileset();
      return createWithFallback(HandLandmarker, vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
    })().catch((error) => {
      handRoutineLandmarkerPromise = null;
      throw error;
    });
  }
  return handRoutineLandmarkerPromise;
};

const getPalmCenter = (landmarks) => {
  const points = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
  const total = points.reduce((position, point) => ({ x: position.x + point.x, y: position.y + point.y }), { x: 0, y: 0 });
  return { x: total.x / points.length, y: total.y / points.length };
};

const getFistScore = (landmarks) => {
  const wrist = landmarks[0];
  return [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]].reduce((score, [mcp, pip, dip, tip]) => {
    const tipDistance = getDistance(landmarks[tip], wrist);
    if (tipDistance < getDistance(landmarks[mcp], wrist) * 1.35) score += 0.75;
    if (tipDistance < getDistance(landmarks[pip], wrist) * 1.25) score += 0.5;
    if (tipDistance < getDistance(landmarks[dip], wrist) * 1.18) score += 0.35;
    return score;
  }, 0);
};

const getStableHandPosition = (landmarks, previousHand) => {
  const palm = getPalmCenter(landmarks);
  const wrist = landmarks[0];
  const middleBase = landmarks[9];
  const x = 1 - (palm.x * 0.65 + middleBase.x * 0.25 + wrist.x * 0.1);
  const y = palm.y * 0.65 + middleBase.y * 0.25 + wrist.y * 0.1;
  return previousHand ? { x: lerp(previousHand.x, x, CONFIG.positionSmooth), y: lerp(previousHand.y, y, CONFIG.positionSmooth) } : { x, y };
};

export const useHandTracking = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRequestRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const handsRef = useRef([]);
  const distanceRef = useRef({ value: 50, status: "적정" });
  const lastDistanceUpdateRef = useRef(0);
  const handLostCountRef = useRef(0);
  const handCountRef = useRef(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [screenDistance, setScreenDistance] = useState({ value: 50, status: "적정" });

  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    // 랜드마커는 모듈 캐시(handRoutineLandmarkerPromise)가 소유하며 재방문 시 재사용하므로
    // 여기서 close()하지 않는다(useMultiTracking의 cleanup과 동일한 정책).
    handLandmarkerRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(() => {
    // 이미 진행 중인 요청이 있으면 새로 getUserMedia()를 또 부르지 않고 그 요청을 그대로
    // 재사용한다. 세션 페이지를 빠르게 오가거나 React StrictMode의 mount→unmount→mount
    // 이중 실행으로 startCamera()가 응답 전에 다시 호출되면, 같은 카메라 장치를 향해
    // getUserMedia()를 동시에 두 번 요청하게 되어 "AbortError: Timeout starting video
    // source"로 실패하는 경우가 있었다(useMultiTracking.js의 startCamera와 동일한 문제/해법).
    if (cameraRequestRef.current) return cameraRequestRef.current;

    const request = (async () => {
      try {
        setCameraReady(false);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const stream = await getUserMediaWithRetry({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        });
        if (!videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      } catch (error) {
        console.error("카메라를 시작하지 못했습니다.", error);
        setCameraReady(false);
      } finally {
        cameraRequestRef.current = null;
      }
    })();
    cameraRequestRef.current = request;
    return request;
  }, []);

  const initializeMediaPipe = useCallback(async () => {
    if (handLandmarkerRef.current) return;
    try {
      handLandmarkerRef.current = await loadHandRoutineLandmarker();
    } catch (error) { console.error("MediaPipe 초기화에 실패했습니다.", error); }
  }, []);

  const detectHands = useCallback((timestamp) => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    if (!video || !landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    try {
      const landmarksList = landmarker.detectForVideo(video, timestamp).landmarks ?? [];
      if (landmarksList.length) {
        handLostCountRef.current = 0;
        const wrist = landmarksList[0][0];
        const middleBase = landmarksList[0][9];
        const handSize = Math.hypot(wrist.x - middleBase.x, wrist.y - middleBase.y);
        // useMultiTracking(HAND)과 동일한 판정 로직/공식을 공유한다 (TRACKING_CONFIG.handDistance*)
        const { handDistanceFar: far, handDistanceNear: near, handDistanceClose: close } = TRACKING_CONFIG;
        const status = handSize < far ? "너무 멀어요" : handSize < near ? "적정" : "너무 가까워요";
        const rawValue =
          handSize < far
            ? (handSize / far) * 35
            : handSize < near
              ? 35 + ((handSize - far) / (near - far)) * 30
              : 65 + Math.min(35, ((handSize - near) / (close - near)) * 35);
        const value = Math.max(0, Math.min(100, rawValue));
        const smoothValue = distanceRef.current.value * 0.75 + value * 0.25;
        distanceRef.current = { value: smoothValue, status };
        if (timestamp - lastDistanceUpdateRef.current >= CONFIG.distanceUpdateInterval) {
          lastDistanceUpdateRef.current = timestamp;
          setScreenDistance({ value: smoothValue, status });
        }
      } else if (++handLostCountRef.current >= CONFIG.handLostMaxFrames) {
        setScreenDistance((current) => current.status === "인식하지 못함" ? current : { value: 5, status: "인식하지 못함" });
      }

      const previousHands = handsRef.current;
      const claimedIds = new Set();
      const detectedHands = landmarksList.map((landmarks) => {
        const palm = getPalmCenter(landmarks);
        const rawPosition = { x: 1 - palm.x, y: palm.y };
        let previousHand = null;
        let closestDistance = Infinity;
        previousHands.forEach((hand) => {
          if (claimedIds.has(hand.id)) return;
          const distance = getDistance(hand, rawPosition);
          if (distance < closestDistance) { closestDistance = distance; previousHand = hand; }
        });
        if (closestDistance > 0.4) previousHand = null;
        if (previousHand) claimedIds.add(previousHand.id);
        const fistScore = getFistScore(landmarks);
        const fist = previousHand?.fist ? fistScore > CONFIG.fistExitThreshold : fistScore > CONFIG.fistEnterThreshold;
        return { id: previousHand?.id ?? crypto.randomUUID(), ...getStableHandPosition(landmarks, previousHand), fist, fistJustClosed: fist && !previousHand?.fist, fistScore, landmarks, lastSeen: timestamp };
      });
      previousHands.forEach((hand) => {
        if (!claimedIds.has(hand.id) && timestamp - hand.lastSeen < CONFIG.lostHandGraceTime) detectedHands.push(hand);
      });
      handsRef.current = detectedHands;
      if (handCountRef.current !== landmarksList.length) {
        handCountRef.current = landmarksList.length;
        setHandCount(landmarksList.length);
      }
    } catch (error) { console.error("손 인식 중 오류가 발생했습니다.", error); }
  }, []);

  return { videoRef, handsRef, cameraReady, handCount, screenDistance, initializeMediaPipe, startCamera, detectHands, cleanup };
};
