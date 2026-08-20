import styled from "styled-components";

// 하단 미션 안내
export const Instruction = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
  z-index: 15;
  font-family: SUIT;
  font-size: 28px;
  font-style: normal;
  margin-bottom: 45px;
`;

export const InstructionPill = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 90%;
  padding: 14px 30px;
  border-radius: 999px;
`;

export const MissionText = styled.span`
  color: #DEDEDE;
  font-weight: 700;
`;

export const InstructionSub = styled.span`
  color: #888;
  font-weight: 400;
`;