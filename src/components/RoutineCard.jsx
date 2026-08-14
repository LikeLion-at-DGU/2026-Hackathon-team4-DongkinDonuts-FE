import * as S from "./RoutineCard.styled";

function RoutineCard({
    title,
    description,
    status,
    duration,
    image,
}) {
    return (
        <S.Card $image={image}>
            <S.Overlay />

            <S.Content>
                <S.Top>
                    <S.TitleArea>
                        <S.Title>{title}</S.Title>

                        {duration && (
                            <S.Duration>{duration}</S.Duration>
                        )}
                    </S.TitleArea>

                    <S.ArrowButton>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path d="M4.16667 11.4583C3.59137 11.4583 3.125 11.9247 3.125 12.5C3.125 13.0753 3.59137 13.5417 4.16667 13.5417L18.8394 13.5417L13.8468 18.5343C13.44 18.9411 13.44 19.6006 13.8468 20.0074C14.2536 20.4142 14.9131 20.4142 15.3199 20.0074L21.3542 13.9731C22.1678 13.1595 22.1678 11.8405 21.3542 11.0269L15.3199 4.9926C14.9131 4.5858 14.2536 4.5858 13.8468 4.9926C13.44 5.39939 13.44 6.05894 13.8468 6.46574L18.8394 11.4583L4.16667 11.4583Z" fill="#0D0D0D" />
                        </svg>
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