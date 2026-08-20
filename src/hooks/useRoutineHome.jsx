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
            } catch (error) {
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

    const handleRoutineStart = (
        routine
    ) => {
        if (!routineSlot) {
            navigate(
                "/recovery-session"
            );
            return;
        }

        if (
            isStageComplete(
                routineSlot,
                routine.stageType
            )
        ) {
            openRoutineModal({
                title: (
                    <>
                        이미 완료한
                        <br />
                        루틴이에요
                    </>
                ),
                description:
                    "아직 남은 루틴을 이어서 진행해주세요",
            });

            return;
        }

        if (
            !arePreviousStagesComplete(
                routineSlot,
                routine.stageType
            )
        ) {
            openRoutineModal();
            return;
        }

        const runnableRoutine =
            findRunnableRoutineForStage(
                routineSlot,
                routine.stageType
            );

        if (!runnableRoutine) {
            openRoutineModal({
                title: (
                    <>
                        지금 시작할
                        <br />
                        루틴이 없어요
                    </>
                ),
                description:
                    "회복 루틴 시작하기로 현재 상태를 확인해주세요",
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