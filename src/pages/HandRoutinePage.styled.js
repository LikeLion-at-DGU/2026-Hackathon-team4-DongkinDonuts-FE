import styled, { createGlobalStyle } from "styled-components";

// 1. 글로벌 스타일
export const HandRoutineGlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background: #000;
    overflow-y: auto;
  }
`;

// 2. 최상위 레이아웃
export const RoutineContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  background: #000;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 3. 메인 콘텐츠 래퍼
export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1345px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 4. 메인 화면 및 컨테이너
export const PlayContainer = styled.div`
  position: relative;
  width: 100%;
  height: 721px;
  background: #252525;
  overflow: hidden;
  border-radius: 20px;
`;

// 5. 하단 컨트롤 버튼 영역 래퍼
export const ControlsWrapper = styled.div`
  width: 100%;
  height: 150px;
  margin-top: 18px;
  margin-bottom: 131px;
`;

// 6. 플레이 영역 (Canvas 컨테이너)
export const PlayArea = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 5;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`;