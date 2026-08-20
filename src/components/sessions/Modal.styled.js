import styled from "styled-components";

export const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    padding-top: 190px;
    box-sizing: border-box;

    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);

    z-index: 9999;
`;

export const ModalContent = styled.div`
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
    align-items: center;

    text-align: center;

    transform: scale(0.9);
    transform-origin: top center;
`;

export const ModalTitle = styled.h2`
    margin: 110px 0 20px;

    font-family: Poppins;
    font-size: 28px;
    font-weight: 500;
    line-height: 30px;
    letter-spacing: 0.56px;

    color: #000;
`;

export const ModalDescription = styled.p`
    margin: 0;

    font-family: Poppins;
    font-size: 19px;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: 0.32px;

    color: #777;
`;

export const ModalButtons = styled.div`
    position: absolute;

    left: 50px;
    right: 50px;
    bottom: 24px;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    gap: 19px;

    padding-top: 23px;

    border-top: 1px solid #dddddd;
`;

const ButtonBase = styled.button`
    width: 145px;
    height: 55px;

    padding: 0;

    border-radius: 56px;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: 0.42px;

    cursor: pointer;
`;

export const CloseButton = styled(ButtonBase)`
    border: 0.3px solid #2e2e2e;

    background: #ffffff;
    color: #2e2e2e;
`;

export const ConfirmButton = styled(ButtonBase)`
    border: none;

    background: #2e2e2e;
    color: #ffffff;

    &:hover {
        background: #111111;
    }
`;