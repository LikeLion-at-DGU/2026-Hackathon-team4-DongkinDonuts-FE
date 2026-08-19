import { useLocation, useNavigate } from "react-router-dom";
import Settings from "../../assets/icons/Settings.svg";
import * as S from "./Header.styled";
console.log(S);

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const isSettingsPage = location.pathname === "/settings";

    const handleRoutineClick = () => {
        navigate("/", {
            state: { scrollTo: "routine" },
        });
    };

    const handleDigitalClick = () => {
        navigate("/", {
            state: { scrollTo: "digital" },
        });
    };

    // settings 페이지
    if (isSettingsPage) {
        return (
            <S.Header>
                <S.Logo onClick={() => navigate("/")}>
                    Brainfit
                </S.Logo>
            </S.Header>
        );
    }

    // 기본 페이지
    return (
        <S.Header>
            <S.LeftGroup>
                <S.Logo onClick={() => navigate("/")}>
                    Brainfit
                </S.Logo>

                <S.Nav>
                    <S.NavButton onClick={handleRoutineClick}>
                        Routine
                    </S.NavButton>

                    <S.NavButton onClick={handleDigitalClick}>
                        My Digital State
                    </S.NavButton>
                </S.Nav>
            </S.LeftGroup>

            <S.SettingsButton onClick={() => navigate("/settings")}>
                <img src={Settings} alt="" />
                Settings
            </S.SettingsButton>
        </S.Header>
    );
}

export default Header;