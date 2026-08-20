import DigitalUsage from "./DigitalUsage";
import DigitalLockedView from "./DigitalLockedView";

import { useDigitalState } from "../../hooks/useDigitalState";

import * as S from "./DigitalState.styled";

function DigitalState({
    onRecommendedTimesChange,
}) {
    const {
        digitalStep,
        selected,
        setSelected,
        initialized,
        openInput,
        showResult,
        editInput,
    } = useDigitalState();

    if (!initialized) {
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
                <DigitalLockedView
                    onOpen={openInput}
                />
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