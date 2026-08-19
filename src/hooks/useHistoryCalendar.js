import { useState } from "react";

import {
    createCalendarDays,
    formatHistoryDate,
} from "../utils/dateUtils";

export const useHistoryCalendar = () => {
    // 목업 시절엔 고정 날짜(2026-08-20)였는데, 실제 데이터를 붙이면서 오늘 날짜로 되돌림.
    const initialDate = new Date();

    const [currentDate, setCurrentDate] = useState(initialDate);
    const [calendarDate, setCalendarDate] = useState(initialDate);
    const [calendarOpen, setCalendarOpen] = useState(false);

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const calendarDays = createCalendarDays(
        year,
        month
    );

    const formattedDate =
        formatHistoryDate(currentDate);

    const changeDate = (amount) => {
        const nextDate = new Date(currentDate);

        nextDate.setDate(
            nextDate.getDate() + amount
        );

        setCurrentDate(nextDate);
        setCalendarDate(nextDate);
    };

    const changeCalendarMonth = (amount) => {
        const nextDate = new Date(calendarDate);

        nextDate.setMonth(
            nextDate.getMonth() + amount
        );

        setCalendarDate(nextDate);
    };

    const selectDate = (day) => {
        const selectedDate = new Date(
            year,
            month,
            day
        );

        setCurrentDate(selectedDate);
        setCalendarDate(selectedDate);
        setCalendarOpen(false);
    };

    const toggleCalendar = () => {
        setCalendarOpen((prev) => !prev);
    };

    const isActiveDate = (day) => {
        return (
            day === currentDate.getDate() &&
            month === currentDate.getMonth() &&
            year === currentDate.getFullYear()
        );
    };

    return {
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
    };
};