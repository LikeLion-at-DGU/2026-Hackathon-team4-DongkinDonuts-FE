import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getNextRecoverySlot,
    getTodayRecoverySlots,
} from "../api/plans";

import {
    arePreviousStagesComplete,
    buildRecoveryRoutinePath,
    findRunnableRoutineForStage,
    isStageComplete,
    selectHomeRoutineSlot,
} from "../config/recoveryRouting";

export function useRoutineHome({
    navigate,
}) {
    const [
        routineSlot,
        setRoutineSlot,
    ] = useState(null);

    const [
        loadingRoutineSlot,
        setLoadingRoutineSlot,
    ] = useState(false);

    const [
        showRoutineModal,
        setShowRoutineModal,
    ] = useState(false);

    const [
        routineModalContent,
        setRoutineModalContent,
    ] = useState(null);

    const loadRoutineSlot =
        useCallback(async () => {
            setLoadingRoutineSlot(true);

            try {
                const slots =
                    await getTodayRecoverySlots();

                const normalizedSlots =
                    Array.isArray(slots)
                        ? slots
                        : [];

                const slot =
                    selectHomeRoutineSlot(
                        normalizedSlots
                    );

                setRoutineSlot(slot);

                return slot;
            } catch {
                try {
                    const slot =
                        await getNextRecoverySlot();

                    setRoutineSlot(slot);

                    return slot;
                } catch (fallbackError) {
                    console.error(
                        "오늘 회복 루틴 조회 실패:",
                        fallbackError
                    );

                    setRoutineSlot(null);

                    return null;
                }
            } finally {
                setLoadingRoutineSlot(
                    false
                );
            }
        }, []);

    useEffect(() => {
        loadRoutineSlot();
    }, [loadRoutineSlot]);

    useEffect(() => {
        const refreshRoutineSlot =
            () => {
                if (
                    document.visibilityState ===
                    "visible"
                ) {
                    loadRoutineSlot();
                }
            };

        window.addEventListener(
            "focus",
            loadRoutineSlot
        );

        document.addEventListener(
            "visibilitychange",
            refreshRoutineSlot
        );

        return () => {
            window.removeEventListener(
                "focus",
                loadRoutineSlot
            );

            document.removeEventListener(
                "visibilitychange",
                refreshRoutineSlot
            );
        };
    }, [loadRoutineSlot]);

    const openRoutineModal = (
        content = null
    ) => {
        setRoutineModalContent(content);
        setShowRoutineModal(true);
    };

    const closeRoutineModal = () => {
        setShowRoutineModal(false);
        setRoutineModalContent(null);
    };

    const handleRoutineStart = (routine) => {
        // AI 계획 없음 = 자율 진행 모드
        if (!routineSlot) {
            // 첫 번째 카드만 바로 진입 가능
            if (routine.id === 1) {
                navigate("/recovery-session", {
                    state: {
                        autonomous: true,
                        stageType:
                            routine.stageType,
                    },
                });

                return;
            }

            // 2, 3번째는 이전 세션 완료 필요
            openRoutineModal({
                title:
                    "이전 휴식 세션을 먼저 완료해주세요",
                description:
                    "이전 루틴을 완료한 후 이용해주세요",
            });

            return;
        }

        // 이미 완료한 단계
        if (
            isStageComplete(
                routineSlot,
                routine.stageType
            )
        ) {
            openRoutineModal({
                title:
                    "이미 완료한 루틴이에요",
                description:
                    "아직 남은 루틴을 이어서 진행해주세요.",
            });

            return;
        }

        // 앞 단계가 아직 완료되지 않음
        if (
            !arePreviousStagesComplete(
                routineSlot,
                routine.stageType
            )
        ) {
            openRoutineModal({
                title:
                    "이전 휴식 세션을 먼저 완료해주세요",
                description:
                    "이전 루틴을 완료한 후 이용해주세요",
            });

            return;
        }

        // 현재 실행 가능한 루틴 찾기
        const runnableRoutine =
            findRunnableRoutineForStage(
                routineSlot,
                routine.stageType
            );

        if (!runnableRoutine) {
            openRoutineModal({
                title:
                    "지금 시작할 루틴이 없어요",
                description:
                    "회복 루틴 시작하기로 현재 상태를 확인해주세요.",
            });

            return;
        }

        navigate(
            buildRecoveryRoutinePath(
                routineSlot,
                runnableRoutine
            )
        );
    };

    return {
        routineSlot,
        loadingRoutineSlot,

        showRoutineModal,
        routineModalContent,

        loadRoutineSlot,
        handleRoutineStart,

        closeRoutineModal,
    };
}