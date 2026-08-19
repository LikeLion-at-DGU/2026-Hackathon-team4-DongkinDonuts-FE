import { useNavigate } from "react-router-dom";
import * as S from "./Header.styled";

function Header() {
    const navigate = useNavigate();

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
        </S.Header>
    );
}

export default Header;
