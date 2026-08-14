import styled from "styled-components";

export const PageViewport = styled.div`
    width: 100%;
    overflow-x: hidden;

    display: flex;
    justify-content: center;
`;

export const LandingPage = styled.main`
    width: 100%;

    background: #ffffff;

`;

export const HeroSection = styled.section`
    width: 1440px;
    height: 692px;

    margin: 0;
    padding: 40px 56px 70px;
    box-sizing: border-box;

    background: #000000;
    color: #ffffff;

    box-shadow: 0 8px 16px 0 rgba(27, 27, 27, 0.16);
    backdrop-filter: blur(40px);

    border-radius: 0 0 80px 80px;
`;

export const HeroContent = styled.div`
    width: 100%;
    height: calc(100% - 82px);

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 40px 90px 0;

    box-sizing: border-box;
`;

export const MainContent = styled.main`
    width: 1440px;

    margin: 0;
    padding: 75px 56px 80px;

    box-sizing: border-box;
`;

export const HeroText = styled.div`
    display: flex;
    width: 594px;
    flex-direction: column;
    align-items: flex-start;
    gap: 35px;
`;

export const Title = styled.h1`
    margin: 0;
    color: #FFF;
    font-family: Poppins;
    font-size: 55px;
    font-style: normal;
    font-weight: 500;
    line-height: 70px;
`;

export const Description = styled.p`
    margin: 40px 0 0;

    font-size: 24px;
    line-height: 32px;
    font-family: Poppins;
    font-style: normal;
    font-weight: 400;
    color: #FFF;
`;


export const StartButton = styled.button`
    display: flex;
    height: 58px;
    padding: 16px 18px 16px 24px;
    border: none;
    border-radius: 999px;
    justify-content: center;
    align-items: center;
    gap: 6px;

    background: #ffffff;
    color: #000000;
    text-align: center;
    font-family: Poppins;
    font-size: 22px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;

    cursor: pointer;
`;

export const ReportBox = styled.div`
    width: 399px;
    height: 230px;

    margin-top: 200px;

    padding: 30px 30px 28px;

    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    border-radius: 24px;

    background: linear-gradient(
        135deg,
        #343434 0%,
        #202020 100%
    );

    border: 1px solid rgba(255, 255, 255, 0.10);

    box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

export const ReportTop = styled.div`
    width: 100%;

    display: flex;
    align-items: flex-end;
    justify-content: space-between;
`;

export const ReportLabel = styled.span`
    color: #ffffff;
    font-style: normal;
    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;
    line-height: normal;
`;

export const ReportLink = styled.span`
    display: flex;
    width: 64px;
    flex-direction: column;
    justify-content: flex-end;
    align-self: stretch;

    color: #D0D0D0;

    font-family: Poppins;
    font-size: 16px;
    font-weight: 500;
    line-height: normal;

    cursor: pointer;
`;

export const ReportTime = styled.div`
  margin-top: 22px;

  color: #ffffff;
  font-family: Poppins;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  strong {
    margin-left: 8px;

    font-size: 34px;
    font-weight: 400;
    line-height: 38px;
    letter-spacing: -0.34px;
  }
`;

export const ReportSubText = styled.p`
    margin: 12px 0 0;

    color: #A8A8A8;
    font-style: normal;
    font-family: Inter;
    font-size: 14px;
    font-weight: 400;
    line-height: 15px;
`;


/* TABS */

export const TabMenu = styled.div`
    display: flex;
    align-items: flex-start;
    height: 59px;
`;

export const TabButton = styled.button`
    padding: 20px 40px;
    display: flex;
    height: 59px;
    justify-content: center;
    align-items: center;
    gap: 10px;

    border: 1px solid #222222;
    border-radius: 60px;
    background: ${({ $active }) =>
        $active ? "#111111" : "#ffffff"};

    color: ${({ $active }) =>
        $active ? "#ffffff" : "#111111"};

    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 32px;
    font-family: Poppins;
    letter-spacing: -0.24px;

    cursor: pointer;

    transition: 0.2s ease;

    &:hover {
    background: ${({ $active }) =>
        $active ? "#111111" : "#f4f4f4"};
    }
`;

/* ROUTINE */

export const RoutineSection = styled.section`
    padding-top: 66px;
