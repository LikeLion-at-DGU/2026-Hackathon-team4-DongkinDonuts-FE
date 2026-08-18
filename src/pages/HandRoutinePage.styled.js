import styled, { createGlobalStyle } from "styled-components";

// 1. 글로벌 스타일
export const HandRoutineGlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #17181d;
    overflow-y: auto; /* 전체 페이지 스크롤 허용 */
  }
`;

// 2. 최상위 레이아웃 (수정됨)
export const RoutineContainer = styled.div`
  width: 100%; /* 100vw에서 변경: App.jsx의 1440px Wrapper 너비에 맞춤 */
  /* height: 100vh; 삭제: 내부 콘텐츠 높이에 맞춰 자연스럽게 늘어나도록 설정 */
  /* margin-left: calc(50% - 50vw); 삭제: 억지로 화면 전체로 확장하는 마진 제거 */
  
  background: #17181d;
  color: white;
  display: flex;
  flex-direction: column;
  
  /* overflow: hidden; 삭제: 페이지 전체 스크롤을 막지 않도록 제거 */
`;

// 3. 메인 화면 및 컨테이너
export const PlayContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 720px;
  height: 75vh;
  background: #252525;
  overflow: hidden; /* 게임 영역 밖으로 UI가 삐져나가는 것만 방지 */
  
  /* (선택 사항) 메인 게임 영역 모서리를 둥글게 하면 레이아웃과 더 잘 어울립니다 */
  border-radius: 16px; 
  margin: 20px 0; /* 헤더/푸터 및 컨트롤 영역과의 여백 */
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
`;