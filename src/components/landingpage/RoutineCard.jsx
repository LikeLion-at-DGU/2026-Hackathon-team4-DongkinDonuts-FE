import * as S from "./RoutineCard.styled";
import ArrowIcon from "../../assets/icons/ArrowIcon.svg";

function RoutineCard({
    title,
    description,
    status,
    duration,
    image,
    onStart,
}) {
    return (
        <S.Card $image={image}>
            <S.Overlay />

            <S.Content>
                <S.Top>
                    <S.TitleArea>
                        <S.Title>{title}</S.Title>
                    </S.TitleArea>

                    <S.ArrowButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onStart();
                        }}
                    >
                        <img src={ArrowIcon} alt="" />
                    </S.ArrowButton>
                </S.Top>

                <S.Description>
                    {description}
                </S.Description>

                <S.Divider />

                <S.Status>
                    {status}
                </S.Status>
            </S.Content>
        </S.Card>
    );
}

export default RoutineCard;