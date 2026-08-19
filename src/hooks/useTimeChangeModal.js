import { useEffect, useRef, useState } from "react";
import {
    HOURS,
    MINUTES,
    ITEM_HEIGHT,
} from "../config/timeChangeConfig";

export const useTimeChangeModal = (currentTime, onSave, onClose) => {
    const [selectedTime, setSelectedTime] = useState(currentTime);
    const [repeat, setRepeat] = useState(true);

    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    const [selectedHour, selectedMinute] = selectedTime.split(":");

    useEffect(() => {
        const [hour, minute] = currentTime.split(":");

        requestAnimationFrame(() => {
            if (hourRef.current) {
                hourRef.current.scrollTop =
                    HOURS.indexOf(hour) * ITEM_HEIGHT;
            }

            if (minuteRef.current) {
                minuteRef.current.scrollTop =
                    MINUTES.indexOf(minute) * ITEM_HEIGHT;
            }
        });
    }, [currentTime]);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const scrollToTime = (time) => {
        const [hour, minute] = time.split(":");

        hourRef.current?.scrollTo({
            top: HOURS.indexOf(hour) * ITEM_HEIGHT,
            behavior: "smooth",
        });

        minuteRef.current?.scrollTo({
            top: MINUTES.indexOf(minute) * ITEM_HEIGHT,
            behavior: "smooth",
        });
    };

    const handleRecommendedTime = (time) => {
        setSelectedTime(time);
        scrollToTime(time);
    };

    const handleHourScroll = () => {
        if (!hourRef.current) return;

        const index = Math.round(
            hourRef.current.scrollTop / ITEM_HEIGHT
        );

        const safeIndex = Math.max(
            0,
            Math.min(index, HOURS.length - 1)
        );

        setSelectedTime((prev) => {
            const [, minute] = prev.split(":");
            return `${HOURS[safeIndex]}:${minute}`;
        });
    };

    const handleMinuteScroll = () => {
        if (!minuteRef.current) return;

        const index = Math.round(
            minuteRef.current.scrollTop / ITEM_HEIGHT
        );

        const safeIndex = Math.max(
            0,
            Math.min(index, MINUTES.length - 1)
        );

        setSelectedTime((prev) => {
            const [hour] = prev.split(":");
            return `${hour}:${MINUTES[safeIndex]}`;
        });
    };

    const handleHourChange = (hour) => {
        hourRef.current?.scrollTo({
            top: HOURS.indexOf(hour) * ITEM_HEIGHT,
            behavior: "smooth",
        });
    };

    const handleMinuteChange = (minute) => {
        minuteRef.current?.scrollTo({
            top: MINUTES.indexOf(minute) * ITEM_HEIGHT,
            behavior: "smooth",
        });
    };

    const toggleRepeat = () => {
        setRepeat((prev) => !prev);
    };

    const handleSave = () => {
        onSave(selectedTime, repeat);
        onClose();
    };

    return {
        selectedTime,
        selectedHour,
        selectedMinute,
        repeat,

        hourRef,
        minuteRef,

        handleRecommendedTime,
        handleHourScroll,
        handleMinuteScroll,
        handleHourChange,
        handleMinuteChange,
        toggleRepeat,
        handleSave,
    };
};