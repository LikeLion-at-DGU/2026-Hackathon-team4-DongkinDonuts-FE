import ClockIcon from "../../assets/icons/ClockIcon.svg";

import { useUpcomingSchedule } from "../../hooks/useUpcomingSchedule";

import * as S from "./DigitalUsage.styled";

// PC 사용 패턴 입력 여부와 무관하게 항상 "오늘 진행 예정"인 회복 일정을
// 스스로 조회해서 보여준다 — "내 계획 다시 설정"으로만 계획을 만든 경우도
// 포함해서, 언제 봐도 서버의 실제 최신 상태를 그대로 반영한다.
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

    const firstSchedule = schedules[0];

    const alarmActive = firstSchedule
        ? alarmStates?.[firstSchedule.id] ?? false
        : false;

    const hasSchedules = schedules.length > 0;

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

            {hasSchedules && firstSchedule && (
                <S.TopAlarmArea>
                    <span>자동 알림</span>

                    <S.Toggle
                        type="button"
                        $active={alarmActive}
                        onClick={() =>
                            toggleAlarm(
                                firstSchedule.id
                            )
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
                    <S.EmptyIcon $schedule>
                        <img
                            src={ClockIcon}
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
                    <S.EmptyIcon $schedule>
                        <img
                            src={ClockIcon}
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
