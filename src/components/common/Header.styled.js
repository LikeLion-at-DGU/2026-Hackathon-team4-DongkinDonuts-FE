import styled from "styled-components";

export const Header = styled.header`
    width: 100%;
    height: 92px;

    padding: 0 56px;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: #000;
`;

export const LeftGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 60px;
`;

export const Logo = styled.div`
    color: #fff;

    font-family: Poppins, sans-serif;
    font-size: 32px;
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

    color: #fff;

    font-family: Poppins, sans-serif;
    font-size: 20px;
    font-weight: 500;

    cursor: pointer;

    &:hover {
        opacity: 0.7;
    }
`;

export const SettingsButton = styled.button`
    width: 155px;
    height: 55px;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 9px;

    padding: 0;

    border: 1px solid #fff;
    border-radius: 55px;

    background: transparent;
    color: #fff;

    font-family: Poppins, sans-serif;
    font-size: 16px;
    font-weight: 500;

    cursor: pointer;

    img {
        width: 20px;
        height: 20px;
        display: block;
    }

    &:hover {
        opacity: 0.7;
    }
`;