const BASE_URL = import.meta.env.VITE_API_BASE_URL;


// 1. PC 사용 패턴 조회
export const getDigitalPatterns = async () => {
    const response = await fetch(
        `${BASE_URL}/digital-state/patterns/`
    );

    if (!response.ok) {
        throw new Error("PC 사용 패턴 조회 실패");
    }

    return response.json();
};


// 2. PC 사용 패턴 있음/없음 판별
export const getDigitalPatternStatus = async () => {
    const response = await fetch(
        `${BASE_URL}/digital-state/patterns/status/`
    );

    if (!response.ok) {
        throw new Error("PC 사용 패턴 상태 조회 실패");
    }

    return response.json();
};


// 3. PC 사용 패턴 분석 결과
export const getDigitalPatternAnalysis = async () => {
    const response = await fetch(
        `${BASE_URL}/digital-state/patterns/analysis/`
    );

    if (!response.ok) {
        throw new Error("PC 사용 패턴 분석 결과 조회 실패");
    }

    return response.json();
};


// 4. PC 사용 패턴 일괄 저장
export const saveDigitalPatterns = async (patterns) => {
    console.log("서버로 보내는 데이터:", patterns);

    const response = await fetch(
        `${BASE_URL}/digital-state/patterns/bulk/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(patterns),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        console.error(
            "패턴 저장 API 에러:",
            response.status,
            errorText
        );

        throw new Error(
            `PC 사용 패턴 저장 실패: ${response.status}`
        );
    }

    return response.json();
};


// 5. PC 사용 패턴 초기화
export const deleteDigitalPatterns = async () => {
    const response = await fetch(
        `${BASE_URL}/digital-state/patterns/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("PC 사용 패턴 초기화 실패");
    }

    // 204라서 response.json() 하면 안 됨
    return true;
};