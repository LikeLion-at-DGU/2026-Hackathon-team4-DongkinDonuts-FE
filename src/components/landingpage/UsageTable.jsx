import * as S from "./UsageTable.styled";

const days = ["일", "월", "화", "수", "목", "금", "토"];

const timeSlots = [
    "00:00 ~ 01:00",
    "01:00 ~ 02:00",
    "02:00 ~ 03:00",
    "03:00 ~ 04:00",
    "04:00 ~ 05:00",
    "05:00 ~ 06:00",
    "06:00 ~ 07:00",
    "07:00 ~ 08:00",
    "08:00 ~ 09:00",
    "09:00 ~ 10:00",
    "10:00 ~ 11:00",
    "11:00 ~ 12:00",
    "12:00 ~ 13:00",
    "13:00 ~ 14:00",
    "14:00 ~ 15:00",
    "15:00 ~ 16:00",
    "16:00 ~ 17:00",
    "17:00 ~ 18:00",
    "18:00 ~ 19:00",
    "19:00 ~ 20:00",
    "20:00 ~ 21:00",
    "21:00 ~ 22:00",
    "22:00 ~ 23:00",
    "23:00 ~ 24:00",
];

function UsageTable({
    selected,
    toggleCell,
    toggleRow,
    resetAll,
    readOnly = false,
}) {
    const selectedCount = Object.values(selected).filter(Boolean).length;

    return (
        <>
            <S.TopArea>
                <div>
                    <S.Title>언제 PC를 주로 사용하시나요?</S.Title>

                    <S.Description>
                        {readOnly
                            ? "입력한 PC 사용 패턴을 바탕으로 분석을 완료했어요."
                            : "요일별 사용 시간대를 선택하세요. 칸을 클릭해 켜고 끌 수 있어요."}
                    </S.Description>
                </div>

                <S.CheckGuide>
                    <S.GuideItem>
                        <S.GuideBox />
                        <span>미사용</span>
                    </S.GuideItem>

                    <S.GuideItem>
                        <S.GuideBox $checked>✓</S.GuideBox>
                        <span>사용</span>
                    </S.GuideItem>
                </S.CheckGuide>
            </S.TopArea>

            <S.TableScroll>
                <S.Table>
                    <thead>
                        <tr>
                            <th>시간대</th>

                            {days.map((day) => (
                                <th
                                    key={day}
                                    className={
                                        day === "일" || day === "토"
                                            ? "weekend"
                                            : ""
                                    }
                                >
                                    {day}
                                </th>
                            ))}

                            <th>전체 선택</th>
                        </tr>
                    </thead>

                    <tbody>
                        {timeSlots.map((time, rowIndex) => {
                            const isRowSelected = days.every(
                                (_, colIndex) =>
                                    selected[`${rowIndex}-${colIndex}`]
                            );

                            return (
                                <tr key={time}>
                                    <td>{time}</td>

                                    {days.map((day, colIndex) => {
                                        const key = `${rowIndex}-${colIndex}`;

                                        return (
                                            <td key={day}>
                                                <S.Checkbox
                                                    type="checkbox"
                                                    checked={!!selected[key]}
                                                    disabled={readOnly}
                                                    onChange={() =>
                                                        !readOnly &&
                                                        toggleCell(
                                                            rowIndex,
                                                            colIndex
                                                        )
                                                    }
                                                />
                                            </td>
                                        );
                                    })}

                                    <td>
                                        {!readOnly && (
                                            <S.RowButton
                                                type="button"
                                                $selected={isRowSelected}
                                                onClick={() =>
                                                    toggleRow(rowIndex)
                                                }
                                            >
                                                {isRowSelected
                                                    ? "취소"
                                                    : "선택"}
                                            </S.RowButton>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </S.Table>
            </S.TableScroll>

            <S.TableFooter>
                <S.SelectedText>
                    선택한 시간 {selectedCount}칸 · 주간 {selectedCount}시간
                </S.SelectedText>

                <S.ScrollGuide>
                    스크롤을 내려 더 많은 시간대를 확인하세요⌄
                </S.ScrollGuide>

                {!readOnly && (
                    <S.ResetButton
                        type="button"
                        onClick={resetAll}
                    >
                        전체 초기화
                    </S.ResetButton>
                )}
            </S.TableFooter>
        </>
    );
}

export default UsageTable;