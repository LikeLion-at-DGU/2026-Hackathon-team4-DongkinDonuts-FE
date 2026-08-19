import UsageTable from "./UsageTable";
import { useState } from "react";
import LockIcon from "../../assets/icons/LockIcon.svg";
import ClockIcon from "../../assets/icons/ClockIcon.svg";


import * as S from "./DigitalUsage.styled";

const days = ["일", "월", "화", "수", "목", "금", "토"];

const schedules = [
    { id: 1, time: "17:30" },
    { id: 2, time: "19:00" },
    { id: 3, time: "21:00" },
];

function DigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
    onEdit,
}) {
    const isResult = mode === "result";


    const [alarmStates, setAlarmStates] = useState({
        1: true,
        2: true,
        3: true,
    });

    const toggleAlarm = (id) => {
        setAlarmStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggleCell = (rowIndex, colIndex) => {
        if (isResult) return;

        const key = `${rowIndex}-${colIndex}`;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleRow = (rowIndex) => {
        if (isResult) return;

        const rowKeys = days.map(
            (_, colIndex) => `${rowIndex}-${colIndex}`
        );

        const isAllSelected = rowKeys.every(
            (key) => selected[key]
        );

        setSelected((prev) => {
            const next = { ...prev };

            rowKeys.forEach((key) => {
                next[key] = !isAllSelected;
            });

            return next;
        });
    };

    const resetAll = () => {
        if (isResult) return;

        setSelected({});
    };

    return (
        <S.Container>
            <S.UsageCard>
                <UsageTable
                    selected={selected}
                    toggleCell={toggleCell}
                    toggleRow={toggleRow}
                    resetAll={resetAll}
                    readOnly={isResult}
                />
            </S.UsageCard>

            <S.CardRow>
                <S.InfoCard>
                    <S.CardTitle>
                        <img
                            src={LockIcon}
                            alt=""
                            width="28"
                            height="34"
                        />
                        분석 결과
                    </S.CardTitle>

                    {!isResult ? (
                        <S.EmptyContent>
                            <S.EmptyIcon $circle>
                                <img
                                    src={LockIcon}
                                    alt=""
                                    width="34"
                                    height="42"
                                />
                            </S.EmptyIcon>

                            <S.EmptyTitle>
                                아직 분석된 PC 패턴이 없어요
                            </S.EmptyTitle>

                            <S.EmptyDescription>
                                상단 표에 사용 시간을 체크하고
                                <br />
                                이 패턴으로 AI 휴식 타이머 생성 버튼을 눌러
                                <br />
                                맞춤 분석을 받아보세요
                            </S.EmptyDescription>
                        </S.EmptyContent>
                    ) : (
                        <S.ResultContent>
                            <S.StatRow>
                                <S.StatBox>
                                    <strong>8</strong>
                                    <span>주간 사용(h)</span>
                                </S.StatBox>

                                <S.StatBox>
                                    <strong>2/7</strong>
                                    <span>활성 요일</span>
                                </S.StatBox>

                                <S.StatBox>
                                    <strong>29%</strong>
                                    <span>주간 활동률</span>
                                </S.StatBox>
                            </S.StatRow>

                            <S.AnalysisBox>
                                <p>
                                    <strong>
                                        평소 16:00 ~ 22:00에
                                    </strong>  PC를
                                    <br />
                                    가장 많이 사용하는 패턴이에요.
                                </p>

                                <p>
                                    특히 오후 시간대에 집중적인 사용이 예상돼요.
                                </p>
                            </S.AnalysisBox>

                            <S.Caption>
                                ※ 입력한 사용 패턴을 바탕으로 분석했어요.
                            </S.Caption>
                        </S.ResultContent>
                    )}
                </S.InfoCard>

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

                    {!isResult ? (
                        <S.EmptyContent>
                            <S.EmptyIcon>
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
                                {schedules.map((schedule) => (
                                    <S.ScheduleItem key={schedule.id}>
                                        <S.TimeArea>
                                            <S.Circle />
                                            <span>{schedule.time}</span>
                                        </S.TimeArea>

                                        <S.AlarmArea>
                                            <span>자동 알림</span>

                                            <S.Toggle
                                                type="button"
                                                $active={alarmStates[schedule.id]}
                                                onClick={() => toggleAlarm(schedule.id)}
                                            >
                                                <S.ToggleCircle
                                                    $active={alarmStates[schedule.id]}
                                                />
                                            </S.Toggle>
                                        </S.AlarmArea>
                                    </S.ScheduleItem>
                                ))}
                            </S.ScheduleList>

                            <S.Caption>
                                ※ 추천 시간은 예상입니다. 내 상황에 맞게 조정해 사용하세요.
                            </S.Caption>
                        </S.ResultContent>
                    )}
                </S.InfoCard>
            </S.CardRow>

            <S.ActionRow $isResult={isResult}>
                {!isResult ? (
                    <>
                        <S.SaveButton type="button">
                            임시 저장
                        </S.SaveButton>

                        <S.CreateButton
                            type="button"
                            onClick={onCreate}
                        >
                            이 패턴으로 휴식 타이머 생성
                        </S.CreateButton>
                    </>
                ) : (
                    <S.EditButton
                        type="button"
                        onClick={onEdit}
                    >
                        다시 수정
                    </S.EditButton>
                )}
            </S.ActionRow>
        </S.Container>
    );
}

export default DigitalUsage;