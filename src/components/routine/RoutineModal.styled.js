import styled from "styled-components";

export const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    justify-content: center;
    align-items: center;

  background: rgba(0, 0, 0, 0.35);
`;

export const ModalBox = styled.div`
    width: 400px;

    padding: 34px 32px 30px;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: center;

    border-radius: 20px;
    background: #ffffff;

    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
`;

export const ModalIcon = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    margin-bottom: 21px;

    flex-shrink: 0;

    svg {
    width: 71px;
    height: 71px;
    display: block;
    }
`;

export const ModalTitle = styled.h3`
    margin: 0;
    text-align: center;
    color: #000;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 600;
    line-height: 29px;
`;

export const ModalDescription = styled.p`
    margin: 19px 0 0;
    text-align: center;
    color: #949494;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
`;

export const ModalButton = styled.button`
    width: 100%;
    height: 48px;
    margin-top: 36px;
    border: none;
    border-radius: 8px;

    background: #1c1c1c;
    color: #ffffff;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
    background: #000000;
    }
`;