import styled from "styled-components";

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(4px);
`;

export const MissionCompleteOverlay = styled(OverlayContainer)`
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 10;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 30px;
    font-weight: bold;
    margin-top: 0;
  }
`;

export const MissionCompleteButton = styled.button`
  padding: 15px 30px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 12px;
  border: none;
  background-color: #8ea9b8;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const TerminatedOverlay = styled(OverlayContainer)`
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 20;

  h2 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 15px;
    margin-top: 0;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.8;
    margin: 0;
  }
`;