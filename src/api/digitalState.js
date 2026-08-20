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

// 3. PC 사용 패턴 분석 결과 조회(자기보고 체크값 기반) — 지금은 "분석 결과" 카드에서
// 안 쓰고, 실제 세션 기록 기반인 getRecentSessionAnalysis를 대신 쓴다.
export const getDigitalPatternAnalysis = async () => {
    return await apiClient.get(
        "/digital-state/patterns/analysis/"
    );
};

// 3-2. 지난 7일간 실제로 완료한 회복 세션 기록 기반 분석 결과 조회. 사용자가
// 미리 체크해둔 "PC 사용 예정" 대신, 실제로 회복 세션을 진행한 시점을 근거로
// 삼는다 — 응답 형태는 getDigitalPatternAnalysis와 동일하다.
export const getRecentSessionAnalysis = async () => {
    return await apiClient.get(
        "/digital-state/patterns/analysis/recent-sessions/"
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