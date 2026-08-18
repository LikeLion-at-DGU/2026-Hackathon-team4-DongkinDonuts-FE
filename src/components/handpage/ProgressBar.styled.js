import styled from "styled-components";

// 하단 진행 상태바
export const ProgressSection = styled.div`
  position: absolute;
  left: 7%;
  right: 7%;
  bottom: 17px;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 7px;
  border-radius: 10px;
  background: #d2d2d2;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  border-radius: 10px;
  background: #557bc5;
  transition: width 0.3s ease;
`;

export const Steps = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #888;
  font-size: 8px;
`;