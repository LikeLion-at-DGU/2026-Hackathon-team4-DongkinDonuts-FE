export const DAYS = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
];

export const TIME_SLOTS = Array.from(
    { length: 24 },
    (_, hour) => {
        const start = String(hour).padStart(2, "0");
        const end = String(hour + 1).padStart(2, "0");

        return `${start}:00 ~ ${end}:00`;
    }
);