import ClockIcon from "../../assets/icons/ClockIcon.svg";

import * as S from "./DigitalUsage.styled";

const OPEN_RECOVERY_SLOT_STATUSES = new Set([
    "RECOMMENDED",
    "SCHEDULED",
    "CHANGED",
]);

function DigitalScheduleCard({
    showResult,
    schedules = [],
    alarmStates,
    onToggleAlarm,
}) {
    const formatTime = (dateTime) => {
        if (!dateTime) {
            return "--:--";
        }

        const date = new Date(dateTime);

        return date.toLocaleTimeString(
            "ko-KR",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }
        );
    };

    const notificationTimeForSchedule = (schedule) =>
        schedule.effective_time ??
        schedule.user_changed_at ??
        schedule.scheduled_at ??
        schedule.recommended_at;

    const upcomingSchedules = schedules
        .map((schedule) => ({
            ...schedule,
            notificationTime:
                notificationTimeForSchedule(schedule),
        }))
        .filter((schedule) => {
            const date = schedule.notificationTime
                ? new Date(schedule.notificationTime)
                : null;

            return (
                OPEN_RECOVERY_SLOT_STATUSES.has(schedule.status) &&
                date &&
                !Number.isNaN(date.getTime()) &&
                date.getTime() >= Date.now()
            );
        })
        .sort(
            (a, b) =>
                new Date(a.notificationTime).getTime() -
                new Date(b.notificationTime).getTime()
        );

    return (
        <S.InfoCard $schedule>
            <S.CardTitle>
                <img
                    src={ClockIcon}
                    alt=""
                    width="38"
                    height="38"
                />
                오늘의 권장 휴식 일정
            </S.CardTitle>

            {!showResult ? (
                <S.EmptyContent>
                    <S.EmptyIcon $schedule>
                        <img
                            src={ClockIcon}
                            alt=""
                            width="53"
                            height="53"
                        />
                    </S.EmptyIcon>

                    <S.EmptyTitle>
                        패턴을 저장하면 오늘의 휴식 일정이 자동 생성돼요
                    </S.EmptyTitle>

                    <S.EmptyDescription>
                        입력한 패턴에 따라
                        <br />
                        사용 패턴에 맞춰 자동으로 배치됩니다.
                    </S.EmptyDescription>
                </S.EmptyContent>
            ) : (
                <S.ResultContent>
                    <S.ScheduleDescription>
                        자동 알림을 통해
                        <br />
                        추천 휴식마다 편하게 알림을 받아보세요.
                    </S.ScheduleDescription>

                    <S.ScheduleList>
                        {upcomingSchedules.length > 0 ? (
                            upcomingSchedules.map(
                                (schedule) => (
                                    <S.ScheduleItem
                                        key={
                                            schedule.id
                                        }
                                    >
                                        <S.TimeArea>
                                            <S.Circle />

                                            <span>
                                                {formatTime(
                                                    schedule.notificationTime
                                                )}
                                            </span>
                                        </S.TimeArea>

                                        <S.AlarmArea>
                                            <span>
                                                자동 알림
                                            </span>

                                            <S.Toggle
                                                type="button"
                                                $active={
                                                    alarmStates?.[
                                                    schedule.id
                                                    ] ??
                                                    false
                                                }
                                                onClick={() =>
                                                    onToggleAlarm(
                                                        schedule.id
                                                    )
                                                }
                                            >
                                                <S.ToggleCircle
                                                    $active={
                                                        alarmStates?.[
                                                        schedule.id
                                                        ] ??
                                                        false
                                                    }
                                                />
                                            </S.Toggle>
                                        </S.AlarmArea>
                                    </S.ScheduleItem>
                                )
                            )
                        ) : (
                            <S.EmptyDescription>
                                오늘 생성된 추천 휴식 일정이 없어요.
                            </S.EmptyDescription>
                        )}
                    </S.ScheduleList>

                    <S.Caption>
                        ※ 알림 시간은 내 상황에 맞게 조정해 사용할 수 있어요.
                    </S.Caption>
                </S.ResultContent>
            )}
        </S.InfoCard>
    );
}

export default DigitalScheduleCard;
