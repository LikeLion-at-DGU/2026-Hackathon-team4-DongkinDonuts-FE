import { useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";

import {
    generateAIRecoveryPlan,
    updateRecoverySlotNotification,
} from "../api/plans";

// 프론트 표 순서: 일 월 화 수 목 금 토
// 백엔드 요일 코드로 변환
const DAY_CODE_MAP = [
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
    const [isSaving, setIsSaving] =
        useState(false);

    const [schedules, setSchedules] =
        useState([]);

    const [alarmStates, setAlarmStates] =
        useState({});

    const isResult = mode === "result";

    // 개별 칸 선택
    const toggleCell = (
        rowIndex,
        colIndex
    ) => {
        if (isResult) return;

        const key =
            `${rowIndex}-${colIndex}`;

        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // 해당 시간대 일~토 전체 선택
    const toggleRow = (rowIndex) => {
        if (isResult) return;

        setSelected((prev) => {
            const rowKeys = DAYS.map(
                (_, colIndex) =>
                    `${rowIndex}-${colIndex}`
            );

            const isAllSelected =
                rowKeys.every(
                    (key) => !!prev[key]
                );

            const next = {
                ...prev,
            };

            rowKeys.forEach((key) => {
                next[key] =
                    !isAllSelected;
            });

            return next;
        });
    };

    // 전체 초기화
    const resetAll = () => {
        if (isResult) return;

        setSelected({});
    };

    // selected 객체 → 백엔드 요청 배열
    const convertSelectedToPatterns = (
        selectedData
    ) => {
        return Object.entries(
            selectedData
        )
            .filter(
                ([, isSelected]) =>
                    isSelected
            )
            .map(([key]) => {
                const [
                    rowIndex,
                    colIndex,
                ] = key
                    .split("-")
                    .map(Number);

                return {
                    day_of_week:
                        DAY_CODE_MAP[
                        colIndex
                        ],
                    hour: rowIndex,
                    is_used: true,
                };
            });
    };

    // PC 패턴 저장
    const savePatterns = async () => {
        try {
            setIsSaving(true);

            const patterns =
                convertSelectedToPatterns(
                    selected
                );

            console.log(
                "변환 후 서버로 보내는 데이터:",
                patterns
            );

            const result =
                await saveDigitalPatterns(
                    patterns
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

    // 임시 저장
    const handleTemporarySave =
        async () => {
            await savePatterns();
        };

    // PC 패턴 저장 → AI 회복 계획 생성
    const handleCreate = async () => {
        try {
            setIsSaving(true);

            // 1. 선택한 PC 패턴 변환
            const patterns =
                convertSelectedToPatterns(
                    selected
                );

            // 2. PC 패턴 서버 저장
            await saveDigitalPatterns(
                patterns
            );

            console.log(
                "PC 패턴 저장 완료"
            );

            // 3. AI 생성은 오늘의 상태 스냅샷 + 이후 활동 계획이 둘 다 있어야
            // 성공한다. 이 화면(My Digital State)은 SetupModal 온보딩을 거치지
            // 않고도 들어올 수 있는 진입점이라, 둘 중 없는 게 있으면 여기서
            // 미리 중립값으로 채워둔다(안 그러면 매번 "오늘의 상태 스냅샷이
            // 필요합니다" 등으로 실패함).
            await ensureTodayGenerationInputs();

            // 4. AI 회복 계획 생성
            // plans.js의 함수는 boolean을 직접 받음
            const recoveryPlan =
                await generateAIRecoveryPlan({
                    notificationEnabled: true,
                });

            console.log(
                "AI 오늘 회복 계획:",
                recoveryPlan
            );

            // 5. AI가 만든 슬롯 저장
            const slots =
                recoveryPlan?.slots ??
                [];

            setSchedules(slots);

            // 6. 서버에서 내려준 알림 상태 저장
            const initialAlarmStates =
                Object.fromEntries(
                    slots.map((slot) => [
                        slot.id,
                        slot.notification_enabled ??
                        false,
                    ])
                );

            setAlarmStates(
                initialAlarmStates
            );

            // 7. 결과 화면으로 전환
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

    // 자동 알림 ON/OFF
    const toggleAlarm = async (
        slotId
    ) => {
        const current =
            alarmStates[slotId] ??
            false;

        const next = !current;

        // 일단 화면 먼저 변경
        setAlarmStates((prev) => ({
            ...prev,
            [slotId]: next,
        }));

        try {
            const slot =
                schedules.find(
                    (item) =>
                        item.id ===
                        slotId
                );

            await updateRecoverySlotNotification(
                slotId,
                {
                    notificationEnabled:
                        next,

                    repeatRule:
                        slot?.repeat_rule ??
                        "",
                }
            );

            console.log(
                "알림 설정 변경 성공:",
                slotId,
                next
            );
        } catch (error) {
            console.error(
                "알림 설정 변경 실패:",
                error
            );

            // API 실패하면 화면도 원래 상태로 복구
            setAlarmStates((prev) => ({
                ...prev,
                [slotId]: current,
            }));
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