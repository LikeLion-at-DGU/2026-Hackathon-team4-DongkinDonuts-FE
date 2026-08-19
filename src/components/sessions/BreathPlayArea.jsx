import { memo } from "react";
import styled, { keyframes } from "styled-components";

const breatheAnimation = keyframes`
  0% { transform: scale(1); }
  33% { transform: scale(1.6); }
  50% { transform: scale(1.6); }
  100% { transform: scale(1); }
`;

const BreathContentArea = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
`;

const BreathCircle = styled.div`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 1.5px solid rgba(180, 210, 185, 0.6);
  background: radial-gradient(circle, rgba(30, 40, 35, 0.4) 0%, rgba(15, 20, 18, 0.8) 70%, transparent 100%);
  box-shadow: 0 0 30px rgba(160, 200, 170, 0.08);
  animation: ${breatheAnimation} 12s infinite ease-in-out;
`;

const BreathPlayArea = () => {
  return (
    <BreathContentArea>
      <BreathCircle />
    </BreathContentArea>
  );
};

export default memo(BreathPlayArea);
