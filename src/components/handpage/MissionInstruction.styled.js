import styled from "styled-components";

// 하단 미션 안내
export const Instruction = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 73px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
  z-index: 15;
  font-size: 15px;

  @media (max-width: 750px) {
    bottom: 72px;
    padding: 0 15px;
    white-space: normal;
    line-height: 1.5;
    font-size: 12px;
  }
`;

export const MissionText = styled.span`
  color: #eee;
  font-weight: 600;
`;

export const InstructionSub = styled.span`
  color: #888;
  font-weight: 400;
`;