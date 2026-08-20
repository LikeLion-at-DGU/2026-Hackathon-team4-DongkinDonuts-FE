import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 32px;
  box-sizing: border-box;

  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
`;

export const WideModal = styled.div`
  position: relative;

  width: min(1190px, calc(100vw - 64px));
  min-height: 720px;

  padding: 56px 72px 38px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  border-radius: 56px;
  background: #f5f5f5;
  color: #000;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
`;

export const NoticeModal = styled.div`
  width: min(510px, calc(100vw - 48px));

  padding: 56px 46px 48px;
  box-sizing: border-box;

  border-radius: 24px;
  background: #ffffff;
  color: #000;
  text-align: center;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 48px;
  right: 48px;

  width: 32px;
  height: 32px;

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
  margin: 0 0 24px;

  color: rgba(122, 121, 121, 0.6);
  font-family: Poppins, sans-serif;
  font-size: 21px;
  font-weight: 600;
  line-height: 1.2;
`;

export const Title = styled.h2`
  margin: 0;

  color: #000;
  font-family: Poppins, sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0;
`;

export const Description = styled.p`
  margin: 24px 0 34px;

  color: #777;
  font-family: Poppins, sans-serif;
  font-size: 25px;
  font-weight: 400;
  line-height: 1.45;
`;

export const Section = styled.section`
  margin-top: ${({ $compact }) => ($compact ? "24px" : "34px")};
`;

export const SectionLabel = styled.h3`
  margin: 0 0 18px;

  color: #2e2e2e;
  font-family: Poppins, sans-serif;
  font-size: 25px;
  font-weight: 600;
  line-height: 1.2;
`;

export const OptionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

export const OptionButton = styled.button`
  height: 88px;
  min-width: 180px;

  padding: 0 40px;

  border: 1.5px solid #686868;
  border-radius: 56px;
  background: ${({ $selected }) => ($selected ? "#d5d5d5" : "#ffffff")};
  color: #000;

  font-family: Poppins, sans-serif;
  font-size: 31px;
  font-weight: 600;
  line-height: 1;

  cursor: pointer;

  ${({ $selected }) =>
    $selected
      ? "box-shadow: inset 0 0 0 2px #686868;"
      : ""}
`;

export const CustomInput = styled.input`
  width: 210px;
  height: 88px;

  padding: 0 34px;
  box-sizing: border-box;

  border: 1.5px solid #686868;
  border-radius: 56px;
  outline: none;
  background: #ffffff;
  color: #000;

  font-family: Poppins, sans-serif;
  font-size: 28px;
  font-weight: 600;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;

  margin-top: auto;

  background: #cfcfcf;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 28px;
`;

export const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Dot = styled.span`
  width: 16px;
  height: 16px;

  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#7d7d7d" : "#d0d0d0")};
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

export const TextButton = styled.button`
  border: none;
  background: transparent;
  color: #b9b9b9;

  font-family: Poppins, sans-serif;
  font-size: 32px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 8px;

  cursor: pointer;
`;

export const SecondaryButton = styled.button`
  min-width: 232px;
  height: 90px;

  padding: 0 44px;

  border: 1.5px solid #2e2e2e;
  border-radius: 56px;
  background: #ffffff;
  color: #2e2e2e;

  font-family: Poppins, sans-serif;
  font-size: 31px;
  font-weight: 600;

  cursor: pointer;
`;

export const PrimaryButton = styled.button`
  min-width: 232px;
  height: 90px;

  padding: 0 44px;

  border: none;
  border-radius: 56px;
  background: #2e2e2e;
  color: #ffffff;

  font-family: Poppins, sans-serif;
  font-size: 31px;
  font-weight: 600;

  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const NoticeIcon = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 28px;
`;

export const NoticeTitle = styled.h2`
  margin: 0;

  color: #000;
  font-family: Poppins, sans-serif;
  font-size: 27px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0;
`;

export const NoticeDescription = styled.p`
  margin: 28px 0 38px;

  color: #949494;
  font-family: Poppins, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
`;

export const NoticeButton = styled.button`
  width: 100%;
  height: 62px;

  border: none;
  border-radius: 10px;
  background: #191919;
  color: #ffffff;

  font-family: Poppins, sans-serif;
  font-size: 18px;
  font-weight: 600;

  cursor: pointer;
`;
