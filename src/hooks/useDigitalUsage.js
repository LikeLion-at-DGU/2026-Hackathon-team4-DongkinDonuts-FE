import { useCallback, useEffect, useRef, useState } from "react";

import { DAYS } from "../config/usageTableConfig";
import { saveDigitalPatterns } from "../api/digitalState";
import { ensureTodayGenerationInputs } from "../api/context";

import {
    generateRecoveryPlan,
    getTodayRecoverySlots,
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
    onEdit,
}) {
    const [isSaving, setIsSaving] =
        useState(false);

    const [schedules, setSchedules] =
        useState([]);

    const [alarmStates, setAlarmStates] =
        useState({});
    const hasLoadedExistingSchedulesRef =
        useRef(false);

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
    const showResult =
        isResult || hasGeneratedResult;

    const enterEditModeIfNeeded = () => {
        if (isResult) {
            onEdit?.();
        }
    };

    const applySchedules = useCallback((slots) => {
        const safeSlots =
            Array.isArray(slots) ? slots : [];

        setSchedules(safeSlots);
        setAlarmStates(
            Object.fromEntries(
                safeSlots.map((slot) => [
                    slot.id,
                    slot.notification_enabled ??
                        false,
                ])
            )
        );
    }, []);

    useEffect(() => {
        if (
            !showResult ||
            hasGeneratedResult ||
            schedules.length > 0 ||
            hasLoadedExistingSchedulesRef.current
        ) {
            return;
        }

        hasLoadedExistingSchedulesRef.current = true;

        getTodayRecoverySlots()
            .then((slots) => {
                applySchedules(slots);
                setResultVersion((prev) => prev + 1);
            })
            .catch((error) => {
                console.error(
                    "오늘 추천 휴식 일정 조회 실패:",
                    error
                );
            });
    }, [
        hasGeneratedResult,
        schedules.length,
        showResult,
        applySchedules,
    ]);

    // 개별 칸 선택
    const toggleCell = (
        rowIndex,
        colIndex
    ) => {
        enterEditModeIfNeeded();

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
        enterEditModeIfNeeded();

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
        enterEditModeIfNeeded();

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

    // PC 패턴 저장 → 회복 계획 생성
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

                // 3. 계획 생성에 필요한
                // 오늘 상태/활동 데이터 보장
                await ensureTodayGenerationInputs();

                // 4. 회복 계획 생성
                const recoveryPlan =
                    await generateRecoveryPlan({
                        notificationEnabled:
                            true,
                    });

                console.log(
                    "오늘 회복 계획:",
                    recoveryPlan
                );

                // 5. 새 추천 슬롯 저장
                applySchedules(
                    recoveryPlan?.slots
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
        showResult,
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
