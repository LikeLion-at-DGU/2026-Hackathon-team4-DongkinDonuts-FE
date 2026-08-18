import UsageTable from "./UsageTable";
import * as FormS from "./DigitalUsageForm.styled";
import * as S from "./DigitalAnalysis.styled";

const schedules = [
    { id: 1, time: "17:30" },
    { id: 2, time: "19:00" },
    { id: 3, time: "21:00" },
];

function DigitalAnalysis({ selected, onEdit }) {
    return (
        <S.Container>
            <FormS.UsageCard>
                <UsageTable
                    selected={selected}
                    readOnly
                />
            </FormS.UsageCard>

            <S.CardRow>
                <S.ResultCard>
                    <S.CardTitle>
                        🔒 분석 결과
                    </S.CardTitle>

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
                            </strong>
                            PC를
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
                </S.ResultCard>

                <S.ResultCard>
                    <S.CardTitle>
                        ◷ 오늘의 추천 휴식 일정
                    </S.CardTitle>

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

                                    <S.Toggle>
                                        <S.ToggleCircle />
                                    </S.Toggle>
                                </S.AlarmArea>
                            </S.ScheduleItem>
                        ))}
                    </S.ScheduleList>

                    <S.Caption>
                        ※ 추천 시간은 예상입니다. 내 상황에 맞게 조정해 사용하세요.
                    </S.Caption>
                </S.ResultCard>
            </S.CardRow>

            <S.ActionRow>
                <S.EditButton
                    type="button"
                    onClick={onEdit}
                >
                    다시 수정
                </S.EditButton>
            </S.ActionRow>
        </S.Container>
    );
}

export default DigitalAnalysis;