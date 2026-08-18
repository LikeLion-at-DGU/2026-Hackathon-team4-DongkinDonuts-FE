import styled from "styled-components";

export const Overlay = styled.div`
    position: fixed;
    inset: 0;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    padding-top: 245px;
    box-sizing: border-box;

    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);

    z-index: 9999;
`;

export const Modal = styled.div`
    position: relative;

    width: 786px;
    height: 518px;

    padding: 32px 50px 24px;

    box-sizing: border-box;
    background: #f5f5f5;
    border-radius: 56px;

    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 33px;
    right: 30px;
    aspect-ratio: 1/1;

    border: none;
    background: transparent;

    font-size: 25px;
    color: #484848;
    cursor: pointer;
`;

export const SmallLabel = styled.p`
    margin: 0 0 12px;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
    font-weight: 500;
    line-height: 26.6px; 
    letter-spacing: 0.28px;

    color: rgba(122, 121, 121, 0.60);
`;

export const Title = styled.h2`
    margin: 0;

    font-family: Poppins;
    font-size: 28px;
    font-weight: 500;
    line-height: 30px;
    letter-spacing: 0.56px;
    color: #000;
`;

export const Description = styled.p`
    margin: 16px 0 17px;

    font-family: Poppins;
    font-size: 16px;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: 0.32px;
    color: #777;
`;

export const SectionLabel = styled.p`
    margin: ${({ $marginTop }) =>
        $marginTop ? "22px 0 0" : "0"};
    justify-content: center;
    align-self: stretch;

    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 26.6px; 
    letter-spacing: 0.364px;
    color: #2e2e2e;
`;

export const OptionGroup = styled.div`
    display: flex;
    margin-top: 10px;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    align-content: center;
`;

export const OptionButton = styled.button`
    height: 55px;

    padding: 17px 25px;
    border: 1px solid #5b5b5b;
    border-radius: 56px;

    background: ${({ $selected }) =>
        $selected ? "#D5D5D5" : "#ffffff"};

    color: #000;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;
    line-height: 21px; 
    letter-spacing: 0.63px;

    cursor: pointer;

    &:hover {
    background: #eeeeee;
    }
`;

export const BottomArea = styled.div`
    position: absolute;

    left: 50px;
    right: 50px;
    bottom: 24px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-top: 23px;

    border-top: 1px solid #dddddd;
`;

export const StepDots = styled.div`
    display: flex;
    gap: 7px;
    align-items: center;

    transform: translateY(-23px);
`;

export const Dot = styled.div`
    width: 10px;
    height: 10px;

    border-radius: 50%;

    background: ${({ $active }) =>
        $active ? "#727070" : "#CCC"};
`;

export const ButtonGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 19px;
`;

export const SkipButton = styled.button`
    border: none;
    background: transparent;
    display: flex;
    width: 83.3px;
    height: 21.035px;

    color: #949191;

    font-family: Poppins;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 35.569px; 
    letter-spacing: 0.379px;

    text-decoration: underline;
    text-underline-offset: 8px;

    cursor: pointer;
`;

export const SecondaryButton = styled.button`
    width: 145px;
    height: 55px;

    border: 0.3px solid #2E2E2E;
    border-radius: 56px;

    background: #ffffff;
    color: #2e2e2e;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;
    line-height: 21px; /* 100% */
    letter-spacing: 0.42px;

    cursor: pointer;
`;

export const PrimaryButton = styled.button`
    width: 145px;
    height: 55px;

    border: none;
    border-radius: 999px;

    background: #2e2e2e;
    color: #ffffff;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;

    cursor: pointer;

    &:hover {
    background: #111111;
    }
`;