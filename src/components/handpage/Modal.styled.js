import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

export const ModalContent = styled.div`
  background-color: #ffffff;
  border-radius: 17.7px;
  padding: 32px 44px;
  width: 370px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

export const ModalTitle = styled.h2`
  font-size: 21px;
  font-weight: 600;
  font-family: Poppins;
  font-style: normal;
  color: #000;
  line-height: 1.45;
  margin-top: 20.5px;
  margin-bottom: 19.5px;
`;

export const ModalDescription = styled.p`
  font-size: 14px;
  font-weight: 500;
  font-family: Poppins;
  font-style: normal;
  color: #949494;
  margin-bottom: 36px;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 13px;
`;

// 버튼 공통 스타일 Base
const ButtonBase = styled.button`
  flex: 1;
  width: 134px;
  height: 45px;
  padding: 12px 53.5px;
  border-radius: 8.8px;
  font-size: 14px;
  font-weight: 500;
  font-family: Poppins;
  font-style: normal;
  cursor: pointer;
`;

export const CloseButton = styled(ButtonBase)`
  background-color: #ffffff;
  border: 0.5px solid #cbd5e1;
  color: #191919;
`;

export const ConfirmButton = styled(ButtonBase)`
  background-color: #191919;
  border: none;
  color: #ffffff;
`;