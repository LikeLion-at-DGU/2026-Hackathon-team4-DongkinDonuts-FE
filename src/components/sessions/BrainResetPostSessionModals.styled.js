import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
`;

export const WideModal = styled.div`
  position: relative;

  width: min(524px, calc(100vw - 28px));
  min-height: 345px;

  padding: 21px 33px 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  border-radius: 37px;
  background: #f5f5f5;
  color: #000;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
`;

export const NoticeModal = styled.div`
  width: min(225px, calc(100vw - 21px));

  padding: 27px 20px 23px;
  box-sizing: border-box;

  border-radius: 16px;
  background: #ffffff;
  color: #000;
  text-align: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 22px;
  right: 20px;

  width: 17px;
  height: 17px;

  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
  }
`;

export const SmallLabel = styled.p`
  margin: 0 0 8px;

  color: rgba(122, 121, 121, 0.6);
  font-family: Poppins, sans-serif;
  font-size: 9px;
  font-weight: 500;
  line-height: 17.73px;
  letter-spacing: 0.19px;
`;

export const Title = styled.h2`
  margin: 0;

  color: #000;
  font-family: Poppins, sans-serif;
  font-size: 19px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.37px;
`;

export const Description = styled.p`
  margin: 11px 0 11px;

  color: #777;
  font-family: Poppins, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 15px;
  letter-spacing: 0.21px;
`;

export const Section = styled.section`
  margin-top: ${({ $compact }) => ($compact ? "11px" : "17px")};
`;

export const SectionLabel = styled.h3`
  margin: 0;

  color: #2e2e2e;
  font-family: Poppins, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 17.73px;
  letter-spacing: 0.24px;
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
  background: ${({ $selected }) => ($selected ? "#d5d5d5" : "#ffffff")};
  color: #000;

  font-family: Poppins, sans-serif;
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

  font-family: Poppins, sans-serif;
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

export const Divider = styled.div`
  width: 100%;
  height: 1px;

  margin-top: auto;

  background: #dddddd;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $end }) => ($end ? "flex-end" : "space-between")};

  padding-top: 15px;
`;

export const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const Dot = styled.span`
  width: 7px;
  height: 7px;

  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#727070" : "#cccccc")};
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;

  margin-left: auto;
`;

export const SecondaryButton = styled.button`
  min-width: 97px;
  height: 37px;

  padding: 0 20px;
  box-sizing: border-box;

  border: 0.2px solid #2e2e2e;
  border-radius: 37px;
  background: #ffffff;
  color: #2e2e2e;

  font-family: Poppins, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.28px;

  cursor: pointer;
  white-space: nowrap;
`;

export const PrimaryButton = styled.button`
  min-width: 97px;
  height: 37px;

  padding: 0 20px;
  box-sizing: border-box;

  border: none;
  border-radius: 666px;
  background: #2e2e2e;
  color: #ffffff;

  font-family: Poppins, sans-serif;
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #111111;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const NoticeIcon = styled.img`
  width: 46px;
  height: 46px;
  margin-bottom: 13px;
`;

export const NoticeTitle = styled.h2`
  margin: 0;

  color: #000;
  font-family: Poppins, sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0;
`;

export const NoticeDescription = styled.p`
  margin: 13px 0 18px;

  color: #949494;
  font-family: Poppins, sans-serif;
  font-size: 8px;
  font-weight: 600;
  line-height: 1.5;
`;

export const NoticeButton = styled.button`
  width: 100%;
  height: 30px;

  border: none;
  border-radius: 5px;
  background: #191919;
  color: #ffffff;

  font-family: Poppins, sans-serif;
  font-size: 8px;
  font-weight: 600;

  cursor: pointer;
`;
