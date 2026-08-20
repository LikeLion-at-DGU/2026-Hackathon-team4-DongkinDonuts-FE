import styled from "styled-components";

/* Digital */

export const DigitalSection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const DigitalHeader = styled.div`
    margin-top: 26px;
    display: flex;
    align-items: flex-start;
    height: 145px;
    align-items: flex-end;
    gap: 40px;
    align-self: stretch;
`;

export const DigitalTitle = styled.h2`
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;

    font-size: 70px;
    font-weight: 600;
    color: #000;
    font-family: Poppins;
    line-height: normal;

    letter-spacing: -2px;
`;

export const DigitalDescription = styled.p`
    display: flex;
    width: 619px;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;

    font-size: 21px;
    line-height: 1.6;
    font-family: Poppins;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0.21px;

    color: #131313;
`;


export const LockedUsageCard = styled.div`
    width: 100%;

    padding: 35px 32px 34px;

    box-sizing: border-box;

    border: 1px solid rgba(166, 166, 166, 0.7);
    border-radius: 31px;

    background: rgba(217, 217, 217, 0.15);

    box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.06),
        0 2px 6px rgba(0, 0, 0, 0.03);
`;

export const LockedCardRow = styled.div`
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 32px;

    width: 100%;

    margin-top: 32px;
`;

export const LockedUsageWrapper = styled.div`
    position: relative;

    width: 100%;
`;

export const LockedBlur = styled.div`
    position: absolute;
    inset: 0;

    z-index: 20;

    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(6px);

    border-radius: 31px;

    pointer-events: none;
`;

export const LockContent = styled.div`
    position: absolute;

    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%);

    z-index: 30;

    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;
`;

export const LockIcon = styled.div`
    position: relative;
    z-index: 2;

    width: 47px;
    height: 47px;

    display: flex;
    justify-content: center;
    align-items: center;

    margin-bottom: 15px;

    svg {
        width: 42px;
        height: 42px;
        display: block;
    }
`;

export const ResultTitle = styled.h3`
    margin: 0;

    position: relative;
    z-index: 2;

    color: #000;
    text-align: center;

    font-family: Poppins;
    font-size: 32px;
    font-weight: 700;
    line-height: 40px;
    letter-spacing: -0.32px;
`;

export const ResultDescription = styled.p`
    margin: 20px 0 0;
    position: relative;
    z-index: 2;
    font-size: 26px;
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