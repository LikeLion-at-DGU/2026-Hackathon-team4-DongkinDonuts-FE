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

const hasSelectedTime = (selected) => {
    return Object.values(
        selected
    ).some(Boolean);
};

export const useDigitalState = () => {
    /*
     * 마지막으로 실제 저장된 패턴만 복원
     */
    const [selected, setSelected] =
        useState(() =>
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

    useEffect(() => {
        setInitialized(true);
    }, []);

    /*
     * 잠금 화면 → 입력 화면
     */
    const openInput = () => {
        setDigitalStep("input");
    };

    /*
     * 저장 버튼을 눌렀을 때만
     * 현재 선택값을 실제 저장
     */
    const showResult = () => {
        const hasSelection =
            hasSelectedTime(selected);

        if (!hasSelection) {
            return;
        }

        localStorage.setItem(
            DIGITAL_SELECTED_KEY,
            JSON.stringify(selected)
        );

        setDigitalStep("result");
    };

    /*
     * 다시 수정
     */
    const editInput = () => {
        setDigitalStep("input");
    };

    /*
     * 실제 저장값까지 삭제하고
     * 잠금 상태로 변경할 때만 사용
     */
    const lockDigitalState = () => {
        setSelected({});

        localStorage.removeItem(
            DIGITAL_SELECTED_KEY
        );

        setDigitalStep("locked");
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