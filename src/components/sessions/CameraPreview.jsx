import { memo } from "react";
import {
  CameraPreviewContainer,
  CameraVideo,
  CameraLoading,
} from "./CameraPreview.styled";

const CameraPreview = ({ videoRef, canvasRef, cameraReady, isTerminated }) => {
  return (
    <CameraPreviewContainer>
      <CameraVideo ref={videoRef} autoPlay muted playsInline />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {!cameraReady && !isTerminated && (
        <CameraLoading>카메라 준비 중...</CameraLoading>
      )}
    </CameraPreviewContainer>
  );
};

export default memo(CameraPreview);
