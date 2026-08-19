import { useState } from "react";

export const useDigitalState = () => {
    const [digitalStep, setDigitalStep] = useState("locked");
    const [selected, setSelected] = useState({});

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