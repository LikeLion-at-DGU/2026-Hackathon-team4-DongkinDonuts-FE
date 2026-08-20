import { useEffect, useState } from "react";

import {
    getDigitalPatterns,
} from "../api/digitalState";

const DAY_INDEX_MAP = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
};

const DIGITAL_STEP_KEY =
    "brainfit-digital-step";

const DIGITAL_SELECTED_KEY =
    "brainfit-digital-selected";

export const useDigitalState = () => {
    // 같은 탭에서 기존 단계가 있으면 유지
    // 새 탭이면 locked
    const [digitalStep, setDigitalStep] =
        useState(() => {
            const savedStep =
                sessionStorage.getItem(
                    DIGITAL_STEP_KEY
                );

            return savedStep || "locked";
        });

    // 같은 탭에서 선택값이 있으면 즉시 복원
    const [selected, setSelected] =
        useState(() => {
            const savedSelected =
                sessionStorage.getItem(
                    DIGITAL_SELECTED_KEY
                );

            if (!savedSelected) {
                return {};
            }

            try {
                return JSON.parse(
                    savedSelected
                );
            } catch (error) {
                console.error(
                    "디지털 선택값 복원 실패:",
                    error
                );

                return {};
            }
        });

    // 서버에 저장된 패턴도 조회
    useEffect(() => {
        const fetchDigitalPatterns =
            async () => {
                try {
                    const patterns =
                        await getDigitalPatterns();

                    console.log(
                        "저장된 PC 사용 패턴:",
                        patterns
                    );

                    const restoredSelected = {};

                    patterns.forEach(
                        (pattern) => {
                            if (
                                !pattern.is_used
                            ) {
                                return;
                            }

                            const colIndex =
                                DAY_INDEX_MAP[
                                    pattern.day_of_week
                                ];

                            if (
                                colIndex ===
                                undefined
                            ) {
                                return;
                            }

                            restoredSelected[
                                `${pattern.hour}-${colIndex}`
                            ] = true;
                        }
                    );

                    /*
                     * 같은 탭에서 이미 선택값이 있으면
                     * 그 값을 우선 유지.
                     *
                     * sessionStorage가 비어 있는 경우에만
                     * 서버 값을 복원.
                     */
                    const savedSelected =
                        sessionStorage.getItem(
                            DIGITAL_SELECTED_KEY
                        );

                    if (!savedSelected) {
                        setSelected(
                            restoredSelected
                        );
                    }
                } catch (error) {
                    console.error(
                        "PC 사용 패턴 조회 실패:",
                        error
                    );
                }
            };

        fetchDigitalPatterns();
    }, []);

    // 단계 변경 시 같은 탭에 저장
    useEffect(() => {
        sessionStorage.setItem(
            DIGITAL_STEP_KEY,
            digitalStep
        );
    }, [digitalStep]);

    // 선택 상태 변경 시 같은 탭에 저장
    useEffect(() => {
        sessionStorage.setItem(
            DIGITAL_SELECTED_KEY,
            JSON.stringify(selected)
        );
    }, [selected]);

    const openInput = () => {
        setDigitalStep("input");
    };

    const showResult = () => {
        setDigitalStep("result");
    };

    const editInput = () => {
        setDigitalStep("input");
    };

    return {
        digitalStep,
        selected,
        setSelected,
        openInput,
        showResult,
        editInput,
    };
};