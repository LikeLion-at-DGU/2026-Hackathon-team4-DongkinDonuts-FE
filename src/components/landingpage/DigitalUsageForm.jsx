import * as S from "./DigitalUsageForm.styled";
import UsageTable from "./UsageTable";

const days = ["일", "월", "화", "수", "목", "금", "토"];

function DigitalUsageForm({
    selected,
    setSelected,
    onCreate,
}) {
    const toggleCell = (rowIndex, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleRow = (rowIndex) => {
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
                />
            </S.UsageCard>

            <S.CardRow>
                <S.InfoCard>
                    <S.CardTitle>
                        🔒 분석 결과
                    </S.CardTitle>

                    <S.EmptyContent>
                        <S.EmptyIcon>♙</S.EmptyIcon>

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
                </S.InfoCard>

                <S.InfoCard>
                    <S.CardTitle>
                        ◷ 오늘의 추천 휴식 일정
                    </S.CardTitle>

                    <S.AutoAlarm>
                        자동 알림
                        <S.DisabledToggle />
                    </S.AutoAlarm>

                    <S.EmptyContent>
                        <S.EmptyIcon>◷</S.EmptyIcon>

                        <S.EmptyTitle>
                            패턴을 저장하면 오늘의 휴식 일정이 자동 생성돼요
                        </S.EmptyTitle>

                        <S.EmptyDescription>
                            입력한 패턴에 따라
                            <br />
                            사용 패턴에 맞춰 자동으로 배치됩니다.
                        </S.EmptyDescription>
                    </S.EmptyContent>
                </S.InfoCard>
            </S.CardRow>

            <S.ActionRow>
                <S.SaveButton type="button">
                    임시 저장
                </S.SaveButton>

                <S.CreateButton
                    type="button"
                    onClick={onCreate}
                >
                    이 패턴으로 휴식 타이머 생성
                </S.CreateButton>
            </S.ActionRow>
        </S.Container>
    );
}

export default DigitalUsageForm;