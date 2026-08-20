import { useCallback, useState } from "react";

export const useDigitalState = () => {
    const [digitalStep, setDigitalStep] = useState("locked");
    const [selected, setSelected] = useState({});

    const openInput = useCallback(() => {
        setDigitalStep("input");
    }, []);

    const showResult = useCallback(() => {
        setDigitalStep("result");
    }, []);

    const editInput = useCallback(() => {
        setDigitalStep("input");
    }, []);

    return {
        digitalStep,
        selected,
        setSelected,
        openInput,
        showResult,
        editInput,
    };
};
