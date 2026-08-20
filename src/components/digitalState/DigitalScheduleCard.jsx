import ClockIcon from "../../assets/icons/ClockIcon.svg";

import {
    useUpcomingSchedule,
    notifyUpcomingScheduleChanged,
} from "../../hooks/useUpcomingSchedule";

import * as S from "./DigitalUsage.styled";

function DigitalScheduleCard() {
    const {
        schedules,
        alarmStates,
        loading,
        toggleAlarm,
    } = useUpcomingSchedule();

    const formatTime = (dateTime) => {
        if (!dateTime) {
            return "--:--";
        }

        const date =
            new Date(dateTime);

        return date.toLocaleTimeString(
            "ko-KR",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }
        );
    };

    const hasSchedules =
        schedules.length > 0;

    /*
     * 모든 추천 일정이 ON일 때
     * 상단 토글도 ON
     */
    const alarmActive =
        hasSchedules &&
        schedules.every(
            (schedule) =>
                alarmStates?.[
                    schedule.id
                ] === true
        );

    /*
     * 상단 토글 하나로
     * 오늘 추천 일정 전체 ON/OFF
     */
    const handleToggleAllAlarms =
        async () => {
            const next =
                !alarmActive;

            try {
                /*
                 * OFF로 바꿀 때:
                 * 현재 ON인 일정만 toggle
                 *
                 * ON으로 바꿀 때:
                 * 현재 OFF인 일정만 toggle
                 */
                const targets =
                    schedules.filter(
                        (schedule) =>
                            Boolean(
                                alarmStates?.[
                                    schedule.id
                                ]
                            ) !== next
                    );

                await Promise.all(
                    targets.map(
                        (schedule) =>
                            toggleAlarm(
                                schedule.id
                            )
                    )
                );

                /*
                 * LandingPage에서 쓰고 있는
                 * useUpcomingSchedule도
                 * 최신 상태 다시 조회하도록 알림
                 */
                notifyUpcomingScheduleChanged();
            } catch (error) {
                console.error(
                    "전체 자동 알림 변경 실패:",
                    error
                );
            }
        };

    return (
        <S.InfoCard $schedule>
            <S.CardTitle>
                <img
                    src={ClockIcon}
                    alt=""
                    width="38"
                    height="38"
                />

                오늘의 추천 휴식 일정
            </S.CardTitle>

            {hasSchedules && (
                <S.TopAlarmArea>
                    <span>
                        자동 알림
                    </span>

                    <S.Toggle
                        type="button"
                        $active={
                            alarmActive
                        }
                        onClick={
                            handleToggleAllAlarms
                        }
                    >
                        <S.ToggleCircle
                            $active={
                                alarmActive
                            }
                        />
                    </S.Toggle>
                </S.TopAlarmArea>
            )}

            {loading ? (
                <S.EmptyContent>
                    <S.EmptyIcon
                        $schedule
                    >
                        <img
                            src={
                                ClockIcon
                            }
                            alt=""
                            width="53"
                            height="53"
                        />
                    </S.EmptyIcon>

                    <S.EmptyTitle>
                        오늘의 휴식 일정을 불러오고 있어요
                    </S.EmptyTitle>
                </S.EmptyContent>
            ) : !hasSchedules ? (
                <S.EmptyContent>
                    <S.EmptyIcon
                        $schedule
                    >
                        <img
                            src={
                                ClockIcon
                            }
                            alt=""
                            width="53"
                            height="53"
                        />
                    </S.EmptyIcon>

                    <S.EmptyTitle>
                        아직 오늘 예정된 휴식 일정이 없어요
                    </S.EmptyTitle>

                    <S.EmptyDescription>
                        "내 계획 다시 설정" 또는 PC 사용 패턴을 저장하면
                        <br />
                        오늘의 휴식 일정이 자동 생성돼요.
                    </S.EmptyDescription>
                </S.EmptyContent>
            ) : (
                <S.ResultContent>
                    <S.ScheduleDescription>
                        개인 사용 데이터를 분석해 설정된
                        <br />
                        필수 휴식 시간이에요.
                    </S.ScheduleDescription>

                    <S.ScheduleList>
                        {schedules.map(
                            (
                                schedule
                            ) => (
                                <S.ScheduleItem
                                    key={
                                        schedule.id
                                    }
                                >
                                    <S.TimeArea>
                                        <S.Circle />

                                        <span>
                                            {formatTime(
                                                schedule.effective_time
                                            )}
                                        </span>
                                    </S.TimeArea>
                                </S.ScheduleItem>
                            )
                        )}
                    </S.ScheduleList>

                    <S.Caption>
                        ※ 추천 시간은 예상입니다. 내 상황에 맞게 조정해 사용하세요.
                    </S.Caption>
                </S.ResultContent>
            )}
        </S.InfoCard>
    );
}

export default DigitalScheduleCard;