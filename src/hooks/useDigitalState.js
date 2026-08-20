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

const DIGITAL_SELECTED_KEY =
    "brainfit-digital-selected";

export const useDigitalState = () => {
    const [
        digitalStep,
        setDigitalStep,
    ] = useState("locked");

    const [
        selected,
        setSelected,
    ] = useState({});

    const [
        initialized,
        setInitialized,
    ] = useState(false);

    useEffect(() => {
        const restoreDigitalState =
            async () => {
                try {
                    const response =
                        await getDigitalPatterns();

                    const patterns =
                        Array.isArray(response)
                            ? response
                            : Array.isArray(
                                  response?.data
                              )
                              ? response.data
                              : [];

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

                    setSelected(
                        restoredSelected
                    );

                    localStorage.setItem(
                        DIGITAL_SELECTED_KEY,
                        JSON.stringify(
                            restoredSelected
                        )
                    );

                    /*
                     * 핵심:
                     * 현재 서버에 선택된 시간이
                     * 하나라도 있을 때만 result
                     */
                    if (
                        Object.keys(
                            restoredSelected
                        ).length > 0
                    ) {
                        setDigitalStep(
                            "result"
                        );
                    } else {
                        setDigitalStep(
                            "locked"
                        );
                    }
                } catch (error) {
                    console.error(
                        "디지털 패턴 복원 실패:",
                        error
                    );

                    /*
                     * 서버 조회 실패 시에는
                     * localStorage를 보조 수단으로 사용
                     */
                    try {
                        const saved =
                            localStorage.getItem(
                                DIGITAL_SELECTED_KEY
                            );

                        const savedSelected =
                            saved
                                ? JSON.parse(
                                      saved
                                  )
                                : {};

                        setSelected(
                            savedSelected
                        );

                        if (
                            Object.keys(
                                savedSelected
                            ).some(
                                (key) =>
                                    savedSelected[
                                        key
                                    ]
                            )
                        ) {
                            setDigitalStep(
                                "result"
                            );
                        } else {
                            setDigitalStep(
                                "locked"
                            );
                        }
                    } catch {
                        setSelected({});
                        setDigitalStep(
                            "locked"
                        );
                    }
                } finally {
                    setInitialized(true);
                }
            };

        restoreDigitalState();
    }, []);

    /*
     * 선택 상태 로컬에도 저장
     */
    useEffect(() => {
        if (!initialized) {
            return;
        }

        localStorage.setItem(
            DIGITAL_SELECTED_KEY,
            JSON.stringify(
                selected
            )
        );
    }, [
        selected,
        initialized,
    ]);

    const openInput = () => {
        setDigitalStep("input");
    };

    const showResult = () => {
        const hasSelectedTime =
            Object.values(
                selected
            ).some(Boolean);

        /*
         * 선택값이 없으면 결과 화면으로
         * 보내지 않음
         */
        if (!hasSelectedTime) {
            setDigitalStep(
                "locked"
            );
            return;
        }

        setDigitalStep("result");
    };

    const editInput = () => {
        setDigitalStep("input");
    };

    return {
        digitalStep,
        selected,
        setSelected,
        initialized,

        openInput,
        showResult,
        editInput,
    };
};