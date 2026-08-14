import styled from "styled-components";

export const Footer = styled.footer`
    width: 1440px;
    margin: 0 auto;
    padding: 32px 161px 21px;
    
    background: #F4F5F6;

    box-sizing: border-box;
`;

export const FooterInner = styled.div`
    width: 100%;
    max-width: 1118px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 20px;
`;

export const Logo = styled.h3`
    width: 118px;

    margin: 0 0 12px;

    color: #141416;
    font-family: Rubik;
    font-size: 24px;
    font-style: normal;
    font-weight: 500;
    line-height: 28px;
`;

export const FooterMenu = styled.div`
    width: 100%;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

export const MenuGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 12px;
`;

export const MenuTitle = styled.h4`
    width: 166px;

    margin: 0 0 12px;

    color: #3B5266;

    font-family: Poppins;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
`;

export const MenuItem = styled.span`
    width: 166px;

    color: #353945;

    font-family: Lato;
    font-size: 17px;
    font-weight: 400;
    line-height: 25px;

    cursor: pointer;

    &:hover {
        color: #000000;
    }
`;

export const StoreButton = styled.button`
    width: 165px;
    height: 45px;

    padding: 0;
    border: none;
    border-radius: 5px;

    background: #141416;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    svg {
        display: block;
        max-width: 100%;
        max-height: 100%;
    }
`;

export const FooterBottom = styled.div`
    width: 100%;
    max-width: 1118px;

    margin: 28px auto 0;
    padding-top: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    box-sizing: border-box;

    font-family: Rubik;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    color: #95A1BB;
`;

export const Locale = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
        width: 21px;
        height: 20px;
    }
`;