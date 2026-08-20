import * as S from "./RoutineCard.styled";
import ArrowIcon from "../../assets/icons/ArrowIcon.svg";

function RoutineCard({
    title,
    description,
    status,
    image,
    onStart,
}) {
    const getStatusLabel = () => {
        switch (status) {
            case "COMPLETED":
                return "완료";

            case "AVAILABLE":
                return "진행 가능";

            case "LOCKED":
                return "잠김";

            default:
                return "미완료";
        }
    };

    const isLocked = status === "LOCKED";

    return (
        <S.Card $image={image}>
            <S.Overlay />

            <S.Content>
                <S.Top>
                    <S.TitleArea>
                        <S.Title>
                            {title}
                        </S.Title>
                    </S.TitleArea>

                    <S.ArrowButton
                        disabled={isLocked}
                        onClick={(e) => {
                            e.stopPropagation();

                            if (isLocked) return;

                            onStart();
                        }}
                    >
                        <img
                            src={ArrowIcon}
                            alt=""
                        />
                    </S.ArrowButton>
                </S.Top>

                <S.Description>
                    {description}
                </S.Description>

                <S.Divider />

                <S.Status $status={status}>
                    {getStatusLabel()}
                </S.Status>
            </S.Content>
        </S.Card>
    );
}

export default RoutineCard;