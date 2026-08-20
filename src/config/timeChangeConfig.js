export const RECOMMENDED_TIMES = [
    "15:00",
    "16:00",
    "17:00",
    "18:00",
];

export const ITEM_HEIGHT = 31;

export const HOURS = Array.from(
    { length: 24 },
    (_, index) => String(index).padStart(2, "0")
);

export const MINUTES = Array.from(
    { length: 60 },
    (_, index) => String(index).padStart(2, "0")
);

export const AI_RECOMMENDED_TIMES = [
    "16:00",
    "18:00",
];