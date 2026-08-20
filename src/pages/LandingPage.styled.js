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
    height: 660px;

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
    padding: 68px 75px 80px;

    box-sizing: border-box;
`;

export const HeroText = styled.div`
    display: flex;
    width: 594px;
    flex-direction: column;
    align-items: flex-start;
    gap: 27px;
`;

export const Title = styled.h1`
    margin: 0;
    color: #ffffff;
    font-family: Poppins;
    font-size: 55px;
    font-style: normal;
    font-weight: 500;
    line-height: 70px;
`;

export const Description = styled.p`
    margin: 10px 0 0;

    font-size: 24px;
    line-height: 1.7;
    font-family: Poppins;
    font-style: normal;
    font-weight: 400;
    color: #ffffff;
`;


export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  gap: 17px;
`;

export const StartButton = styled.button`
    display: flex;
    width: 216px;
    height: 53px;
    padding: 14.744px 16.587px 14.744px 22.117px;

    justify-content: center;
    align-items: center;

    border: 1px solid #ffffff;
    border-radius: 999px;

    background: #ffffff;
    color: #000000;

    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;
    line-height: normal;

    cursor: pointer;

    transition: 0.2s ease;

    &:hover {
    background: #eeeeee;
    }
`;

export const ReportBox = styled.div`
    width: 480px;
    height: 430px;
    gap: 3px;
    margin-top: 50px;

    padding: 40px 40px 30px;

    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    border-radius: 41px;
    border: 1px solid rgba(255, 255, 255, 0.12);

    background: linear-gradient(
    135deg,
    #343434 0%,
    #242424 100%
    );

    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
`;

export const ReportTop = styled.div`
    width: 100%;

    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const ReportLabel = styled.span`
    color: #CCC;

    font-family: Poppins;
    font-size: 22px;
    font-weight: 500;
    line-height: normal;
`;

export const AiBadge = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 115px;
    height: 30px;
    padding: 7.371px 13.514px 7.371px 14.743px;
    justify-content: center;
    align-items: center;
    gap: 12.286px;
    border-radius: 14px;
    background: #E04141;

    color: #ffffff;
    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
`;

export const ReportTime = styled.div`
    margin-top: 22px;
    display: flex;
    height: 66.343px;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;

    color: #ffffff;
    font-family: Poppins;
    font-size: 45px;
    font-weight: 500;
    line-height: normal;
    letter-spacing: 3px;
`;

export const ReportDescription = styled.p`
    margin: 4px 0 0;

    color: #CCC;

    font-family: Poppins;
    font-size: 16px;
    font-weight: 400;
    line-height: normal;
`;

export const ReportDivider = styled.div`
    width: 100%;
    height: 1.2px;

    margin: 17px 0 14px;
    opacity: 0.4;
    background: rgba(204, 204, 204, 0.60);
`;

export const ReportBottom = styled.div`
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const ReportBottomText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export const ReportBottomLabel = styled.span`
    color: #CCC;

    font-family: Poppins;
    font-size: 22px;
    font-weight: 500;
`;

export const ReportBottomDescription = styled.span`
    color: #CCC;
    margin-top: 4px;
    font-family: Poppins;
    font-size: 16px;
    font-weight: 400;
`;

export const Countdown = styled.span`
    color: #e04141;

    font-family: Poppins;
    font-size: 32px;
    font-weight: 600;
    letter-spacing: 1.474px;
`;

export const ChangeTimeButton = styled.button`
    width: 100%;
    height: 70px;

    margin-top: 24px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    border: none;
    border-radius: 80px;

    background: #000000;

    color: #ffffff;

    font-family: Poppins;
    font-size: 17px;
    font-weight: 500;

    cursor: pointer;

    &:hover {
    background: #0d0d0d;
    }
`;


/* TABS */

export const TabMenu = styled.div`
    display: flex;
    align-items: flex-start;
    height: 59px;
    gap: 5px;
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