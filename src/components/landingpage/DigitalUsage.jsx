import UsageTable from "./UsageTable";
import { useState } from "react";

import * as S from "./DigitalUsage.styled";

const days = ["일", "월", "화", "수", "목", "금", "토"];

const schedules = [
    { id: 1, time: "17:30" },
    { id: 2, time: "19:00" },
    { id: 3, time: "21:00" },
];

function LockIcon({ small = false }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={small ? "28" : "34"}
            height={small ? "34" : "42"}
            viewBox="0 0 28 34"
            fill="none"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.5955 0C11.432 0 9.35721 0.859427 7.82742 2.38922C6.29763 3.91901 5.4382 5.99385 5.4382 8.1573V10.9463C4.60072 11.0162 3.86423 11.1638 3.18212 11.5119C2.08527 12.0699 1.19325 12.9608 0.633939 14.057C0.282786 14.7484 0.136732 15.4942 0.0668121 16.3426C-2.89412e-08 17.1676 0 18.1869 0 19.4501V24.8324C0 26.0956 -2.89412e-08 27.1149 0.0668121 27.9399C0.136732 28.7883 0.28434 29.5341 0.635492 30.224C1.19387 31.321 2.08538 32.2131 3.18212 32.7721C3.872 33.1233 4.61781 33.2693 5.46617 33.3393C6.29122 33.4061 7.31049 33.4061 8.57371 33.4061H18.6173C19.8805 33.4061 20.8998 33.4061 21.7248 33.3393C22.5732 33.2693 23.319 33.1217 24.0089 32.7706C25.106 32.2122 25.998 31.3207 26.5571 30.224C26.9082 29.5341 27.0543 28.7883 27.1242 27.9399C27.191 27.1149 27.191 26.0956 27.191 24.8324V19.4501C27.191 18.1869 27.191 17.1676 27.1242 16.3426C27.0543 15.4942 26.9067 14.7484 26.5555 14.0585C25.9971 12.9614 25.1056 12.0694 24.0089 11.5103C23.3268 11.1638 22.5903 11.0162 21.7528 10.9463V8.1573C21.7528 3.65136 18.1014 0 13.5955 0ZM19.4221 10.8764V8.1573C19.4221 6.61198 18.8083 5.12995 17.7156 4.03724C16.6228 2.94453 15.1408 2.33066 13.5955 2.33066C12.0502 2.33066 10.5681 2.94453 9.47544 4.03724C8.38273 5.12995 7.76886 6.61198 7.76886 8.1573V10.8764H19.4221Z"
                fill="none"
                stroke="#9E9E9E"
                strokeWidth="2"
            />
        </svg>
    );
}

function ClockIcon({ large = false }) {
    const size = large ? 53 : 38;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 38 38"
            fill="none"
        >
            <path
                d="M19 11.0833V19L23.75 23.75M33.25 19C33.25 20.8713 32.8814 22.7243 32.1653 24.4532C31.4492 26.1821 30.3995 27.753 29.0763 29.0763C27.753 30.3995 26.1821 31.4492 24.4532 32.1653C22.7243 32.8814 20.8713 33.25 19 33.25C17.1287 33.25 15.2757 32.8814 13.5468 32.1653C11.8179 31.4492 10.247 30.3995 8.92373 29.0763C7.60049 27.753 6.55085 26.1821 5.83472 24.4532C5.11859 22.7243 4.75 20.8713 4.75 19C4.75 15.2207 6.25133 11.5961 8.92373 8.92373C11.5961 6.25134 15.2207 4.75 19 4.75C22.7793 4.75 26.4039 6.25134 29.0763 8.92373C31.7487 11.5961 33.25 15.2207 33.25 19Z"
                stroke="#9E9E9E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

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
                        <LockIcon small />
                        분석 결과
                    </S.CardTitle>

                    {!isResult ? (
                        <S.EmptyContent>
                            <S.EmptyIcon $circle>
                                <LockIcon />
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
                        <ClockIcon />
                        오늘의 추천 휴식 일정
                    </S.CardTitle>

                    {!isResult ? (
                        <S.EmptyContent>
                            <S.EmptyIcon>
                                <ClockIcon large />
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