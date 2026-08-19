import styled from "styled-components";

// 하단 컨트롤 버튼 영역
export const ControlArea = styled.div`
  max-width: 1345px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 35px;
  background: #252525;

  button {
    width: 225px;
    height: 78px;
    border-radius: 51.5px;
    background: transparent;
    color: white;
    font-size: 28px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

export const StopButton = styled.button`
  border: 1px solid #FF4F4F;
  color: #FF4F4F !important;
`;

export const ResetButton = styled.button`
  border: 1px solid #777;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
`;