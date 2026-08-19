import { useState } from "react";
import { whyBrainfitData } from "../data/whybrainfitData";

export const useWhyBrainfit = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const current = whyBrainfitData[currentIndex];

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === whyBrainfitData.length - 1;

    const handlePrev = () => {
        if (isFirst) return;

        setCurrentIndex((prev) => prev - 1);
    };

    const handleNext = () => {
        if (isLast) return;

        setCurrentIndex((prev) => prev + 1);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return {
        current,
        currentIndex,
        slides: whyBrainfitData,
        isFirst,
        isLast,
        handlePrev,
        handleNext,
        goToSlide,
    };
};