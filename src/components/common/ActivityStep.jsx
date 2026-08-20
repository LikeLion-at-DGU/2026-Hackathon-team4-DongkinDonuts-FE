import {
    ACTIVITY_OPTIONS,
    TIME_OPTIONS,
} from "../../config/setupModalConfig";

import * as S from "./SetupModal.styled";

function ActivityStep({
    mode,

    selectedActivity,
    setSelectedActivity,

    selectedTime,
    setSelectedTime,

    isActivityInputOpen,
    customActivity,
    setCustomActivity,
    openActivityInput,
    submitCustomActivity,

    isTimeInputOpen,
    customTime,
    setCustomTime,
    openTimeInput,
    submitCustomTime,

    isSubmitting,

    onPrev,
    onSkip,
    onComplete,
}) {
    return (
        <>
            <S.Title>
                짧은 리셋 후, 어떤 활동에 몰입할 계획인가요?
            </S.Title>

            <S.Description>
                분산된 주의를 바로잡고 깊이 몰입할 수 있도록
                <br />
                미리 PC 활동과 시간을 세팅해 주세요.
            </S.Description>

            <S.SectionLabel>
                활동 선택
            </S.SectionLabel>

            <S.OptionGroup>
                {ACTIVITY_OPTIONS.map((option) => (
                    <S.OptionButton
                        key={option}
                        $selected={
                            selectedActivity === option
                        }
                        onClick={() =>
                            setSelectedActivity(
                                selectedActivity === option
                                    ? ""
                                    : option
                            )
                        }
                    >
                        {option}
                    </S.OptionButton>
                ))}

                {isActivityInputOpen ? (
                    <S.CustomInput
                        autoFocus
                        value={customActivity}
                        placeholder="활동 입력"
                        onChange={(e) =>
                            setCustomActivity(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitCustomActivity();
                            }
                        }}
                        onBlur={
                            submitCustomActivity
                        }
                    />
                ) : (
                    <S.OptionButton
                        onClick={openActivityInput}
                        $selected={
                            customActivity !== "" &&
                            selectedActivity ===
                                customActivity
                        }
                    >
                        {customActivity ||
                            "+ 직접입력"}
                    </S.OptionButton>
                )}
            </S.OptionGroup>

            <S.SectionLabel $marginTop>
                활동 시간
            </S.SectionLabel>

            <S.OptionGroup>
                {TIME_OPTIONS.map((option) => (
                    <S.OptionButton
                        key={option}
                        $selected={
                            selectedTime === option
                        }
                        onClick={() =>
                            setSelectedTime(
                                selectedTime === option
                                    ? ""
                                    : option
                            )
                        }
                    >
                        {option}
                    </S.OptionButton>
                ))}

                {isTimeInputOpen ? (
                    <S.CustomInput
                        autoFocus
                        value={customTime}
                        placeholder="시간 입력"
                        onChange={(e) =>
                            setCustomTime(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitCustomTime();
                            }
                        }}
                        onBlur={submitCustomTime}
                    />
                ) : (
                    <S.OptionButton
                        onClick={openTimeInput}
                        $selected={
                            customTime !== "" &&
                            selectedTime === customTime
                        }
                    >
                        {customTime ||
                            "+ 직접입력"}
                    </S.OptionButton>
                )}
            </S.OptionGroup>

            <S.BottomArea>
                {mode !== "reset" && (
                    <S.StepDots>
                        <S.Dot />
                        <S.Dot $active />
                    </S.StepDots>
                )}

                <S.ButtonGroup>
                    {mode !== "reset" && (
                        <>
                            <S.SkipButton
                                onClick={onSkip}
                            >
                                건너뛰기
                            </S.SkipButton>

                            <S.SecondaryButton
                                onClick={onPrev}
                            >
                                이전
                            </S.SecondaryButton>
                        </>
                    )}

                    <S.PrimaryButton
                        onClick={onComplete}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "저장 중..."
                            : "완료"}
                    </S.PrimaryButton>
                </S.ButtonGroup>
            </S.BottomArea>
        </>
    );
}

export default ActivityStep;