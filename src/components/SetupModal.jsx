import { useEffect } from "react";
import { useSetupModal } from "../hooks/useSetupModal";
import CloseButton from "../assets/icons/CloseButton.svg";

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
                    <img src={CloseButton} alt="닫기" />
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