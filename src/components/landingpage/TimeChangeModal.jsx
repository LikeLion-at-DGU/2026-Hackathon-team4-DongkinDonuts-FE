import { useEffect, useRef, useState } from "react";
import * as S from "./TimeChangeModal.styled";

const recommendedTimes = ["15:00", "16:00", "17:00", "18:00"];

const ITEM_HEIGHT = 31;

function TimeChangeModal({
    currentTime = "15:00",
    onClose,
    onSave,
}) {
    const [selectedTime, setSelectedTime] = useState(currentTime);
    const [repeat, setRepeat] = useState(true);

    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    const [selectedHour, selectedMinute] = selectedTime.split(":");

    const hours = Array.from(
        { length: 24 },
        (_, index) => String(index).padStart(2, "0")
    );

    const minutes = Array.from(
        { length: 60 },
        (_, index) => String(index).padStart(2, "0")
    );

    useEffect(() => {
        const [hour, minute] = currentTime.split(":");

        const hourIndex = hours.indexOf(hour);
        const minuteIndex = minutes.indexOf(minute);

        requestAnimationFrame(() => {
            if (hourRef.current) {
                hourRef.current.scrollTop =
                    hourIndex * ITEM_HEIGHT;
            }

            if (minuteRef.current) {
                minuteRef.current.scrollTop =
                    minuteIndex * ITEM_HEIGHT;
            }
        });
    }, []);

    useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
        document.body.style.overflow = originalOverflow;
    };
}, []);

    const handleRecommendedTime = (time) => {
        setSelectedTime(time);

        const [hour, minute] = time.split(":");

        const hourIndex = hours.indexOf(hour);
        const minuteIndex = minutes.indexOf(minute);

        hourRef.current?.scrollTo({
            top: hourIndex * ITEM_HEIGHT,
            behavior: "smooth",
        });

        minuteRef.current?.scrollTo({
            top: minuteIndex * ITEM_HEIGHT,
            behavior: "smooth",
        });
    };

    const handleHourScroll = () => {
        if (!hourRef.current) return;

        const index = Math.round(
            hourRef.current.scrollTop / ITEM_HEIGHT
        );

        const safeIndex = Math.max(
            0,
            Math.min(index, hours.length - 1)
        );

        const hour = hours[safeIndex];

        setSelectedTime((prev) => {
            const [, minute] = prev.split(":");

            return `${hour}:${minute}`;
        });
    };

    const handleMinuteScroll = () => {
        if (!minuteRef.current) return;

        const index = Math.round(
            minuteRef.current.scrollTop / ITEM_HEIGHT
        );

        const safeIndex = Math.max(
            0,
            Math.min(index, minutes.length - 1)
        );

        const minute = minutes[safeIndex];

        setSelectedTime((prev) => {
            const [hour] = prev.split(":");

            return `${hour}:${minute}`;
        });
    };

    const handleHourChange = (hour) => {
        const index = hours.indexOf(hour);

        hourRef.current?.scrollTo({
            top: index * ITEM_HEIGHT,
            behavior: "smooth",
        });
    };

    const handleMinuteChange = (minute) => {
        const index = minutes.indexOf(minute);

        minuteRef.current?.scrollTo({
            top: index * ITEM_HEIGHT,
            behavior: "smooth",
        });
    };

    const handleSave = () => {
        onSave(selectedTime, repeat);
        onClose();
    };

    return (
        <S.Overlay onClick={onClose}>
            <S.ModalPositioner>
                <S.Modal onClick={(e) => e.stopPropagation()}>
                    <S.CloseButton
                        type="button"
                        onClick={onClose}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                            <path
                                d="M3.44629 3.65627L3.54034 3.54077C3.67705 3.40436 3.85729 3.32023 4.04965 3.30304C4.24202 3.28586 4.43431 3.3367 4.59304 3.44672L4.70854 3.54077L9.89944 8.73332L15.0903 3.54077C15.167 3.46406 15.2581 3.40322 15.3583 3.36171C15.4585 3.32019 15.566 3.29883 15.6744 3.29883C15.7829 3.29883 15.8903 3.32019 15.9906 3.36171C16.0908 3.40322 16.1818 3.46406 16.2585 3.54077C16.3352 3.61748 16.3961 3.70854 16.4376 3.80876C16.4791 3.90898 16.5005 4.01639 16.5005 4.12487C16.5005 4.23335 16.4791 4.34076 16.4376 4.44098C16.3961 4.5412 16.3352 4.63227 16.2585 4.70897L11.066 9.89987L16.2585 15.0908C16.395 15.2275 16.4791 15.4077 16.4963 15.6001C16.5135 15.7924 16.4626 15.9847 16.3526 16.1435L16.2585 16.259C16.1218 16.3954 15.9416 16.4795 15.7492 16.4967C15.5569 16.5139 15.3646 16.463 15.2058 16.353L15.0903 16.259L9.89944 11.0664L4.70854 16.259C4.63184 16.3357 4.54078 16.3965 4.44056 16.438C4.34034 16.4795 4.23292 16.5009 4.12444 16.5009C4.01597 16.5009 3.90855 16.4795 3.80833 16.438C3.70811 16.3965 3.61705 16.3357 3.54034 16.259C3.46364 16.1823 3.40279 16.0912 3.36128 15.991C3.31977 15.8908 3.2984 15.7833 3.2984 15.6749C3.2984 15.5664 3.31977 15.459 3.36128 15.3588C3.40279 15.2585 3.46364 15.1675 3.54034 15.0908L8.73289 9.89987L3.54034 4.70897C3.40393 4.57226 3.3198 4.39202 3.30261 4.19966C3.28543 4.00729 3.33627 3.815 3.44629 3.65627Z"
                                fill="#D2D2D2"
                            />
                        </svg>
                    </S.CloseButton>

                    <S.Title>시간 변경하기</S.Title>

                    <S.Description>
                        원하는 리셋 시간을 선택하거나 직접 설정할 수 있어요.
                    </S.Description>

                    <S.Divider />

                    {/* 추천 시간 */}
                    <S.Section>
                        <S.SectionTitle>
                            추천 시간
                        </S.SectionTitle>

                        <S.SectionDescription>
                            사용 패턴과 입력 내용을 바탕으로 설정한 최적의 시간이에요.
                        </S.SectionDescription>

                        <S.RecommendedTimes>
                            {recommendedTimes.map((time) => (
                                <S.TimeButton
                                    key={time}
                                    type="button"
                                    $active={
                                        selectedTime === time
                                    }
                                    onClick={() =>
                                        handleRecommendedTime(
                                            time
                                        )
                                    }
                                >
                                    {time}
                                </S.TimeButton>
                            ))}
                        </S.RecommendedTimes>
                    </S.Section>

                    <S.Divider />

                    {/* 직접 설정 */}
                    <S.Section>
                        <S.SectionTitle>
                            직접 설정
                        </S.SectionTitle>

                        <S.SectionDescription>
                            원하는 시간을 직접 설정할 수 있어요.
                        </S.SectionDescription>

                        <S.TimePicker>
                            <S.TimeColumn
                                ref={hourRef}
                                onScroll={handleHourScroll}
                            >
                                <S.PickerSpacer />

                                {hours.map((hour) => (
                                    <S.PickerItem
                                        key={hour}
                                        type="button"
                                        $active={
                                            selectedHour === hour
                                        }
                                        onClick={() =>
                                            handleHourChange(
                                                hour
                                            )
                                        }
                                    >
                                        {hour}
                                    </S.PickerItem>
                                ))}

                                <S.PickerSpacer />
                            </S.TimeColumn>

                            <S.Colon>:</S.Colon>

                            <S.TimeColumn
                                ref={minuteRef}
                                onScroll={handleMinuteScroll}
                            >
                                <S.PickerSpacer />

                                {minutes.map((minute) => (
                                    <S.PickerItem
                                        key={minute}
                                        type="button"
                                        $active={
                                            selectedMinute ===
                                            minute
                                        }
                                        onClick={() =>
                                            handleMinuteChange(
                                                minute
                                            )
                                        }
                                    >
                                        {minute}
                                    </S.PickerItem>
                                ))}

                                <S.PickerSpacer />
                            </S.TimeColumn>

                            <S.SelectedLine />
                        </S.TimePicker>
                    </S.Section>

                    <S.Divider />

                    {/* 반복 설정 */}
                    <S.RepeatRow>
                        <div>
                            <S.SectionTitle>
                                반복 설정
                            </S.SectionTitle>

                            <S.SectionDescription>
                                매일 같은 시간에 알림을 받을까요?
                            </S.SectionDescription>
                        </div>

                        <S.Toggle
                            type="button"
                            $active={repeat}
                            onClick={() =>
                                setRepeat(
                                    (prev) => !prev
                                )
                            }
                        >
                            <S.ToggleCircle
                                $active={repeat}
                            />
                        </S.Toggle>
                    </S.RepeatRow>

                    <S.Divider />

                    <S.ButtonRow>
                        <S.CancelButton
                            type="button"
                            onClick={onClose}
                        >
                            취소
                        </S.CancelButton>

                        <S.SaveButton
                            type="button"
                            onClick={handleSave}
                        >
                            저장하기
                        </S.SaveButton>
                    </S.ButtonRow>
                </S.Modal>
            </S.ModalPositioner>
        </S.Overlay>
    );
}

export default TimeChangeModal;