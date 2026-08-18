import styled, { createGlobalStyle } from "styled-components";

// 1. 글로벌 스타일 (전체 적용 body 및 box-sizing)
export const HandRoutineGlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #17181d;
    overflow: hidden;
  }
`;

// 2. 최상위 레이아웃
export const RoutineGameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  margin-left: calc(50% - 50vw);
  background: #17181d;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// 3. 메인 화면 및 컨테이너
export const GameContainer = styled.div`
  position: relative;
  width: 100%;
  flex-grow: 1;
  overflow: hidden;
  background: #252525;
`;

// 4. 플레이 영역 (Canvas 컨테이너)
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

  @media (max-width: 750px) {
    left: 15px;
    right: 15px;
    top: 140px;
    bottom: 100px;
  }
`;