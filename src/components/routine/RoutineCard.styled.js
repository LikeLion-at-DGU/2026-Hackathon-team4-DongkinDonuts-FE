import styled from "styled-components";
import { FONT_POPPINS } from "../../styles/fonts";

export const Card = styled.article`
  position: relative;

  flex-grow: ${({ $featured }) =>
    $featured ? 1.6 : 1};
  flex-basis: 0;
  min-width: 0;

  height: 320px;

  border-radius: 18px;
  overflow: hidden;
  color: #ffffff;

  transition:
    flex-grow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.25s ease;

  &::before {
    content: "";

    position: absolute;
    inset: 0;

    background-image: ${({ $image }) =>
      `url(${$image})`};

    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    filter: grayscale(80%)
      brightness(0.9)
      contrast(0.85);

    opacity: 0.9;
  }

  &:hover {
    transform: ${({ $locked }) =>
      $locked
        ? "none"
        : "translateY(-2px)"};
  }

  &:hover button {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;

  background: linear-gradient(
    to bottom,
    rgba(84, 84, 84, 0.15),
    rgba(40, 40, 40, 0.42)
  );
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;

  width: 100%;
  height: 100%;

  box-sizing: border-box;

  padding: 28px;

  display: flex;
  flex-direction: column;
`;

export const Top = styled.div`
  width: 100%;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;
`;

export const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  min-width: 0;
`;

export const Title = styled.h3`
  margin: 0;

  color: #ffffff;

  font-family: "SUIT", sans-serif;
  font-size: 45px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
  letter-spacing: -0.69px;

  white-space: nowrap;
`;


export const Description = styled.p`
  margin: 18px 0 0;

  color: #ffffff;

  font-family: ${FONT_POPPINS};
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.7;
  letter-spacing: -0.24px;

  word-break: keep-all;
`;

export const ArrowButton = styled.button`
  flex-shrink: 0;

  width: 55px;
  height: 55px;

  padding: 15px;

  display: flex;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;

  border: 2px solid #ffffff;
  border-radius: 50%;

  background: #ffffff;

  cursor: ${({ $locked, $completed }) =>
    $locked || $completed ? "not-allowed" : "pointer"};

  opacity: 0;
  visibility: hidden;

  transform: scale(0.8);
  filter: ${({ $locked, $completed }) =>
    $locked || $completed ? "grayscale(1)" : "none"};

  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s ease;

  svg {
    width: 25px;
    height: 25px;
    transform: none;
  }
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;

  margin-top: auto;

  flex-shrink: 0;

  background: rgba(255, 255, 255, 0.28);
`;

export const Status = styled.span`
  width: 91px;

  margin-top: 12px;
  padding: 12px 40px;

  box-sizing: border-box;

  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;

  border-radius: 30px;

  background: ${({ $completed }) =>
    $completed ? "rgba(255, 255, 255, 0.34)" : "rgba(255, 255, 255, 0.2)"};

  box-shadow: 0 4px 8px 0 rgba(27, 27, 27, 0.16);
  backdrop-filter: blur(10px);

  color: #ffffff;

  text-align: center;

  font-family: ${FONT_POPPINS};
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;

  white-space: nowrap;
`;
