import { useHistoryCalendar } from "../../hooks/useHistoryCalendar";
import { useHistoryData } from "../../hooks/useHistoryData";

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

            <S.Table>
                <S.TableHead>
                    <tr>
                        <S.TimeHeader>시간</S.TimeHeader>
                        <S.ActivityHeader>
                            상황 / 업무내용
                        </S.ActivityHeader>
                        <S.RoutineHeader>
                            추천 루틴
                        </S.RoutineHeader>
                        <S.StatusHeader>
                            상태
                        </S.StatusHeader>
                    </tr>
                </S.TableHead>

                <tbody>
                    {loading ? (
                        <tr>
                            <S.ActivityCell colSpan={4}>
                                불러오는 중...
                            </S.ActivityCell>
                        </tr>
                    ) : historyData.length === 0 ? (
                        <tr>
                            <S.ActivityCell colSpan={4}>
                                이 날짜엔 기록이 없어요
                            </S.ActivityCell>
                        </tr>
                    ) : (
                        historyData.map((history) => (
                            <S.TableRow key={history.id}>
                                <S.TimeCell>
                                    {history.time}
                                </S.TimeCell>

                                <S.ActivityCell>
                                    {history.activity}
                                </S.ActivityCell>

                                <S.RoutineCell>
                                    {history.routine ? (
                                        <S.RoutineBadge>
                                            {history.routine}
                                        </S.RoutineBadge>
                                    ) : (
                                        "-"
                                    )}
                                </S.RoutineCell>

                                <S.StatusCell>
                                    <S.StatusBadge
                                        $status={history.status}
                                    >
                                        {history.status}
                                    </S.StatusBadge>
                                </S.StatusCell>
                            </S.TableRow>
                        ))
                    )}
                </tbody>
            </S.Table>
        </S.Section>
    );
}

export default YourHistory;