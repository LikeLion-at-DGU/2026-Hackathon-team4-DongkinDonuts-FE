import { useEffect, useState } from "react";

import LockIcon from "../../assets/icons/LockIcon.svg";
import { getRecentSessionAnalysis } from "../../api/digitalState";

import * as S from "./DigitalUsage.styled";

// PC 사용 패턴 입력 여부와 무관하게 스스로 지난 7일간의 실제 회복 세션 기록을
// 조회해서 보여준다 — "언제 회복 세션을 진행하는지"는 PC 패턴 체크와 상관없는
// 실제 행동 데이터라서, 스케줄 카드(DigitalScheduleCard)와 같은 이유로 PC 패턴
// 잠금 상태에 더 이상 가두지 않는다.
function DigitalAnalysisCard() {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchAnalysis = async () => {
            try {
                setIsLoading(true);

                const data =
                    await getRecentSessionAnalysis();

                if (cancelled) {
                    return;
                }

                setAnalysis(data);
            } catch (error) {
                console.error(
                    "최근 세션 기반 분석 조회 실패:",
                    error
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchAnalysis();

        return () => {
            cancelled = true;
        };
    }, []);

    const hasData =
        (analysis?.weekly_pc_usage_hours ?? 0) > 0;

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

            {isLoading ? (
                <S.EmptyContent>
                    <S.EmptyTitle>
                        최근 세션 기록을 분석하고 있어요
                    </S.EmptyTitle>
                </S.EmptyContent>
            ) : !hasData ? (
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
                        아직 분석할 회복 세션 기록이 없어요
                    </S.EmptyTitle>

                    <S.EmptyDescription>
                        지난 7일 동안 완료한 회복 세션이 없어요
                        <br />
                        회복 루틴을 진행하면 여기에 분석 결과가 뜹니다
                    </S.EmptyDescription>
                </S.EmptyContent>
            ) : (
                <S.ResultContent>
                    <S.StatRow>
                        <S.StatBox>
                            <strong>
                                {analysis?.weekly_pc_usage_hours ?? 0}
                            </strong>
                            <span>주간 활동(h)</span>
                        </S.StatBox>

                        <S.StatBox>
                            <strong>
                                {analysis?.weekly_pc_usage_day_count ?? 0}/7
                            </strong>
                            <span>활성 요일</span>
                        </S.StatBox>

                        <S.StatBox>
                            <strong>
                                {analysis?.weekly_activity_rate?.percent ?? 0}%
                            </strong>
                            <span>주간 활동률</span>
                        </S.StatBox>
                    </S.StatRow>

                    <S.AnalysisBox>
                        <p>
                            <strong>
                                평소{" "}
                                {analysis?.most_used_patterns
                                    ?.time_pattern?.label ?? "-"}
                                에
                            </strong>{" "}
                            회복 세션을
                            <br />
                            가장 많이 진행하는 패턴이에요.
                        </p>

                        <p>
                            특히{" "}
                            <strong>
                                {analysis?.most_used_patterns
                                    ?.time_of_day_pattern?.label ?? "-"}
                            </strong>{" "}
                            시간대에 집중적인 활동이 예상돼요.
                        </p>
                    </S.AnalysisBox>

                    <S.Caption>
                        ※ 지난 7일간 실제로 진행한 회복 세션을 바탕으로 분석했어요.
                    </S.Caption>
                </S.ResultContent>
            )}
        </S.InfoCard>
    );
}

export default DigitalAnalysisCard;
