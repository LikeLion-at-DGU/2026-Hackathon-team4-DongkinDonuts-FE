import {
    ACTIVITY_OPTIONS,
    TIME_OPTIONS,
} from "../../config/setupModalConfig";

import * as S from "./SetupModal.styled";
import { ActivityOptionGroup, TimeOptionGroup } from "./SetupOptionGroups";

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
    const handleCustomTimeChange = (value) => {
        // 숫자만 허용
        if (!/^\d*$/.test(value)) {
            return;
        }

        setCustomTime(value);
    };

    const handleSubmitCustomTime = () => {
        if (!customTime) {
            return;
        }

        const minutes = Number(customTime);

        if (minutes < 45) {
            window.alert(
                "활동 시간은 최소 45분 이상으로 입력해주세요."
            );
            return;
        }

        submitCustomTime();
    };

    const handleComplete = () => {
        /*
         * 직접 입력한 시간이 선택된 경우
         * 최소 45분 검증
         */
        if (
            customTime &&
            selectedTime === customTime &&
            Number(customTime) < 45
        ) {
            window.alert(
                "활동 시간은 최소 45분 이상으로 입력해주세요."
            );
            return;
        }

        onComplete();
    };

    return (
        <>
            <S.Title>
                짧은 휴식 후, 어떤 활동에 몰입할 계획인가요?
            </S.Title>

            <S.Description>
                분산된 주의를 바로잡고 깊이 몰입할 수 있도록
                <br />
                미리 PC 활동과 시간을 세팅해 주세요.
            </S.Description>

            <S.SectionLabel>
                활동 선택
            </S.SectionLabel>

            <ActivityOptionGroup
                options={ACTIVITY_OPTIONS}
                selectedActivity={selectedActivity}
                onSelectActivity={(option) =>
                    setSelectedActivity(
                        selectedActivity === option ? "" : option
                    )
                }
                isActivityInputOpen={isActivityInputOpen}
                customActivity={customActivity}
                onCustomActivityChange={setCustomActivity}
                onOpenActivityInput={openActivityInput}
                onSubmitCustomActivity={submitCustomActivity}
            />

            <S.SectionLabel $marginTop>
                활동 시간
            </S.SectionLabel>

            <TimeOptionGroup
                options={TIME_OPTIONS}
                selectedTime={selectedTime}
                onSelectTime={(option) =>
                    setSelectedTime(
                        selectedTime === option ? "" : option
                    )
                }
                isTimeInputOpen={isTimeInputOpen}
                customTime={customTime}
                onCustomTimeChange={handleCustomTimeChange}
                onOpenTimeInput={openTimeInput}
                onSubmitCustomTime={handleSubmitCustomTime}
                inputMode="numeric"
                customButtonLabel={(value) =>
                    value ? `${value}분` : "+ 직접입력"
                }
            />

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
                                type="button"
                                onClick={onSkip}
                            >
                                건너뛰기
                            </S.SkipButton>

                            <S.SecondaryButton
                                type="button"
                                onClick={onPrev}
                            >
                                이전
                            </S.SecondaryButton>
                        </>
                    )}

                    <S.PrimaryButton
                        type="button"
                        onClick={handleComplete}
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