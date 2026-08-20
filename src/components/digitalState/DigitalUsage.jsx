import UsageTable from "./UsageTable";
import DigitalAnalysisCard from "./DigitalAnalysisCard";
import DigitalScheduleCard from "./DigitalScheduleCard";

import { useDigitalUsage } from "../../hooks/useDigitalUsage";

import * as S from "./DigitalUsage.styled";

function DigitalUsage({
    mode,
    selected,
    setSelected,
    onCreate,
    onEdit,
}) {
    const {
        isResult,
        isSaving,
        hasGeneratedResult,
        resultVersion,

        toggleCell,
        toggleRow,
        resetAll,
        handleTemporarySave,
        handleCreate,
    } = useDigitalUsage({
        mode,
        selected,
        setSelected,
        onCreate,
    });

    return (
        <S.Container>
            <S.UsageCard>
                <UsageTable
                    selected={selected}
                    toggleCell={toggleCell}
                    toggleRow={toggleRow}
                    resetAll={resetAll}
                    readOnly={isResult}
                />
            </S.UsageCard>

            <S.CardRow>
                <DigitalAnalysisCard
                    showResult={hasGeneratedResult}
                    resultVersion={resultVersion}
                />

                {/* PC 사용 패턴 입력 여부와 무관하게 스스로 오늘 예정된 일정을
                    조회해서 보여준다 — props 필요 없음 */}
                <DigitalScheduleCard />
            </S.CardRow>

            <S.ActionRow
                $isResult={isResult}
            >
                {!isResult ? (
                    <>
                        <S.SaveButton
                            type="button"
                            onClick={
                                handleTemporarySave
                            }
                            disabled={isSaving}
                        >
                            {isSaving
                                ? "저장 중..."
                                : "임시 저장"}
                        </S.SaveButton>

                        <S.CreateButton
                            type="button"
                            onClick={
                                handleCreate
                            }
                            disabled={isSaving}
                        >
                            {isSaving
                                ? "생성 중..."
                                : "이 패턴으로 휴식 타이머 생성"}
                        </S.CreateButton>
                    </>
                ) : (
                    <S.EditButton
                        type="button"
                        onClick={onEdit}
                    >
                        다시 수정
                    </S.EditButton>
                )}
            </S.ActionRow>
        </S.Container>
    );
}

export default DigitalUsage;
