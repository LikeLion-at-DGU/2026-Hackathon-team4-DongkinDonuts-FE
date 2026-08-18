import styled from "styled-components";

// 하단 컨트롤 버튼 영역
export const ControlArea = styled.div`
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: #292929;

  button {
    width: 130px;
    height: 44px;
    border-radius: 24px;
    background: transparent;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

export const StopButton = styled.button`
  border: 1px solid #9b4c4c;
  color: #db6b6b !important;
`;

export const ResetButton = styled.button`
  border: 1px solid #777;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
`;