import styled from "styled-components";

export const Overlay = styled.div`
    position: fixed;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    box-sizing: border-box;

     /* 피그마처럼 밝은 회색 반투명 */
    background: rgba(36, 39, 42, 0.35);
    background: rgba(255, 255, 255, 0.50);
    backdrop-filter: blur(10px);

    z-index: 9999;
`;

export const Modal = styled.div`
    position: relative;

    width: 524px;
    height: 345px;

    padding: 21px 33px 16px;

    box-sizing: border-box;

    background: #f5f5f5;
    border-radius: 37px;

    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);

    display: flex;
    flex-direction: column;

    transform: scale(1.35);
    transform-origin: top center;
`;

export const CloseButton = styled.button`
    position: absolute;

    top: 22px;
    right: 20px;

    aspect-ratio: 1 / 1;

    border: none;
    background: transparent;

    font-size: 17px;
    color: #484848;

    cursor: pointer;
`;

export const SmallLabel = styled.p`
    margin: 0 0 8px;

    font-family: Poppins;
    font-size: 9px;
    font-weight: 500;
    line-height: 17.73px;
    letter-spacing: 0.19px;

    color: rgba(122, 121, 121, 0.6);
`;

export const Title = styled.h2`
    margin: 0;

    font-family: Poppins;
    font-size: 19px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0.37px;

    color: #000;
`;

export const Description = styled.p`
    margin: 11px 0 11px;

    font-family: Poppins;
    font-size: 13px;
    font-weight: 400;
    line-height: 15px;
    letter-spacing: 0.21px;

    color: #777;
`;

export const SectionLabel = styled.p`
    margin: ${({ $marginTop }) =>
        $marginTop ? "17px 0 0" : "0"};

    justify-content: center;
    align-self: stretch;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 500;
    line-height: 17.73px;
    letter-spacing: 0.24px;

    color: #2e2e2e;
`;

export const OptionGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;

    margin-top: 7px;

    gap: 13px;
`;

export const OptionButton = styled.button`
    height: 37px;
    padding: 0 17px;

    border: 1px solid #5b5b5b;
    border-radius: 37px;

    background: ${({ $selected }) =>
        $selected ? "#D5D5D5" : "#ffffff"};

    color: #000;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;

    cursor: pointer;
`;

export const CustomInput = styled.input`
    width: 97px;
    height: 37px;

    padding: 11px 17px;
    box-sizing: border-box;

    border: 1px solid #5b5b5b;
    border-radius: 37px;
    outline: none;

    background: #ffffff;
    color: #000;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
    letter-spacing: 0.42px;

    &::placeholder {
        color: #949191;
    }

    &:focus {
        border: 1px solid #2e2e2e;
    }
`;

export const BottomArea = styled.div`
    position: absolute;

    left: 33px;
    right: 33px;
    bottom: 16px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-top: 15px;

    border-top: 1px solid #dddddd;
`;

export const StepDots = styled.div`
    display: flex;
    align-items: center;

    gap: 5px;

    transform: translateY(-15px);
`;

export const Dot = styled.div`
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: ${({ $active }) =>
        $active ? "#727070" : "#CCC"};
`;

export const ButtonGroup = styled.div`
    display: flex;
    align-items: center;

    gap: 13px;

    margin-left: auto;
`;

export const SkipButton = styled.button`
    width: auto;
    height: 14px;

    display: flex;

    border: none;
    background: transparent;

    color: #949191;

    font-family: Poppins;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 23.7px;
    letter-spacing: 0.25px;

    text-decoration: underline;
    text-underline-offset: 5px;

    cursor: pointer;
`;

export const SecondaryButton = styled.button`
    width: 97px;
    height: 37px;

    border: 0.2px solid #2e2e2e;
    border-radius: 37px;

    background: #ffffff;
    color: #2e2e2e;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
    letter-spacing: 0.28px;

    cursor: pointer;
`;

export const InputNotice = styled.p`
    margin: 5px 0 0 5px;

    font-family: Poppins;
    font-size: 9px;
    font-weight: 400;
    line-height: 12px;

    color: #8f8f8f;
`;

export const PrimaryButton = styled.button`
    width: 97px;
    height: 37px;

    border: none;
    border-radius: 666px;

    background: #2e2e2e;
    color: #ffffff;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;

    cursor: pointer;

    &:hover {
        background: #111111;
    }
`;