`;

export const SectionHeader = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 66px;
    gap: 20px;
    text-align: center;

`;

export const SectionLabel = styled.p`
    color: #000; 
    text-align: center;
    font-family: Poppins;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 32px; 
    letter-spacing: -0.24px;
    margin: 0;
`;

export const SectionTitle = styled.h2`
    color: #000; 
    text-align: center;
    font-family: Poppins;
    font-size: 32px;
    font-style: normal;
    font-weight: 700;
    line-height: 40px; 
    letter-spacing: -0.32px;
    margin: 0;
`;

export const RoutineCards = styled.div`
  width: 100%;

  display: flex;
  gap: 14px;

  /* 기본 상태는 첫 번째 카드가 큼 */
  &:not(:hover) > *:first-child {
    flex-grow: 1.8;
  }

  /* 카드 영역에 마우스가 들어오면 우선 모두 동일 */
  &:hover > * {
    flex-grow: 1;
  }

  /* 실제 hover한 카드만 크게 */
  &:hover > *:hover {
    flex-grow: 1.8;
  }
`;

/* AI INSIGHT */

export const InsightSection = styled.section`
    width: 100%;

    padding-top: 40px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const InsightHeader = styled.div`
    display: flex;
    align-items: flex-start;
    height: 145px;
    align-items: flex-end;
    gap: 71px;
    align-self: stretch;
`;

export const InsightTitle = styled.h2`
    margin: 0;
    display: flex;
    width: 402px;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;

    font-size: 80px;
    font-weight: 600;
    color: #000;
    font-family: Poppins;
    line-height: normal;

    letter-spacing: -2px;
`;

export const InsightDescription = styled.p`
    display: flex;
    width: 619px;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;

    font-size: 18px;
    line-height: 1.6;
    font-family: Poppins;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0.18px;

    color: #131313;
`;

export const InsightResult = styled.div`
    position: relative;

    width: 100%;
    height: 500px;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    padding-top: 118px;

    text-align: center;
    overflow: hidden;

    background: #ffffff;

    /* 피그마처럼 가운데 넓게 퍼지는 흐림 영역 */
    &::before {
        content: "";

        position: absolute;
        top: 95px;
        left: 50%;

        width: 650px;
        height: 150px;

        transform: translateX(-50%);

        background: radial-gradient(
            ellipse at center,
            rgba(110, 110, 110, 0.20) 0%,
            rgba(160, 160, 160, 0.12) 35%,
            rgba(255, 255, 255, 0) 75%
        );

        filter: blur(16px);

        pointer-events: none;
    }
`;

export const BlurredInsightText = styled.p`
    position: absolute;

    top: 110px;
    left: 50%;

    width: 620px;

    transform: translateX(-50%);

    margin: 0;

    color: rgba(30, 30, 30, 0.46);

    font-family: Poppins;
    font-size: 16px;
    font-weight: 400;
    line-height: 25px;

    text-align: center;

    filter: blur(5px);
    opacity: 0.95;

    z-index: 0;

    user-select: none;
    pointer-events: none;
`;

export const LockIcon = styled.div`
    position: relative;
    z-index: 2;

    width: 51px;
    height: 51px;

    display: flex;
    justify-content: center;
    align-items: center;

    margin: 0;

    svg {
        width: 42px;
        height: 42px;
    }
`;

export const ResultTitle = styled.h3`
    margin: 26px 0 0;
    z-index: 2;
    position: relative;
    font-size: 32px;
    font-weight: 700;
    line-height: 40px; 
    letter-spacing: -0.32px;
`;

export const ResultDescription = styled.p`
    margin: 20px 0 0;
    position: relative;
    z-index: 2;
    font-size: 24px;
    font-weight: 400;
    line-height: 32px; 
    letter-spacing: -0.24px;
`;

export const ResultButton = styled.button`
    margin-top: 54px;
    display: flex;
    width: 297px;
    height: 56px;
    justify-content: center;
    align-items: center;
    z-index: 1;
    position: relative;
    padding: 12px 16px;

    border: none;
    border-radius: 90px;

    background: #000000;
    color: #ffffff;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    font-family: Poppins;
    line-height: 16px; 

    cursor: pointer;

    transition: 0.2s ease;

    &:hover {
    opacity: 0.8;
    }
`;