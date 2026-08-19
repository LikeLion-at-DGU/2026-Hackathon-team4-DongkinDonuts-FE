import { useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";
import { generateTodayRecoveryPlan } from "../api/plans";

const FRONT_TO_BACK_DAY = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
];

export function useDigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [alarmStates, setAlarmStates] = useState({});

    // AI가 생성한 오늘의 회복 슬롯
    const [schedules, setSchedules] = useState([]);

    const isResult = mode === "result";

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

        setSelected((prev) => {
            const rowKeys = DAYS.map(
                (_, colIndex) =>
                    `${rowIndex}-${colIndex}`
            );

            const isAllSelected = rowKeys.every(
                (key) => !!prev[key]
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

    const toggleAlarm = (id) => {
        setAlarmStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const convertSelectedToPatterns = (selected) => {
        return Object.entries(selected)
            .filter(([, isSelected]) => isSelected)
            .map(([key]) => {
                const [rowIndex, colIndex] = key
                    .split("-")
                    .map(Number);

                return {
                    day_of_week:
                        FRONT_TO_BACK_DAY[colIndex],
                    hour: rowIndex,
                    is_used: true,
                };
            });
    };

    const savePatterns = async () => {
        try {
            setIsSaving(true);

            const patterns =
                convertSelectedToPatterns(selected);

            console.log(
                "변환 후 서버로 보내는 데이터:",
                patterns
            );

            const result =
                await saveDigitalPatterns(patterns);

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
        try {
            setIsSaving(true);

            // 1. PC 패턴 저장
            const patterns =
                convertSelectedToPatterns(selected);

            await saveDigitalPatterns(patterns);

            // 2. 저장된 PC 패턴 기준으로 AI 회복 계획 생성
            const recoveryPlan =
                await generateTodayRecoveryPlan({
                    notificationEnabled: true,
                });

            console.log(
                "AI 오늘 회복 계획:",
                recoveryPlan
            );

            const slots =
                recoveryPlan?.slots ?? [];

            setSchedules(slots);

            // 각 슬롯의 서버 알림 상태를 초기값으로 사용
            const initialAlarmStates =
                Object.fromEntries(
                    slots.map((slot) => [
                        slot.id,
                        slot.notification_enabled,
                    ])
                );

            setAlarmStates(initialAlarmStates);

            // 3. 결과 화면 전환
            onCreate();
        } catch (error) {
            console.error(
                "휴식 타이머 생성 실패:",
                error
            );
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isResult,
        isSaving,

        schedules,
        alarmStates,

        toggleCell,
        toggleRow,
        resetAll,
        toggleAlarm,

        handleTemporarySave,
        handleCreate,
    };
}