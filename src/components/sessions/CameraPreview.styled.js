import styled, { css } from "styled-components";

export const CameraPreviewContainer = styled.div`
  position: absolute;
  overflow: hidden;
  background: #111;

  ${({ $fullBleed }) =>
    $fullBleed
      ? css`
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          z-index: 1;
        `
      : css`
          left: 55px;
          top: 28px;
          width: 390px;
          height: 239px;
          border-radius: 22px;
          z-index: 100;
        `}
`;

export const CameraVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
`;

export const CameraLoading = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #151515;
  color: #aaa;
  font-size: 20px;
`;
