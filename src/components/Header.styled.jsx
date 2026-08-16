import styled from "styled-components";

export const Header = styled.header`
  width: 100%;
  height: 92px;

  padding: 0 56px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: #000000;
`;

export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
`;

export const Logo = styled.div`
  color: #FFF;
  font-family: Poppins;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: -0.32px;

  cursor: pointer;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;

  gap: 62px;
`;

export const NavButton = styled.button`
  padding: 0;

  border: none;
  background: transparent;

  color: #ffffff;
  font-family: Poppins;
  font-size: 20px;
  font-weight: 500;
  line-height: normal;

  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

export const MyPageButton = styled.button`
  display: flex;
  width: 155px;
  height: 55px;
  padding: 18px 37px;
  box-sizing: border-box;

  justify-content: center;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;

  border-radius: 55px;
  border: 1px solid #fff;

  background: transparent;
  color: #fff;

  font-family: Poppins;
  font-size: 16px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.24px;

  cursor: pointer;

  svg {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  &:hover {
    opacity: 0.7;
  }
`;