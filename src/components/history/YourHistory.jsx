import { useHistoryCalendar } from "../../hooks/useHistoryCalendar";
import { useHistoryData } from "../../hooks/useHistoryData";
import HistoryTable from "./HistoryTable";

import * as S from "./YourHistory.styled";

function YourHistory() {
    const {
        currentDate,
        calendarOpen,
        year,
        month,
        calendarDays,
        formattedDate,
        changeDate,
        changeCalendarMonth,
        selectDate,
        toggleCalendar,
        isActiveDate,
    } = useHistoryCalendar();

    const { rows: historyData, loading } = useHistoryData(currentDate);

    return (
        <S.Section>
            <S.Header>
                <S.Label>Your History</S.Label>
                <S.Title>
                    나의 사용 기록을 확인해보세요
                </S.Title>
            </S.Header>

            <S.TableTop>
                <S.DateSelectorWrapper>
                    <S.DateSelector>
                        <S.DateButton
                            type="button"
                            onClick={() => changeDate(-1)}
                        >
                            ‹
                        </S.DateButton>

                        <S.DateText
                            type="button"
                            onClick={toggleCalendar}
                        >
                            {formattedDate}
                        </S.DateText>

                        <S.DateButton
                            type="button"
                            onClick={() => changeDate(1)}
                        >
                            ›
                        </S.DateButton>
                    </S.DateSelector>

                    {calendarOpen && (
                        <S.Calendar>
                            <S.CalendarHeader>
                                <S.CalendarArrow
                                    type="button"
                                    onClick={() =>
                                        changeCalendarMonth(-1)
                                    }
                                >
                                    ‹
                                </S.CalendarArrow>

                                <S.CalendarTitle>
                                    {year}년 {month + 1}월
                                </S.CalendarTitle>

                                <S.CalendarArrow
                                    type="button"
                                    onClick={() =>
                                        changeCalendarMonth(1)
                                    }
                                >
                                    ›
                                </S.CalendarArrow>
                            </S.CalendarHeader>

                            <S.WeekRow>
                                <span>일</span>
                                <span>월</span>
                                <span>화</span>
                                <span>수</span>
                                <span>목</span>
                                <span>금</span>
                                <span>토</span>
                            </S.WeekRow>

                            <S.CalendarGrid>
                                {calendarDays.map((day, index) =>
                                    day ? (
                                        <S.CalendarDay
                                            key={index}
                                            type="button"
                                            $active={isActiveDate(day)}
                                            onClick={() =>
                                                selectDate(day)
                                            }
                                        >
                                            {day}
                                        </S.CalendarDay>
                                    ) : (
                                        <S.EmptyDay key={index} />
                                    )
                                )}
                            </S.CalendarGrid>
                        </S.Calendar>
                    )}
                </S.DateSelectorWrapper>
            </S.TableTop>

            <S.TableViewport>
                <HistoryTable
                    historyData={historyData}
                    loading={loading}
                />
            </S.TableViewport>
        </S.Section>
    );
}

export default YourHistory;