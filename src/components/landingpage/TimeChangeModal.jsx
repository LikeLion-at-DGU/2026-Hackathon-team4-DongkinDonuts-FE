import { useEffect, useRef, useState } from "react";
import CloseButton from "../../assets/icons/CloseButton.svg";
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
                        <img src={CloseButton} alt="닫기" />
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