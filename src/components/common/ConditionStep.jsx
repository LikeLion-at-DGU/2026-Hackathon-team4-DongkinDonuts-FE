import { CONDITION_OPTIONS } from "../../config/setupModalConfig";

import * as S from "./SetupModal.styled";

function ConditionStep({
    selectedCondition,
    setSelectedCondition,
    onNext,
}) {
    return (
        <>
            <S.Title>
                지금 화면 앞, 내 몸과 마음은 어떤 상태인가요?
            </S.Title>

            <S.Description>
                수동적인 SNS/영상 소비 대신,
                <br />
                지금 상태에 딱 맞는 능동적 리셋 활동을 준비해 드립니다.
            </S.Description>

            <S.SectionLabel>
                상태 선택
            </S.SectionLabel>

            <S.OptionGroup>
                {CONDITION_OPTIONS.map((option) => (
                    <S.OptionButton
                        key={option}
                        $selected={
                            selectedCondition === option
                        }
                        onClick={() =>
                            setSelectedCondition(
                                selectedCondition === option
                                    ? ""
                                    : option
                            )
                        }
                    >
                        {option}
                    </S.OptionButton>
                ))}
            </S.OptionGroup>

            <S.BottomArea>
                <S.StepDots>
                    <S.Dot $active />
                    <S.Dot />
                </S.StepDots>

                <S.ButtonGroup>
                    <S.PrimaryButton
                        onClick={onNext}
                    >
                        다음
                    </S.PrimaryButton>
                </S.ButtonGroup>
            </S.BottomArea>
        </>
    );
}

export default ConditionStep;