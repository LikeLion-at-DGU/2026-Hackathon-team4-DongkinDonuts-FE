import { useCallback, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

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

  // 2. MediaPipe 세션별 모델 초기화
  const initLandmarker = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    if (trackingType === "FACE_EYE") {
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    } else if (trackingType === "POSE") {
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    } else {
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
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
      // EAR (Eye Aspect Ratio) 계산으로 눈 감김 감지
      const leftEyeDist = Math.hypot(face[159].x - face[145].x, face[159].y - face[145].y);
      const isBlinking = leftEyeDist < 0.018;
      // 홍채/눈동자 x, y 위치
      const pupil = { x: 1 - face[468].x, y: face[468].y };
      parsedMetrics = { isBlinking, pupil, raw: face };
    } else if (trackingType === "POSE" && res.poseLandmarks?.[0]) {
      const pose = res.poseLandmarks[0];
      const nose = pose[0];
      const leftEar = pose[7];
      const leftShoulder = pose[11];

      // 목 기울기 각도 (신전 감지)
      const neckAngle = Math.atan2(nose.y - leftShoulder.y, nose.x - leftShoulder.x) * (180 / Math.PI);
      // 어깨 으쓱 높이 (PMR 감지)
      const shoulderElevation = Math.abs(leftEar.y - leftShoulder.y);
      const isShoulderRaised = shoulderElevation < 0.12;

      parsedMetrics = { neckAngle, isShoulderRaised, raw: pose };
    } else if (res.landmarks?.[0]) {
      const hand = res.landmarks[0];
      // 엄지(4)와 검지(8) 거리 (핀치 감지)
      const pinchDist = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y);
      const isPinching = pinchDist < 0.05;
      const palmCenter = { x: 1 - hand[9].x, y: hand[9].y };

      parsedMetrics = { isPinching, palmCenter, raw: res.landmarks };
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
