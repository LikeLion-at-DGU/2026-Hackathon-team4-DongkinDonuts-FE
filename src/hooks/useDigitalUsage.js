import { useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";

import {
    generateAIRecoveryPlan,
    updateRecoverySlotNotification,
} from "../api/plans";

// 프론트 표 순서: 일 월 화 수 목 금 토
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

    // 이전에 한 번이라도 결과를 생성했는지
    const [
        hasGeneratedResult,
        setHasGeneratedResult,
    ] = useState(false);

    // 분석 API를 다시 조회시키기 위한 버전
    const [
        resultVersion,
        setResultVersion,
    ] = useState(0);

    // 현재 표가 결과 모드인지
    const isResult =
        mode === "result";

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
    const toggleRow = (
        rowIndex
    ) => {
        if (isResult) return;

        setSelected((prev) => {
            const rowKeys =
                DAYS.map(
                    (_, colIndex) =>
                        `${rowIndex}-${colIndex}`
                );

            const isAllSelected =
                rowKeys.every(
                    (key) =>
                        !!prev[key]
                );

            const next = {
                ...prev,
            };

            rowKeys.forEach(
                (key) => {
                    next[key] =
                        !isAllSelected;
                }
            );

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
    const savePatterns =
        async () => {
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
    const handleCreate =
        async () => {
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

                // 3. AI 생성에 필요한
                // 오늘 상태/활동 데이터 보장
                await ensureTodayGenerationInputs();

                // 4. AI 회복 계획 생성
                const recoveryPlan =
                    await generateAIRecoveryPlan({
                        notificationEnabled:
                            true,
                    });

                console.log(
                    "AI 오늘 회복 계획:",
                    recoveryPlan
                );

                // 5. 새 추천 슬롯 저장
                const slots =
                    recoveryPlan?.slots ??
                    [];

                setSchedules(
                    slots
                );

                // 6. 새 슬롯의 알림 상태 반영
                const initialAlarmStates =
                    Object.fromEntries(
                        slots.map(
                            (slot) => [
                                slot.id,
                                slot.notification_enabled ??
                                    false,
                            ]
                        )
                    );

                setAlarmStates(
                    initialAlarmStates
                );

                // 7. 결과가 존재한다고 표시
                setHasGeneratedResult(
                    true
                );

                // 8. 분석 카드가
                // 새로운 패턴 분석을 다시 조회하도록 버전 증가
                setResultVersion(
                    (prev) =>
                        prev + 1
                );

                // 9. 결과 화면으로 전환
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
    const toggleAlarm =
        async (slotId) => {
            const current =
                alarmStates[
                    slotId
                ] ?? false;

            const next =
                !current;

            // UI 먼저 반영
            setAlarmStates(
                (prev) => ({
                    ...prev,
                    [slotId]:
                        next,
                })
            );

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

                // 실패 시 롤백
                setAlarmStates(
                    (prev) => ({
                        ...prev,
                        [slotId]:
                            current,
                    })
                );
            }
        };

    return {
        isResult,
        isSaving,

        // 추가
        hasGeneratedResult,
        resultVersion,

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