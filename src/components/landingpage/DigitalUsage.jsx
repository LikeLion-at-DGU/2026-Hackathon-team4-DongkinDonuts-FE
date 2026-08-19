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
        schedules,
        alarmStates,
        toggleAlarm,
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
                    isResult={isResult}
                />

                <DigitalScheduleCard
                    isResult={isResult}
                    schedules={schedules}
                    alarmStates={alarmStates}
                    onToggleAlarm={toggleAlarm}
                />
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