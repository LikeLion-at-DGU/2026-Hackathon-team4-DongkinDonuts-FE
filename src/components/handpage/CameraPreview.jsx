import React from "react";
import {
  CameraPreviewContainer,
  CameraVideo,
  CameraLoading,
} from "./CameraPreview.styled";

const CameraPreview = ({ videoRef, cameraReady, isTerminated }) => {
  return (
    <CameraPreviewContainer>
      <CameraVideo ref={videoRef} autoPlay muted playsInline />
      {!cameraReady && !isTerminated && (
        <CameraLoading>카메라 준비 중...</CameraLoading>
      )}
    </CameraPreviewContainer>
  );
};

export default CameraPreview;