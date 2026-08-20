import styled from "styled-components";

// 하단 진행 상태바
export const ProgressSection = styled.div`
  position: absolute;
  left: 7%;
  right: 7%;
  bottom: 10px;
  z-index: 15;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 16px;
  border-radius: 11px;
  background: #d2d2d2;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  border-radius: 11px;
  background: #557bc5;
  transition: width 0.3s ease;
`;

export const StepsRow = styled.div`
  position: relative;
  margin-top: 12px;
  height: 20px;
`;

export const StepLabel = styled.span`
  position: absolute;
  top: 0;
  transform: translateX(${({ $align }) => ($align === "end" ? "-100%" : "-50%")});
  color: ${({ $active }) => ($active ? "#557bc5" : "#888")};
  font-size: 17px;
  white-space: nowrap;
`;
