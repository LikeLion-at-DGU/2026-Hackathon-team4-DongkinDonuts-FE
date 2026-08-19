import { useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";

export function useDigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
}) {
    const [isSaving, setIsSaving] = useState(false);

    const [alarmStates, setAlarmStates] = useState({});

    const isResult = mode === "result";

    // 개별 칸 선택
    const toggleCell = (rowIndex, colIndex) => {
        if (isResult) return;

        const key = `${rowIndex}-${colIndex}`;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // 한 시간대의 일~토 전체 선택/취소
    const toggleRow = (rowIndex) => {
        if (isResult) return;

        setSelected((prev) => {
            const rowKeys = DAYS.map(
                (_, colIndex) =>
                    `${rowIndex}-${colIndex}`
            );

            const isAllSelected = rowKeys.every(
                (key) => !!prev[key]
            );

            const next = {
                ...prev,
            };

            rowKeys.forEach((key) => {
                next[key] = !isAllSelected;
            });

            return next;
        });
    };

    // 전체 초기화
    const resetAll = () => {
        if (isResult) return;

        setSelected({});
    };

    // 알람 ON/OFF
    const toggleAlarm = (id) => {
        setAlarmStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // 서버 저장
    const savePatterns = async () => {
        try {
            setIsSaving(true);

            const result =
                await saveDigitalPatterns(selected);

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

    // 임시 저장
    const handleTemporarySave = async () => {
        await savePatterns();
    };

    // 저장 후 결과 화면
    const handleCreate = async () => {
        const success = await savePatterns();

        if (!success) return;

        onCreate();
    };

    return {
        isResult,
        isSaving,

        alarmStates,

        toggleCell,
        toggleRow,
        resetAll,
        toggleAlarm,

        handleTemporarySave,
        handleCreate,
    };
}