import styled from "styled-components";

export const Overlay = styled.div`
    position: fixed;
    inset: 0;

    z-index: 10000;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(0, 0, 0, 0.38);
    backdrop-filter: blur(3px);
`;

export const Modal = styled.div`
    width: 300px;

    padding: 32px 26px 24px;

    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: center;

    background: #ffffff;
    border-radius: 18px;

    text-align: center;

    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.18);
    transform: scale(1.4);
    transform-origin: center;
`;

export const Icon = styled.div`
    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 20px;

    border-radius: 50%;

    background: #d8d8d8;
    color: #ffffff;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 700;
`;

export const CheckIcon = styled.div`
    width: 70px;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 20px;

    flex-shrink: 0;

    color: #ffffff;

    font-family: Poppins;
    font-size: 23px;
    font-weight: 700;

    img {
        width: 65px;
        height: 65px;
        object-fit: contain;
        display: block;
    }
`;

export const Title = styled.h3`
    margin: 0;

    font-family: Poppins;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.5;

    color: #202020;
`;

export const Description = styled.p`
    margin: 10px 0 0;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;

    color: #a0a0a0;
`;

export const SubDescription = styled.p`
    margin: 6px 0 0;

    font-family: Poppins;
    font-size: 10px;
    font-weight: 400;

    color: #b0b0b0;
`;

export const ButtonRow = styled.div`
    width: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    margin-top: 25px;
`;

export const CancelButton = styled.button`
    height: 38px;

    border: 1px solid #cfcfcf;
    border-radius: 6px;

    background: #ffffff;
    color: #333333;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 500;

    cursor: pointer;
`;

export const StartButton = styled.button`
    height: 38px;

    border: none;
    border-radius: 6px;

    background: #252525;
    color: #ffffff;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 500;

    cursor: pointer;

    &:hover {
        background: #111111;
    }
`;

export const SingleButtonRow = styled.div`
    width: 100%;

    margin-top: 25px;

    ${StartButton} {
        width: 100%;
    }
`;