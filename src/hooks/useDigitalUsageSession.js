import {
    useEffect,
    useState,
} from "react";

const SCHEDULES_KEY =
    "brainfit-digital-schedules";

const ALARM_STATES_KEY =
    "brainfit-digital-alarm-states";

const GENERATED_RESULT_KEY =
    "brainfit-digital-generated-result";

const RESULT_VERSION_KEY =
    "brainfit-digital-result-version";

const getStoredValue = (
    key,
    defaultValue
) => {
    const saved =
        localStorage.getItem(key);

    if (saved === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(
            saved
        );
    } catch (error) {
        console.error(
            `${key} 복원 실패:`,
            error
        );

        return defaultValue;
    }
};

export function useDigitalUsageSession() {
    const [
        schedules,
        setSchedules,
    ] = useState(() =>
        getStoredValue(
            SCHEDULES_KEY,
            []
        )
    );

    const [
        alarmStates,
        setAlarmStates,
    ] = useState(() =>
        getStoredValue(
            ALARM_STATES_KEY,
            {}
        )
    );

    const [
        hasGeneratedResult,
        setHasGeneratedResult,
    ] = useState(() =>
        getStoredValue(
            GENERATED_RESULT_KEY,
            false
        )
    );

    const [
        resultVersion,
        setResultVersion,
    ] = useState(() =>
        getStoredValue(
            RESULT_VERSION_KEY,
            0
        )
    );

    useEffect(() => {
        localStorage.setItem(
            SCHEDULES_KEY,
            JSON.stringify(
                schedules
            )
        );
    }, [schedules]);

    useEffect(() => {
        localStorage.setItem(
            ALARM_STATES_KEY,
            JSON.stringify(
                alarmStates
            )
        );
    }, [alarmStates]);

    useEffect(() => {
        localStorage.setItem(
            GENERATED_RESULT_KEY,
            JSON.stringify(
                hasGeneratedResult
            )
        );
    }, [
        hasGeneratedResult,
    ]);

    useEffect(() => {
        localStorage.setItem(
            RESULT_VERSION_KEY,
            JSON.stringify(
                resultVersion
            )
        );
    }, [resultVersion]);

    return {
        schedules,
        setSchedules,

        alarmStates,
        setAlarmStates,

        hasGeneratedResult,
        setHasGeneratedResult,

        resultVersion,
        setResultVersion,
    };
}