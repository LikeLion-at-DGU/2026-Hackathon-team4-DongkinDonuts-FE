import * as S from "./Header.styled";

function Header({
    onRoutineClick,
    onInsightClick,
}) {
    return (
        <S.Header>
            <S.LeftGroup>
                <S.Logo>Brainfit</S.Logo>

                <S.Nav>
                    <S.NavButton onClick={onRoutineClick}
                    >Routine
                    </S.NavButton>

                    <S.NavButton onClick={onInsightClick}>
                        AI Insight
                    </S.NavButton>
                </S.Nav>
            </S.LeftGroup>

            <S.MyPageButton>My page</S.MyPageButton>
        </S.Header>
    );
}

export default Header;