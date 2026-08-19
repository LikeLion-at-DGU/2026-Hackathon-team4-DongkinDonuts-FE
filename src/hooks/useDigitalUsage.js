import { useState } from "react";

import {
    DAYS,
    INITIAL_ALARM_STATES,
} from "../config/digitalUsageConfig";

export const useDigitalUsage = ({
    mode,
    selected,
    setSelected,
}) => {
    const isResult = mode === "result";

    const [alarmStates, setAlarmStates] = useState(
        INITIAL_ALARM_STATES
    );

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

        const rowKeys = DAYS.map(
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

    return {
        isResult,

        alarmStates,

        toggleAlarm,
        toggleCell,
        toggleRow,
        resetAll,
    };
};