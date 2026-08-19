import { useEffect, useRef, useState } from "react";
import {
    HOURS,
    MINUTES,
    ITEM_HEIGHT,
} from "../config/timeChangeConfig";

export const useTimeChangeModal = (currentTime, currentRepeat, onSave, onClose) => {
    const [selectedTime, setSelectedTime] = useState(currentTime);
    const [repeat, setRepeat] = useState(false);

    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    // 추천 시간 클릭 등으로 smooth scroll 애니메이션을 프로그램적으로 실행시키는 동안엔,
    // 그 애니메이션이 중간중간 발생시키는 onScroll 이벤트가 selectedTime을 엉뚱한
    // 값으로 계속 덮어써버리는 문제가 있었다(예: "16:00" 클릭했는데 애니메이션 도중
    // 값이 흔들리다가 "07:00"으로 저장됨). 이 플래그가 켜져있는 동안은 onScroll이
    // selectedTime을 건드리지 않게 막는다 — 사용자가 직접 휠/드래그로 스크롤할 때는
    // 이 플래그가 꺼져있으니 정상적으로 onScroll이 값을 갱신한다.
    const suppressHourScrollRef = useRef(false);
    const suppressMinuteScrollRef = useRef(false);

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

    // smooth scroll 애니메이션이 끝나는 시점(scrollend 지원 브라우저는 그 이벤트,
    // 아니면 애니메이션이 끝날 만한 시간 뒤)에 억제 플래그를 해제한다.
    const scrollElementTo = (element, top, suppressRef) => {
        if (!element) return;

        suppressRef.current = true;

        const clearSuppress = () => {
            suppressRef.current = false;
            element.removeEventListener("scrollend", clearSuppress);
        };

        element.addEventListener("scrollend", clearSuppress);
        // scrollend 미지원 브라우저(Safari 구버전 등)를 위한 안전장치
        window.setTimeout(clearSuppress, 500);

        element.scrollTo({ top, behavior: "smooth" });
    };

    const scrollToTime = (time) => {
        const [hour, minute] = time.split(":");

        scrollElementTo(
            hourRef.current,
            HOURS.indexOf(hour) * ITEM_HEIGHT,
            suppressHourScrollRef
        );
        scrollElementTo(
            minuteRef.current,
            MINUTES.indexOf(minute) * ITEM_HEIGHT,
            suppressMinuteScrollRef
        );
    };

    const handleRecommendedTime = (time) => {
        setSelectedTime(time);
        scrollToTime(time);
    };

    const handleHourScroll = () => {
        if (!hourRef.current || suppressHourScrollRef.current) return;

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
        if (!minuteRef.current || suppressMinuteScrollRef.current) return;

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
        // 이전엔 스크롤만 시키고 값 갱신은 onScroll에 전적으로 의존했는데, 이제
        // onScroll이 애니메이션 도중엔 억제되므로 여기서 직접 값을 확정해준다.
        setSelectedTime((prev) => {
            const [, minute] = prev.split(":");
            return `${hour}:${minute}`;
        });
        scrollElementTo(
            hourRef.current,
            HOURS.indexOf(hour) * ITEM_HEIGHT,
            suppressHourScrollRef
        );
    };

    const handleMinuteChange = (minute) => {
        setSelectedTime((prev) => {
            const [hour] = prev.split(":");
            return `${hour}:${minute}`;
        });
        scrollElementTo(
            minuteRef.current,
            MINUTES.indexOf(minute) * ITEM_HEIGHT,
            suppressMinuteScrollRef
        );
    };

    const toggleRepeat = () => {
        setRepeat((prev) => !prev);
    };

    // onSave가 false를 반환하면(검증 실패/저장 실패) 모달을 닫지 않는다 — 사용자가
    // alert만 확인하고 바로 다시 시도할 수 있게. onSave가 반환값 없이 끝나면(기존
    // 동작 유지) 성공으로 간주하고 닫는다.
    const handleSave = async () => {
        const result = await onSave(selectedTime, repeat);
        if (result !== false) {
            onClose();
        }
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
