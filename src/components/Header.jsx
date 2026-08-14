import * as S from "./Header.styled";

function Header() {
    return (
        <S.Header>
            <S.LeftGroup>
                <S.Logo>Brainfit</S.Logo>

                <S.Nav>
                    <S.NavButton>Routine</S.NavButton>
                    <S.NavButton>AI Insight</S.NavButton>
                </S.Nav>
            </S.LeftGroup>

            <S.MyPageButton>My page</S.MyPageButton>
        </S.Header>
    );
}

export default Header;