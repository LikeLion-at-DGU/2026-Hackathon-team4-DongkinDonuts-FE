import { useLocation, useNavigate } from "react-router-dom";
import * as S from "./Header.styled";

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const isSettingsPage =
        location.pathname === "/settings";

    const handleLogoClick = () => {
        window.location.assign("/");
    };

    const handleSectionClick = (section) => {
        navigate("/", {
            state: { scrollTo: section },
        });
    };

    // settings 페이지
    if (isSettingsPage) {
        return (
            <S.Header>
                <S.Logo
                    onClick={
                        handleLogoClick
                    }
                >
                    Brainfit
                </S.Logo>
            </S.Header>
        );
    }

    // 기본 페이지
    return (
        <S.Header>
            <S.LeftGroup>
                <S.Logo
                    onClick={
                        handleLogoClick
                    }
                >
                    Brainfit
                </S.Logo>

                <S.Nav>
                    <S.NavButton
                        onClick={() =>
                            handleSectionClick("routine")
                        }
                    >
                        Routine
                    </S.NavButton>

                    <S.NavButton
                        onClick={() =>
                            handleSectionClick("digital")
                        }
                    >
                        My Digital State
                    </S.NavButton>
                </S.Nav>
            </S.LeftGroup>

            <S.SettingsButton
                onClick={() =>
                    navigate("/settings")
                }
            >
                More Services
            </S.SettingsButton>
        </S.Header>
    );
}

export default Header;