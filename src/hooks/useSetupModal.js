import { useState } from "react";

export const useSetupModal = () => {
    const [step, setStep] = useState(1);

    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [isActivityInputOpen, setIsActivityInputOpen] = useState(false);
    const [customActivity, setCustomActivity] = useState("");

    const [isTimeInputOpen, setIsTimeInputOpen] = useState(false);
    const [customTime, setCustomTime] = useState("");

    const goNext = () => {
        setStep(2);
    };

    const goPrev = () => {
        setStep(1);
    };

    const openActivityInput = () => {
        if (customActivity.startsWith("#")) {
            setCustomActivity(customActivity.slice(1));
        }

        setIsActivityInputOpen(true);
    };

    const submitCustomActivity = () => {
        const value = customActivity.trim();

        if (!value) {
            setIsActivityInputOpen(false);
            return;
        }

        const activityWithHash = value.startsWith("#")
            ? value
            : `#${value}`;

        setCustomActivity(activityWithHash);
        setSelectedActivity(activityWithHash);
        setIsActivityInputOpen(false);
    };

    const openTimeInput = () => {
        setIsTimeInputOpen(true);
    };

    const submitCustomTime = () => {
        const value = customTime.trim();

        if (!value) {
            setIsTimeInputOpen(false);
            return;
        }

        setSelectedTime(value);
        setIsTimeInputOpen(false);
    };

    return {
        step,
        goNext,
        goPrev,

        selectedCondition,
        setSelectedCondition,

        selectedActivity,
        setSelectedActivity,

        selectedTime,
        setSelectedTime,

        isActivityInputOpen,
        customActivity,
        setCustomActivity,
        openActivityInput,
        submitCustomActivity,

        isTimeInputOpen,
        customTime,
        setCustomTime,
        openTimeInput,
        submitCustomTime,
    };
};