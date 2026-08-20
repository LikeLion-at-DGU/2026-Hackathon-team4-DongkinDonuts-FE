import { useEffect, useRef } from "react";
import CloseButton from "../../assets/icons/CloseButton.svg";

import { useTimeChangeModal } from "../../hooks/useTimeChangeModal";
import {
    RECOMMENDED_TIMES,
    HOURS,
    MINUTES,
} from "../../config/timeChangeConfig";

import * as S from "./TimeChangeModal.styled";

function TimeChangeModal({
    currentTime,
    recommendedTimes = [],
    currentRepeat = false,
    onClose,
    onSave,
}) {
    const modalFrameRef = useRef(null);
    const maxScrollRef = useRef(null);

    const {
        selectedTime,
        selectedHour,
        selectedMinute,
        repeat,
        hourRef,
        minuteRef,
        handleRecommendedTime,
        handleHourScroll,
        handleMinuteScroll,
        handleHourChange,
        handleMinuteChange,
        toggleRepeat,
        handleSave,
    } = useTimeChangeModal(
        currentTime,
        currentRepeat,
        onSave,
        onClose
    );

    /*
     * 실제 추천 휴식 시간 + 기본 후보 시간 합치기
     *
     * 예:
     * recommendedTimes = ["23:02"]
     * RECOMMENDED_TIMES = ["15:00", "16:00", "17:00", "18:00"]
     *
     * 결과:
     * ["23:02", "15:00", "16:00", "17:00", "18:00"]
     */
    const displayTimes = [
        ...new Set([
            ...recommendedTimes,
            ...RECOMMENDED_TIMES,
        ]),
    ];

    useEffect(() => {
        const calculateMaxScroll = () => {
            const modal = modalFrameRef.current;

            if (!modal) return;

            const rect =
                modal.getBoundingClientRect();

            const modalBottom =
                rect.bottom + window.scrollY;

            const bottomGap = 20;

            const maxScroll =
                modalBottom -
                window.innerHeight +
                bottomGap;

            maxScrollRef.current =
                Math.max(
                    window.scrollY,
                    maxScroll
                );
        };

        const handleWindowScroll = () => {
            const maxScroll =
                maxScrollRef.current;

            if (maxScroll === null) return;

            if (window.scrollY > maxScroll) {
                window.scrollTo({
                    top: maxScroll,
                    behavior: "auto",
                });
            }
        };

        requestAnimationFrame(
            calculateMaxScroll
        );

        window.addEventListener(
            "scroll",
            handleWindowScroll,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            calculateMaxScroll
        );

        return () => {
            window.removeEventListener(
                "scroll",
                handleWindowScroll
            );

            window.removeEventListener(
                "resize",
                calculateMaxScroll
            );
        };
    }, []);

    return (
        <S.Overlay onClick={onClose}>
            <S.ModalPositioner>
                <S.ModalFrame
                    ref={modalFrameRef}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                >
                    <S.CloseButton
                        type="button"
                        onClick={onClose}
                    >
                        <img
                            src={CloseButton}
                            alt="닫기"
                        />
                    </S.CloseButton>

                    <S.ModalScroll>
                        <S.Title>
                            시간 선택하기
                        </S.Title>

                        <S.Description>
                            원하는 리셋 시간을 선택하거나 직접 설정할 수 있어요.
                        </S.Description>

                        <S.Divider />

                        <S.Section>
                            <S.SectionTitle>
                                알림 예정 시간
                            </S.SectionTitle>

                            <S.SectionDescription>
                                파란색은 권장 휴식 시간으로, 알림을 해제할 수 없어요.
                            </S.SectionDescription>

                            <S.RecommendedTimes>
                                {displayTimes.map(
                                    (time) => {
                                        const isSelected =
                                            selectedTime ===
                                            time;

                                        const isRecommended =
                                            recommendedTimes.includes(
                                                time
                                            );

                                        return (
                                            <S.TimeButton
                                                key={
                                                    time
                                                }
                                                type="button"
                                                $selected={
                                                    isSelected
                                                }
                                                $recommended={
                                                    isRecommended
                                                }
                                                onClick={() =>
                                                    handleRecommendedTime(
                                                        time
                                                    )
                                                }
                                            >
                                                {
                                                    time
                                                }
                                            </S.TimeButton>
                                        );
                                    }
                                )}
                            </S.RecommendedTimes>
                        </S.Section>

                        <S.Divider />

                        <S.Section>
                            <S.SectionTitle>
                                직접 설정
                            </S.SectionTitle>

                            <S.SectionDescription>
                                알림을 받고 싶은 시간으로 직접 설정해보세요.
                            </S.SectionDescription>

                            <S.TimePicker>
                                <S.TimeColumn
                                    ref={hourRef}
                                    onScroll={
                                        handleHourScroll
                                    }
                                >
                                    <S.PickerSpacer />

                                    {HOURS.map(
                                        (hour) => (
                                            <S.PickerItem
                                                key={
                                                    hour
                                                }
                                                type="button"
                                                $active={
                                                    selectedHour ===
                                                    hour
                                                }
                                                onClick={() =>
                                                    handleHourChange(
                                                        hour
                                                    )
                                                }
                                            >
                                                {
                                                    hour
                                                }
                                            </S.PickerItem>
                                        )
                                    )}

                                    <S.PickerSpacer />
                                </S.TimeColumn>

                                <S.Colon>
                                    :
                                </S.Colon>

                                <S.TimeColumn
                                    ref={minuteRef}
                                    onScroll={
                                        handleMinuteScroll
                                    }
                                >
                                    <S.PickerSpacer />

                                    {MINUTES.map(
                                        (
                                            minute
                                        ) => (
                                            <S.PickerItem
                                                key={
                                                    minute
                                                }
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
                                                {
                                                    minute
                                                }
                                            </S.PickerItem>
                                        )
                                    )}

                                    <S.PickerSpacer />
                                </S.TimeColumn>

                                <S.SelectedLine />
                            </S.TimePicker>
                        </S.Section>

                        <S.Divider />

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
                                onClick={
                                    toggleRepeat
                                }
                            >
                                <S.ToggleCircle
                                    $active={
                                        repeat
                                    }
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
                                onClick={
                                    handleSave
                                }
                            >
                                저장하기
                            </S.SaveButton>
                        </S.ButtonRow>
                    </S.ModalScroll>
                </S.ModalFrame>
            </S.ModalPositioner>
        </S.Overlay>
    );
}

export default TimeChangeModal;