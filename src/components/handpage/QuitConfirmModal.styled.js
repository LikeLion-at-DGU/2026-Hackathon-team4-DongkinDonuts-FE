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
  border-radius: 20px;
  padding: 32px 36px;
  width: 340px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

export const ModalIcon = styled.div`
  width: 44px;
  height: 44px;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  margin: 0 auto 16px auto;
`;

export const ModalTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.45;
  margin-bottom: 8px;
`;

export const ModalDescription = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 24px;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
`;

// 버튼 공통 스타일 Base
const ButtonBase = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

export const CloseButton = styled(ButtonBase)`
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
`;

export const ConfirmButton = styled(ButtonBase)`
  background-color: #1e1e1e;
  border: none;
  color: #ffffff;
`;