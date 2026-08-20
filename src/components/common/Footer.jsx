import { useLocation } from "react-router-dom";

import {
    FOOTER_MENUS,
    LIGHT_FOOTER_PAGES,
} from "../../data/footerData";

import * as S from "./Footer.styled";

const Footer = () => {
    const location = useLocation();

    const isDark = !LIGHT_FOOTER_PAGES.includes(
        location.pathname
    );

    return (
        <S.FooterContainer $isDark={isDark}>
            <S.Footer>
                <S.FooterContent>
                    <S.BrandArea>
                        <S.Logo $isDark={isDark}>
                            Brainfit
                        </S.Logo>

                        <S.Copyright $isDark={isDark}>
                            dgu @ 2026. Brainfit
                        </S.Copyright>
                    </S.BrandArea>

                    {FOOTER_MENUS.map((menu) => (
                        <S.MenuGroup key={menu.title}>
                            <S.MenuTitle $isDark={isDark}>
                                {menu.title}
                            </S.MenuTitle>

                            {menu.items.map((item) => (
                                <S.MenuItem
                                    key={item}
                                    $isDark={isDark}
                                >
                                    {item}
                                </S.MenuItem>
                            ))}
                        </S.MenuGroup>
                    ))}
                </S.FooterContent>
            </S.Footer>
        </S.FooterContainer>
    );
};

export default Footer;