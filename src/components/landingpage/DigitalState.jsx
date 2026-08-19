import { useEffect, useState } from "react";

import DigitalUsage from "./DigitalUsage";
import LockIcon from "../../assets/icons/LockIcon.svg";
import { useDigitalState } from "../../hooks/useDigitalState";

import {
    getDigitalPatternStatus,
    getDigitalPatternAnalysis,
} from "../../api/digitalState";

import * as S from "./DigitalState.styled";

function DigitalState() {
    const {
        digitalStep,
        selected,
        setSelected,
        openInput,
        showResult,
        editInput,
    } = useDigitalState();

    const [status, setStatus] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDigitalState = async () => {
            try {
                const statusData =
                    await getDigitalPatternStatus();

                setStatus(statusData);

                if (statusData.has_any_pattern) {
                    const analysisData =
                        await getDigitalPatternAnalysis();

                    setAnalysis(analysisData);
                }
            } catch (error) {
                console.error(
                    "디지털 상태 조회 실패:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDigitalState();
    }, []);

    if (loading) {
        return null;
    }

    const isLocked =
    digitalStep === "locked" &&
    !status?.has_any_pattern;

    return (
        <S.DigitalSection>
            <S.DigitalHeader>
                <S.DigitalTitle>
                    My Digital State
                </S.DigitalTitle>

                <S.DigitalDescription>
                    PC 사용 패턴을 입력하면
                    <br />
                    Brainfit이 나에게 맞는 휴식 일정을 자동으로 설정해줘요.
                </S.DigitalDescription>
            </S.DigitalHeader>

            {isLocked ? (
                <S.DigitalResult>
                    <S.BlurredDigitalText>
                        디지털 사용 데이터를 입력하면
                        <br />
                        주간 PC 사용 시간과 활동 패턴을 분석하고
                        <br />
                        나에게 맞는 휴식 시간을 추천해드려요.
                    </S.BlurredDigitalText>

                    <S.LockIcon>
                        <img src={LockIcon} alt="" />
                    </S.LockIcon>

                    <S.ResultTitle>
                        디지털 사용 데이터를 입력해주세요
                    </S.ResultTitle>

                    <S.ResultDescription>
                        데이터를 입력하면
                        <br />
                        맞춤 타이머를 세팅할 수 있어요
                    </S.ResultDescription>

                    <S.ResultButton onClick={openInput}>
                        입력하기
                    </S.ResultButton>
                </S.DigitalResult>
            ) : (
                <DigitalUsage
                    mode={digitalStep}
                    selected={selected}
                    setSelected={setSelected}
                    onCreate={showResult}
                    onEdit={editInput}
                />
            )}
        </S.DigitalSection>
    );
}

export default DigitalState;