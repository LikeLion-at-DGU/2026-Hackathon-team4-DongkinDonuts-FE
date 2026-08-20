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
    currentTime = "15:00",
    currentRepeat = true,
    activeRecommendedTimes = [],
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

    useEffect(() => {
        const calculateMaxScroll = () => {
            const modal = modalFrameRef.current;

            if (!modal) return;

            const rect =
                modal.getBoundingClientRect();

            /*
             * 현재 모달의 실제 문서상 bottom 위치
             */
            const modalBottom =
                rect.bottom + window.scrollY;

            /*
             * 모달 하단과 화면 하단 사이에
             * 어느 정도 간격을 둘지
             *
             * 20 = 거의 화면 끝까지
             * 50 = 조금 더 위에서 멈춤
             */
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

            /*
             * 아래로 너무 많이 내려갔으면
             * 정해둔 위치까지만 되돌림
             */
            if (window.scrollY > maxScroll) {
                window.scrollTo({
                    top: maxScroll,
                    behavior: "auto",
                });
            }
        };

        /*
         * 모달 렌더링 완료 후 계산
         */
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
                                파란색은 권장 휴식 시간으로, 알림을 해제할 수 있어요.
                            </S.SectionDescription>

                            <S.RecommendedTimes>
                                {RECOMMENDED_TIMES.map((time) => {
                                    const isRecommended =
                                        activeRecommendedTimes.includes(time);

                                    return (
                                        <S.TimeButton
                                            key={time}
                                            type="button"
                                            $active={
                                                selectedTime === time &&
                                                !isRecommended
                                            }
                                            $recommended={isRecommended}
                                            disabled={isRecommended}
                                            onClick={() => {
                                                if (isRecommended) return;

                                                handleRecommendedTime(time);
                                            }}
                                        >
                                            {time}
                                        </S.TimeButton>
                                    );
                                })}
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