import { useEffect, useState } from "react";

import LockIcon from "../../assets/icons/LockIcon.svg";
import { getDigitalPatternAnalysis } from "../../api/digitalState";

import * as S from "./DigitalUsage.styled";

function DigitalAnalysisCard({ isResult }) {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // 아직 결과 화면이 아니면 분석 API 호출 X
        if (!isResult) {
            setAnalysis(null);
            return;
        }

        const fetchAnalysis = async () => {
            try {
                setIsLoading(true);

                const data =
                    await getDigitalPatternAnalysis();

                console.log(
                    "PC 사용 패턴 분석 결과:",
                    data
                );

                setAnalysis(data);
            } catch (error) {
                console.error(
                    "PC 사용 패턴 분석 조회 실패:",
                    error
                );

                setAnalysis(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [isResult]);

    return (
        <S.InfoCard>
            <S.CardTitle>
                <img
                    src={LockIcon}
                    alt=""
                    width="28"
                    height="34"
                />
                분석 결과
            </S.CardTitle>

            {!isResult ? (
                <S.EmptyContent>
                    <S.EmptyIcon $circle>
                        <img
                            src={LockIcon}
                            alt=""
                            width="34"
                            height="42"
                        />
                    </S.EmptyIcon>

                    <S.EmptyTitle>
                        아직 분석된 PC 패턴이 없어요
                    </S.EmptyTitle>

                    <S.EmptyDescription>
                        상단 표에 사용 시간을 체크하고
                        <br />
                        이 패턴으로 AI 휴식 타이머 생성 버튼을 눌러
                        <br />
                        맞춤 분석을 받아보세요
                    </S.EmptyDescription>
                </S.EmptyContent>
            ) : isLoading ? (
                <S.EmptyContent>
                    <S.EmptyTitle>
                        PC 사용 패턴을 분석하고 있어요
                    </S.EmptyTitle>

                    <S.EmptyDescription>
                        잠시만 기다려주세요.
                    </S.EmptyDescription>
                </S.EmptyContent>
            ) : (
                <S.ResultContent>
                    <S.StatRow>
                        <S.StatBox>
                            <strong>
                                {analysis?.weekly_pc_usage_hours ?? 0}
                            </strong>

                            <span>
                                주간 사용(h)
                            </span>
                        </S.StatBox>

                        <S.StatBox>
                            <strong>
                                {analysis?.weekly_pc_usage_day_count ?? 0}
                                /7
                            </strong>

                            <span>
                                활성 요일
                            </span>
                        </S.StatBox>

                        <S.StatBox>
                            <strong>
                                {analysis?.weekly_activity_rate ?? 0}%
                            </strong>

                            <span>
                                주간 활동률
                            </span>
                        </S.StatBox>
                    </S.StatRow>

                    <S.AnalysisBox>
                        <p>
                            <strong>
                                평소{" "}
                                {analysis?.most_used_patterns
                                    ?.time_pattern ?? "-"}
                                에
                            </strong>{" "}
                            PC를
                            <br />
                            가장 많이 사용하는 패턴이에요.
                        </p>

                        <p>
                            특히{" "}
                            <strong>
                                {analysis?.most_used_patterns
                                    ?.time_of_day_pattern ?? "-"}
                            </strong>{" "}
                            시간대에 집중적인 사용이 예상돼요.
                        </p>
                    </S.AnalysisBox>

                    <S.Caption>
                        ※ 입력한 사용 패턴을 바탕으로 분석했어요.
                    </S.Caption>
                </S.ResultContent>
            )}
        </S.InfoCard>
    );
}

export default DigitalAnalysisCard;