import apiClient from "./client";

// 1. PC 사용 패턴 조회
export const getDigitalPatterns = async () => {
    const response = await apiClient.get(
        "/digital-state/patterns/"
    );

    return response.data;
};

// 2. PC 사용 패턴 있음/없음 판별
export const getDigitalPatternStatus = async () => {
    return await apiClient.get(
        "/digital-state/patterns/status/"
    );
};

// 3. PC 사용 패턴 분석 결과 조회
export const getDigitalPatternAnalysis = async () => {
    return await apiClient.get(
        "/digital-state/patterns/analysis/"
    );
};

// 4. PC 사용 패턴 일괄 저장
export const saveDigitalPatterns = async (patterns) => {
    console.log(
        "서버로 보내는 데이터:",
        patterns
    );

    return await apiClient.put(
        "/digital-state/patterns/bulk/",
        patterns
    );
};

// 5. PC 사용 패턴 초기화
export const deleteDigitalPatterns = async () => {
    return await apiClient.delete(
        "/digital-state/patterns/"
    );
};