import { useEffect, useRef } from "react";
import CloseButton from "../../assets/icons/CloseButton.svg";

import { useTimeChangeModal } from "../../hooks/useTimeChangeModal";
import {
    RECOMMENDED_TIMES,
    HOURS,
    MINUTES,
} from "../../config/timeChangeConfig";

import * as S from "./TimeChangeModal.styled";

const OPEN_RECOVERY_SLOT_STATUSES = new Set([
    "RECOMMENDED",
    "SCHEDULED",
    "CHANGED",
]);

const NOTIFICATION_BASIS = {
    FREQUENCY: "FREQUENCY",
    SNAPSHOT: "SNAPSHOT",
};

function formatTime(dateTime) {
    if (!dateTime) return "--:--";

    return new Date(dateTime).toLocaleTimeString(
        "ko-KR",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }
    );
}

function notificationTimeForSlot(slot) {
    const pendingNotification = slot.notifications?.find(
        (notification) => notification.status === "PENDING"
    );

    return (
        pendingNotification?.scheduled_at ??
        slot.effective_time ??
        slot.user_changed_at ??
        slot.scheduled_at ??
        slot.recommended_at
    );
}

function notificationBasisForSlot(slot) {
    if (slot.notification_basis) {
        return slot.notification_basis;
    }

    return slot.data_source_summary?.used_digital_patterns
        ? NOTIFICATION_BASIS.FREQUENCY
        : NOTIFICATION_BASIS.SNAPSHOT;
}

function TimeChangeModal({
    currentTime = "15:00",
    currentRepeat = true,
    currentSlotId = null,
    scheduledSlots = [],
    isLoadingScheduledSlots = false,
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
        isSaving,
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

    const scheduledNotifications = scheduledSlots
        .filter((slot) => (
            slot.notification_enabled &&
            OPEN_RECOVERY_SLOT_STATUSES.has(slot.status)
        ))
        .map((slot) => {
            const dateTime = notificationTimeForSlot(slot);
            const date = dateTime ? new Date(dateTime) : null;

            return {
                id: slot.id,
                date,
                time: formatTime(dateTime),
                basis: notificationBasisForSlot(slot),
                isCurrent: slot.id === currentSlotId,
            };
        })
        .filter((item) => item.date && !Number.isNaN(item.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const selectedDate = new Date();
    const [selectedHourValue, selectedMinuteValue] = selectedTime
        .split(":")
        .map(Number);

    if (
        Number.isFinite(selectedHourValue) &&
        Number.isFinite(selectedMinuteValue)
    ) {
        selectedDate.setHours(selectedHourValue, selectedMinuteValue, 0, 0);
    }

    const previousNotificationCount = scheduledNotifications.filter(
        (item) =>
            !item.isCurrent &&
            item.basis === NOTIFICATION_BASIS.SNAPSHOT &&
            item.date.getTime() < selectedDate.getTime()
    ).length;

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
                            시간 변경하기
                        </S.Title>

                        <S.Description>
                            원하는 리셋 시간을 선택하거나 직접 설정할 수 있어요.
                        </S.Description>

                        <S.Divider />

                        <S.Section>
                            <S.SectionTitle>
                                예정된 알림 시간
                            </S.SectionTitle>

                            <S.SectionDescription>
                                오늘 남아 있는 회복 알림이에요.
                            </S.SectionDescription>

                            <S.ScheduledTimeList>
                                {isLoadingScheduledSlots ? (
                                    <S.ScheduledTimeEmpty>
                                        불러오는 중...
                                    </S.ScheduledTimeEmpty>
                                ) : scheduledNotifications.length > 0 ? (
                                    scheduledNotifications.map((item) => (
                                        <S.ScheduledTimeChip
                                            key={item.id}
                                            $current={item.isCurrent}
                                            $basis={item.basis}
                                        >
                                            <span>{item.time}</span>
                                            {item.isCurrent && (
                                                <small>다음</small>
                                            )}
                                        </S.ScheduledTimeChip>
                                    ))
                                ) : (
                                    <S.ScheduledTimeEmpty>
                                        예정된 알림이 없어요
                                    </S.ScheduledTimeEmpty>
                                )}
                            </S.ScheduledTimeList>

                            {previousNotificationCount > 0 && (
                                <S.ScheduleNotice>
                                    저장하면 선택 시간 이전 알림 {previousNotificationCount}개가 정리돼요.
                                </S.ScheduleNotice>
                            )}
                        </S.Section>

                        <S.Divider />

                        <S.Section>
                            <S.SectionTitle>
                                추천 시간
                            </S.SectionTitle>

                            <S.SectionDescription>
                                사용 패턴과 입력 내용을 바탕으로 설정한 최적의 시간이에요.
                            </S.SectionDescription>

                            <S.RecommendedTimes>
                                {RECOMMENDED_TIMES.map(
                                    (time) => (
                                        <S.TimeButton
                                            key={time}
                                            type="button"
                                            $active={
                                                selectedTime ===
                                                time
                                            }
                                            onClick={() =>
                                                handleRecommendedTime(
                                                    time
                                                )
                                            }
                                        >
                                            {time}
                                        </S.TimeButton>
                                    )
                                )}
                            </S.RecommendedTimes>
                        </S.Section>

                        <S.Divider />

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
                                disabled={isSaving}
                            >
                                {isSaving ? "저장 중..." : "저장하기"}
                            </S.SaveButton>
                        </S.ButtonRow>
                    </S.ModalScroll>
                </S.ModalFrame>
            </S.ModalPositioner>
        </S.Overlay>
    );
}

export default TimeChangeModal;
