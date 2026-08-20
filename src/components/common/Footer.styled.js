import styled from "styled-components";

export const FooterContainer = styled.footer`
    width: 100%;

    background: ${({ $isDark }) =>
        $isDark ? "#17181d" : "#f4f5f6"};

    transition: background 0.3s ease;
`;

export const Footer = styled.div`
    width: 100%;
    max-width: 1440px;

    height: 410px;

    margin: 0 auto;

    padding: 90px 135px 50px;

    box-sizing: border-box;
`;

export const FooterContent = styled.div`
    width: 100%;

    display: grid;

    grid-template-columns:
        1.3fr
        1fr
        1fr
        1fr;

    align-items: flex-start;

    column-gap: 80px;
`;

export const BrandArea = styled.div`
    height: 240px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export const Logo = styled.h3`
    margin: 0;

    color: ${({ $isDark }) =>
        $isDark ? "#f5f9fc" : "#141416"};

    font-family: Poppins;
    font-size: 45px;
    font-weight: 600;
    line-height: 1;
`;

export const Copyright = styled.span`
    color: #95a1bb;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
`;

export const MenuGroup = styled.div`
    display: flex;
    flex-direction: column;

    align-items: flex-start;
`;

export const MenuTitle = styled.h4`
    margin: 0 0 20px;

    color: ${({ $isDark }) =>
        $isDark ? "#d9e2ec" : "#3b5266"};

    font-family: Poppins;
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
`;

export const MenuItem = styled.span`
    margin-bottom: 12px;

    color: ${({ $isDark }) =>
        $isDark ? "#b7c4d2" : "#353945"};

    font-family: Poppins;
    font-size: 15px;
    font-weight: 400;
    line-height: 22px;

    cursor: pointer;

    &:hover {
        color: ${({ $isDark }) =>
            $isDark ? "#ffffff" : "#000000"};
    }
`;
