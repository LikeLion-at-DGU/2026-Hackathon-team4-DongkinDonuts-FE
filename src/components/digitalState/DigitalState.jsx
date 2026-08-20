import { useEffect, useState } from "react";

import DigitalUsage from "./DigitalUsage";
import HistoryTable from "../history/HistoryTable";
import { historyPreviewData } from "../../data/historyPreviewData";

import LockIcon from "../../assets/icons/LockIcon.svg";
import { useDigitalState } from "../../hooks/useDigitalState";
import { getDigitalPatternStatus } from "../../api/digitalState";

import * as S from "./DigitalState.styled";

function DigitalState({
    onRecommendedTimesChange,
}) {
    const {
        digitalStep,
        selected,
        setSelected,
        openInput,
        showResult,
        editInput,
    } = useDigitalState();

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDigitalState = async () => {
            try {
                const statusData =
                    await getDigitalPatternStatus();

                setStatus(statusData);
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
        digitalStep === "locked";

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
                    <S.BlurredUsageTable>
                        <HistoryTable
                            historyData={
                                historyPreviewData
                            }
                        />
                    </S.BlurredUsageTable>

                    <S.LockContent>
                        <S.LockIcon>
                            <img
                                src={LockIcon}
                                alt=""
                            />
                        </S.LockIcon>

                        <S.ResultTitle>
                            디지털 사용 데이터를 입력해주세요
                        </S.ResultTitle>

                        <S.ResultDescription>
                            데이터를 입력하면
                            <br />
                            맞춤 타이머를 세팅할 수 있어요
                        </S.ResultDescription>

                        <S.ResultButton
                            onClick={openInput}
                        >
                            입력하기
                        </S.ResultButton>
                    </S.LockContent>
                </S.DigitalResult>
            ) : (
                <DigitalUsage
                    mode={digitalStep}
                    selected={selected}
                    setSelected={setSelected}
                    onCreate={showResult}
                    onEdit={editInput}
                    onRecommendedTimesChange={
                        onRecommendedTimesChange
                    }
                />
            )}
        </S.DigitalSection>
    );
}

export default DigitalState;