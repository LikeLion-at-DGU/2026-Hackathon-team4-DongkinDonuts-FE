import {
    useEffect,
    useState,
} from "react";

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

// PC 사용 패턴 결과 화면("분석 결과" 카드)이 이전에 생성된 적 있는지만 관리한다.
// "오늘의 추천 휴식 일정"은 더 이상 여기서 관리하지 않는다 — useUpcomingSchedule이
// 서버(History API)에서 직접 가져와서 항상 최신 상태를 유지하기 때문에, 로컬
// 스냅샷을 들고 있을 필요가 없다(오히려 스테일해지는 원인이었음).
export function useDigitalUsageSession() {
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
        hasGeneratedResult,
        setHasGeneratedResult,

        resultVersion,
        setResultVersion,
    };
}
