import * as S from "./RoutineCard.styled";
import ArrowIcon from "../../assets/icons/ArrowIcon.svg";

function RoutineCard({
    title,
    description,
    status,
    image,
    isLocked: lockedProp = false,
    isCompleted = false,
    onStart,
}) {
    const locked = lockedProp || status === "LOCKED" || status === "잠김";
    const completed = isCompleted || status === "COMPLETED" || status === "완료";

    const getStatusLabel = () => {
        switch (status) {
            case "COMPLETED":
                return "완료";

            case "AVAILABLE":
                return "진행 가능";

            case "LOCKED":
                return "잠김";

            default:
                return status ?? "미완료";
        }
    };

    return (
        <S.Card $image={image} $locked={locked}>
            <S.Overlay />

            <S.Content>
                <S.Top>
                    <S.TitleArea>
                        <S.Title>
                            {title}
                        </S.Title>
                    </S.TitleArea>

                    <S.ArrowButton
                        type="button"
                        $locked={locked}
                        $completed={completed}
                        aria-disabled={locked}
                        onClick={(e) => {
                            e.stopPropagation();

                            if (locked) return;

                            onStart?.();
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

                <S.Status $completed={completed} $status={status}>
                    {getStatusLabel()}
                </S.Status>
            </S.Content>
        </S.Card>
    );
}

export default RoutineCard;
