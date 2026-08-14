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
  width: 168px;
  height: 60px;
  padding: 20px 40px;

  justify-content: center;
  align-items: center;
  border-radius: 60px;
  border: 1px solid #FFF;

  background: transparent;
  color: #ffffff;

  font-size: 18px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.27px;
  font-family: Poppins;

  cursor: pointer;

  &:hover {
    border-color: #ffffff;
  }
`;