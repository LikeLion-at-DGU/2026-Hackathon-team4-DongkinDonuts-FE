import { useState } from "react";
import { saveDigitalPatterns } from "../api/digitalState";

export function useDigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
}) {
    const [isSaving, setIsSaving] = useState(false);

    const isResult = mode === "result";

    const [alarmStates, setAlarmStates] = useState({
        first: true,
        second: true,
        third: true,
    });

    const toggleAlarm = (key) => {
        setAlarmStates((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleCell = (key) => {
        if (isResult) return;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleRow = (rowKeys) => {
        if (isResult) return;

        setSelected((prev) => {
            const isAllSelected = rowKeys.every(
                (key) => prev[key]
            );

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

    const savePatterns = async () => {
        try {
            setIsSaving(true);

            const result = await saveDigitalPatterns(
                selected
            );

            console.log(
                "PC 사용 패턴 저장 성공:",
                result
            );

            return true;
        } catch (error) {
            console.error(
                "PC 사용 패턴 저장 실패:",
                error
            );

            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleTemporarySave = async () => {
        await savePatterns();
    };

    const handleCreate = async () => {
        const success = await savePatterns();

        if (!success) return;

        onCreate();
    };

    return {
        isResult,
        isSaving,
        alarmStates,
        toggleAlarm,
        toggleCell,
        toggleRow,
        resetAll,
        handleTemporarySave,
        handleCreate,
    };
}