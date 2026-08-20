import React from "react";
import { useLocation } from "react-router-dom";

import * as S from "./Footer.styled";

const footerMenus = [
    {
        title: "Contact us",
        items: [
            "brainfit@gmail.com",
            "Instagram",
        ],
    },
    {
        title: "Products",
        items: [
            "Brainfit",
            "Routine",
            "AI Insight",
        ],
    },
    {
        title: "About US",
        items: [
            "정서현 PM",
            "고성채 FE",
            "노윤서 FE",
            "이희수 BE",
            "이창환 BE",
            "황준호 BE",
        ],
    },
];

const Footer = () => {
    const location = useLocation();

    const darkPages = [
        "/handroutine",
        "/breathroutine",
    ];

    const isDark = darkPages.includes(
        location.pathname
    );

    return (
        <S.FooterContainer $isDark={isDark}>
            <S.Footer>
                <S.FooterContent>
                    <S.BrandArea>
                        <S.Logo>
                            Brainfit
                        </S.Logo>

                        <S.Copyright>
                            dgu @ 2026. Brainfit
                        </S.Copyright>
                    </S.BrandArea>

                    {footerMenus.map((menu) => (
                        <S.MenuGroup key={menu.title}>
                            <S.MenuTitle>
                                {menu.title}
                            </S.MenuTitle>

                            {menu.items.map((item) => (
                                <S.MenuItem key={item}>
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