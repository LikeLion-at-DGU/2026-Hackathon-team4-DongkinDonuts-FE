import {
    useEffect,
    useState,
} from "react";

const DIGITAL_SELECTED_KEY =
    "brainfit-digital-selected";

const getSavedSelected = () => {
    try {
        const saved =
            localStorage.getItem(
                DIGITAL_SELECTED_KEY
            );

        if (!saved) {
            return {};
        }

        const parsed =
            JSON.parse(saved);

        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        return parsed;
    } catch (error) {
        console.error(
            "디지털 사용 시간 복원 실패:",
            error
        );

        return {};
    }
};

const hasSelectedTime = (
    selected
) => {
    return Object.values(
        selected
    ).some(Boolean);
};

export const useDigitalState = () => {
    /*
     * 최초 렌더링부터 localStorage 복원
     *
     * 저장값 있음
     * → 바로 result
     *
     * 저장값 없음
     * → locked
     */
    const [
        selected,
        setSelected,
    ] = useState(() =>
        getSavedSelected()
    );

    const [
        digitalStep,
        setDigitalStep,
    ] = useState(() => {
        const savedSelected =
            getSavedSelected();

        return hasSelectedTime(
            savedSelected
        )
            ? "result"
            : "locked";
    });

    const [
        initialized,
        setInitialized,
    ] = useState(false);

    /*
     * 첫 렌더링 완료
     */
    useEffect(() => {
        setInitialized(true);
    }, []);

    /*
     * 선택값이 바뀔 때마다
     * localStorage에 그대로 저장
     */
    useEffect(() => {
        if (!initialized) {
            return;
        }

        const hasSelection =
            hasSelectedTime(
                selected
            );

        /*
         * 선택된 시간이 하나라도 있으면 저장
         */
        if (hasSelection) {
            localStorage.setItem(
                DIGITAL_SELECTED_KEY,
                JSON.stringify(
                    selected
                )
            );

            return;
        }

        /*
         * 선택된 시간이 하나도 없으면
         * 저장 데이터 삭제
         *
         * 단 input 화면에서는
         * 사용자가 다시 선택할 수 있어야 하므로
         * 바로 잠그지는 않음
         */
        localStorage.removeItem(
            DIGITAL_SELECTED_KEY
        );
    }, [
        selected,
        initialized,
    ]);

    /*
     * 잠금 화면 → 입력 화면
     */
    const openInput = () => {
        setDigitalStep(
            "input"
        );
    };

    /*
     * 패턴 생성/저장 완료
     */
    const showResult = () => {
        const hasSelection =
            hasSelectedTime(
                selected
            );

        /*
         * 하나도 선택하지 않았다면
         * 다시 잠금
         */
        if (!hasSelection) {
            localStorage.removeItem(
                DIGITAL_SELECTED_KEY
            );

            setDigitalStep(
                "locked"
            );

            return;
        }

        /*
         * 현재 선택 상태 확실히 저장
         */
        localStorage.setItem(
            DIGITAL_SELECTED_KEY,
            JSON.stringify(
                selected
            )
        );

        setDigitalStep(
            "result"
        );
    };

    /*
     * 다시 수정
     */
    const editInput = () => {
        setDigitalStep(
            "input"
        );
    };

    /*
     * 전체 선택 해제 후
     * 잠금 화면으로 돌릴 때 사용
     */
    const lockDigitalState = () => {
        setSelected({});

        localStorage.removeItem(
            DIGITAL_SELECTED_KEY
        );

        setDigitalStep(
            "locked"
        );
    };

    return {
        digitalStep,

        selected,
        setSelected,

        initialized,

        openInput,
        showResult,
        editInput,
        lockDigitalState,
    };
};