import * as S from "./RoutineCard.styled";
import ArrowIcon from "../../assets/icons/ArrowIcon.svg";

function RoutineCard({
    title,
    description,
    status,
    image,
    isLocked = false,
    isCompleted = false,
    onStart,
}) {
    return (
        <S.Card $image={image} $locked={isLocked}>
            <S.Overlay />

            <S.Content>
                <S.Top>
                    <S.TitleArea>
                        <S.Title>{title}</S.Title>
                    </S.TitleArea>

                    <S.ArrowButton
                        type="button"
                        $locked={isLocked}
                        $completed={isCompleted}
                        aria-disabled={isLocked || isCompleted}
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

                <S.Status $completed={isCompleted}>
                    {status}
                </S.Status>
            </S.Content>
        </S.Card>
    );
}

export default RoutineCard;
