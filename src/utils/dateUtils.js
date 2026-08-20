const WEEKDAYS = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
];

export const formatDateParam = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export const formatHistoryDate = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const weekday = WEEKDAYS[date.getDay()];

    return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

export const createCalendarDays = (year, month) => {
    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const lastDate = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    for (let day = 1; day <= lastDate; day++) {
        days.push(day);
    }

    return days;
};