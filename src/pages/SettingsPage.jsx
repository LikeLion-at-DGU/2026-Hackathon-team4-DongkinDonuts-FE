import { useNavigate } from "react-router-dom";
import settingsImage from "../assets/images/settingsImage.png";
import * as S from "./SettingsPage.styled";

function SettingsPage() {
    const navigate = useNavigate();

    return (
        <S.Page>
            <S.ImageWrapper>
                <S.SettingsImage
                    src={settingsImage}
                    alt="Brainfit Settings"
                />

                <S.BrainfitClickArea
                    onClick={() => navigate("/")}
                    aria-label="Brainfit 홈으로 이동"
                />
            </S.ImageWrapper>
        </S.Page>
    );
}

export default SettingsPage;