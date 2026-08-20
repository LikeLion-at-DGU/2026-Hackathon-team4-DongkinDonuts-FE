import {
    useEffect,
    useState,
} from "react";

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

const DIGITAL_USED_KEY =
    "brainfit-digital-used";

export const useDigitalState = () => {
    const [
        digitalStep,
        setDigitalStep,
    ] = useState(() => {
        /*
         * 한 번이라도 Digital State를 사용했다면
         * 새 탭에서도 result 화면부터 시작
         */
        const hasUsed =
            localStorage.getItem(
                DIGITAL_USED_KEY
            );

        if (hasUsed === "true") {
            return "result";
        }

        return "locked";
    });

    const [
        selected,
        setSelected,
    ] = useState(() => {
        const savedSelected =
            localStorage.getItem(
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

    /*
     * 서버에 저장된 패턴 복원
     */
    useEffect(() => {
        const fetchDigitalPatterns =
            async () => {
                try {
                    const response =
                        await getDigitalPatterns();

                    /*
                     * apiClient 구조에 따라
                     * response 자체가 배열일 수도 있고
                     * response.data가 배열일 수도 있으므로 대응
                     */
                    const patterns =
                        Array.isArray(
                            response
                        )
                            ? response
                            : Array.isArray(
                                  response?.data
                              )
                              ? response.data
                              : [];

                    console.log(
                        "저장된 PC 사용 패턴:",
                        patterns
                    );

                    const restoredSelected =
                        {};

                    patterns.forEach(
                        (pattern) => {
                            if (
                                !pattern.is_used
                            ) {
                                return;
                            }

                            const colIndex =
                                DAY_INDEX_MAP[
                                    pattern
                                        .day_of_week
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
                     * 서버에 실제 저장된 패턴이 있다면
                     * 이미 사용한 사용자
                     */
                    if (
                        Object.keys(
                            restoredSelected
                        ).length > 0
                    ) {
                        setSelected(
                            restoredSelected
                        );

                        setDigitalStep(
                            "result"
                        );

                        localStorage.setItem(
                            DIGITAL_USED_KEY,
                            "true"
                        );

                        localStorage.setItem(
                            DIGITAL_SELECTED_KEY,
                            JSON.stringify(
                                restoredSelected
                            )
                        );

                        localStorage.setItem(
                            DIGITAL_STEP_KEY,
                            "result"
                        );
                    }
                } catch (error) {
                    console.error(
                        "PC 사용 패턴 조회 실패:",
                        error
                    );

                    /*
                     * 서버 조회 실패해도
                     * localStorage에 사용 기록이 있으면
                     * 잠금으로 되돌리지 않음
                     */
                    const hasUsed =
                        localStorage.getItem(
                            DIGITAL_USED_KEY
                        );

                    if (
                        hasUsed ===
                        "true"
                    ) {
                        setDigitalStep(
                            "result"
                        );
                    }
                }
            };

        fetchDigitalPatterns();
    }, []);

    /*
     * 단계 저장
     */
    useEffect(() => {
        localStorage.setItem(
            DIGITAL_STEP_KEY,
            digitalStep
        );
    }, [digitalStep]);

    /*
     * 선택 시간 저장
     */
    useEffect(() => {
        localStorage.setItem(
            DIGITAL_SELECTED_KEY,
            JSON.stringify(
                selected
            )
        );
    }, [selected]);

    const openInput = () => {
        setDigitalStep("input");
    };

    const showResult = () => {
        setDigitalStep("result");

        /*
         * 최초 생성 완료 순간부터
         * 앞으로는 잠금 화면을 보여주지 않음
         */
        localStorage.setItem(
            DIGITAL_USED_KEY,
            "true"
        );

        localStorage.setItem(
            DIGITAL_STEP_KEY,
            "result"
        );
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