import { useEffect } from "react";
import { useSetupModal } from "../hooks/useSetupModal";

import * as S from "./SetupModal.styled";

const conditionOptions = [
    "눈이 피로해요",
    "목과 어깨가 굳었어요",
    "집중이 안 돼요",
    "머리가 멍하고 졸려요",
    "아직 괜찮아요",
];

const activityOptions = [
    "#코딩",
    "#과제",
    "#작업",
    "#업무",
];

const timeOptions = [
    "30분",
    "1시간",
    "2시간",
];

function SetupModal({ onClose, mode = "initial" }) {
    const {
        step,
        goNext,
        goPrev,

        selectedCondition,
        setSelectedCondition,

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
    } = useSetupModal();

    // reset 모드면 무조건 2단계만 보여줌
    const currentStep = mode === "reset" ? 2 : step;

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    return (
        <S.Overlay>
            <S.Modal>
                <S.CloseButton onClick={onClose}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                    >
                        <path
                            d="M0.182998 0.44229L0.299373 0.299373C0.468536 0.130577 0.691557 0.0264798 0.929582 0.00521429C1.16761 -0.0160513 1.40555 0.0468632 1.60196 0.182998L1.74487 0.299373L8.16795 6.7245L14.591 0.299373C14.6859 0.20446 14.7986 0.129171 14.9226 0.0778045C15.0466 0.0264381 15.1796 1.00007e-09 15.3138 0C15.448 -1.00007e-09 15.5809 0.0264381 15.7049 0.0778045C15.8289 0.129171 15.9416 0.20446 16.0365 0.299373C16.1314 0.394285 16.2067 0.506964 16.2581 0.630973C16.3095 0.754983 16.3359 0.887896 16.3359 1.02212C16.3359 1.15635 16.3095 1.28926 16.2581 1.41327C16.2067 1.53728 16.1314 1.64996 16.0365 1.74487L9.61141 8.16795L16.0365 14.591C16.2053 14.7602 16.3094 14.9832 16.3307 15.2212C16.352 15.4593 16.289 15.6972 16.1529 15.8936L16.0365 16.0365C15.8674 16.2053 15.6444 16.3094 15.4063 16.3307C15.1683 16.352 14.9304 16.289 14.734 16.1529L14.591 16.0365L8.16795 9.61141L1.74487 16.0365C1.64996 16.1314 1.53728 16.2067 1.41327 16.2581C1.28926 16.3095 1.15635 16.3359 1.02212 16.3359C0.887896 16.3359 0.754983 16.3095 0.630973 16.2581C0.506964 16.2067 0.394285 16.1314 0.299373 16.0365C0.20446 15.9416 0.129171 15.8289 0.0778045 15.7049C0.0264381 15.5809 0 15.448 0 15.3138C0 15.1796 0.0264381 15.0466 0.0778045 14.9226C0.129171 14.7986 0.20446 14.6859 0.299373 14.591L6.7245 8.16795L0.299373 1.74487C0.130577 1.57571 0.0264798 1.35269 0.00521429 1.11466C-0.0160513 0.876638 0.0468632 0.638696 0.182998 0.44229Z"
                            fill="#484848"
                        />
                    </svg>
                </S.CloseButton>

                <S.SmallLabel>
                    화면을 끄지 않고 리셋하기, Brainfit
                </S.SmallLabel>

                {currentStep === 1 && (
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
                            {conditionOptions.map((option) => (
                                <S.OptionButton
                                    key={option}
                                    $selected={selectedCondition === option}
                                    onClick={() => setSelectedCondition(option)}
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
                                <S.PrimaryButton onClick={goNext}>
                                    다음
                                </S.PrimaryButton>
                            </S.ButtonGroup>
                        </S.BottomArea>
                    </>
                )}

                {currentStep === 2 && (
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
                            {activityOptions.map((option) => (
                                <S.OptionButton
                                    key={option}
                                    $selected={selectedActivity === option}
                                    onClick={() => setSelectedActivity(option)}
                                >
                                    {option}
                                </S.OptionButton>
                            ))}

                            {isActivityInputOpen ? (
                                <S.CustomInput
                                    autoFocus
                                    type="text"
                                    value={customActivity}
                                    placeholder="활동 입력"
                                    onChange={(e) =>
                                        setCustomActivity(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            submitCustomActivity();
                                        }
                                    }}
                                    onBlur={submitCustomActivity}
                                />
                            ) : (
                                <S.OptionButton
                                    onClick={openActivityInput}
                                    $selected={
                                        customActivity !== "" &&
                                        selectedActivity === customActivity
                                    }
                                >
                                    {customActivity || "+ 직접입력"}
                                </S.OptionButton>
                            )}
                        </S.OptionGroup>

                        <S.SectionLabel $marginTop>
                            활동 시간
                        </S.SectionLabel>

                        <S.OptionGroup>
                            {timeOptions.map((option) => (
                                <S.OptionButton
                                    key={option}
                                    $selected={selectedTime === option}
                                    onClick={() => setSelectedTime(option)}
                                >
                                    {option}
                                </S.OptionButton>
                            ))}

                            {isTimeInputOpen ? (
                                <S.CustomInput
                                    autoFocus
                                    type="text"
                                    value={customTime}
                                    placeholder="시간 입력"
                                    onChange={(e) =>
                                        setCustomTime(e.target.value)
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
                                    {customTime || "+ 직접입력"}
                                </S.OptionButton>
                            )}
                        </S.OptionGroup>

                        <S.BottomArea>
                            {/* 처음 접속일 때만 점 표시 */}
                            {mode !== "reset" && (
                                <S.StepDots>
                                    <S.Dot />
                                    <S.Dot $active />
                                </S.StepDots>
                            )}

                            <S.ButtonGroup>
                                {/* 처음 접속일 때만 건너뛰기 + 이전 */}
                                {mode !== "reset" && (
                                    <>
                                        <S.SkipButton onClick={onClose}>
                                            건너뛰기
                                        </S.SkipButton>

                                        <S.SecondaryButton onClick={goPrev}>
                                            이전
                                        </S.SecondaryButton>
                                    </>
                                )}

                                <S.PrimaryButton onClick={onClose}>
                                    완료
                                </S.PrimaryButton>
                            </S.ButtonGroup>
                        </S.BottomArea>
                    </>
                )}
            </S.Modal>
        </S.Overlay>
    );
}

export default SetupModal;