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

const getSessionValue = (
    key,
    defaultValue
) => {
    const saved =
        sessionStorage.getItem(key);

    if (saved === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(saved);
    } catch {
        return defaultValue;
    }
};

export function useDigitalUsageSession() {
    const [
        schedules,
        setSchedules,
    ] = useState(() =>
        getSessionValue(
            SCHEDULES_KEY,
            []
        )
    );

    const [
        alarmStates,
        setAlarmStates,
    ] = useState(() =>
        getSessionValue(
            ALARM_STATES_KEY,
            {}
        )
    );

    const [
        hasGeneratedResult,
        setHasGeneratedResult,
    ] = useState(() =>
        getSessionValue(
            GENERATED_RESULT_KEY,
            false
        )
    );

    const [
        resultVersion,
        setResultVersion,
    ] = useState(() =>
        getSessionValue(
            RESULT_VERSION_KEY,
            0
        )
    );

    useEffect(() => {
        sessionStorage.setItem(
            SCHEDULES_KEY,
            JSON.stringify(schedules)
        );
    }, [schedules]);

    useEffect(() => {
        sessionStorage.setItem(
            ALARM_STATES_KEY,
            JSON.stringify(
                alarmStates
            )
        );
    }, [alarmStates]);

    useEffect(() => {
        sessionStorage.setItem(
            GENERATED_RESULT_KEY,
            JSON.stringify(
                hasGeneratedResult
            )
        );
    }, [hasGeneratedResult]);

    useEffect(() => {
        sessionStorage.setItem(
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