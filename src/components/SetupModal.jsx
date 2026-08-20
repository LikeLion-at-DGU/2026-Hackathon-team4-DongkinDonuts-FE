import { useEffect, useState } from "react";
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

// complete 모드용 피드백 옵션
const statusOptions = [
    "훨씬 나아졌어요",
    "조금 나아졌어요",
    "비슷해요",
];

const difficultyOptions = [
    "딱 좋았어요",
    "너무 쉬웠어요",
    "조금 힘들었어요",
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

        isSubmitting,
        completeSetup,
    } = useSetupModal();

    // complete 모드(모든 세션 완료 피드백) 전용 내부 상태
    const [completeStep, setCompleteStep] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");

    const handleComplete = async () => {
        const errorMessage = await completeSetup(mode);
        if (errorMessage) {
            window.alert(errorMessage);
        }
        onClose();
    };

    // mode 종류에 따른 스텝 제어
    const isReset = mode === "reset";
    const isComplete = mode === "complete";
    const currentStep = isReset ? 2 : step;

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

                {/* ==================== 1. 모든 세션 완료 모드 (mode === "complete") ==================== */}
                {isComplete && completeStep === 1 && (
                    <>
                        <S.Title>
                            모든 세션 완료! 리셋 루틴은 어떠셨나요?
                        </S.Title>

                        <S.Description>
                            피드백을 반영하여
                            <br />
                            다음에는 더 딱 맞는 리셋 루틴을 추천해 드릴게요.
                        </S.Description>

                        <S.SectionLabel>
                            현재 상태 변화
                        </S.SectionLabel>

                        <S.OptionGroup>
                            {statusOptions.map((option) => (
                                <S.OptionButton
                                    key={option}
                                    $selected={selectedStatus === option}
                                    onClick={() => setSelectedStatus(option)}
                                >
                                    {option}
                                </S.OptionButton>
                            ))}
                        </S.OptionGroup>

                        <S.SectionLabel $marginTop>
                            동작 난이도
                        </S.SectionLabel>

                        <S.OptionGroup>
                            {difficultyOptions.map((option) => (
                                <S.OptionButton
                                    key={option}
                                    $selected={selectedDifficulty === option}
                                    onClick={() => setSelectedDifficulty(option)}
                                >
                                    {option}
                                </S.OptionButton>
                            ))}
                        </S.OptionGroup>

                        <S.BottomArea>
                            <S.StepDots>
                                <S.Dot $active />
                                <S.Dot />
                                <S.Dot />
                            </S.StepDots>

                            <S.ButtonGroup>
                                <S.SkipButton onClick={() => setCompleteStep(2)}>
                                    건너뛰기
                                </S.SkipButton>

                                <S.PrimaryButton onClick={() => setCompleteStep(2)}>
                                    제출하기
                                </S.PrimaryButton>
                            </S.ButtonGroup>
                        </S.BottomArea>
                    </>
                )}

                {isComplete && completeStep === 2 && (
                    <>
                        <S.Title>
                            다음 리셋 알림 시간 설정
                        </S.Title>

                        <S.Description>
                            분산된 주의를 바로잡고 깊이 몰입할 수 있도록 미리 활동과 시간을 세팅해 주세요.
                            <br />
                            설정한 시간이 지나면 Brainfit이 잊지 않고 리셋 알림을 보내드려요.
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
                                    onChange={(e) => setCustomActivity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && submitCustomActivity()}
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
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && submitCustomTime()}
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
                            <S.StepDots>
                                <S.Dot />
                                <S.Dot $active />
                                <S.Dot />
                            </S.StepDots>

                            <S.ButtonGroup>
                                <S.SecondaryButton onClick={onClose}>
                                    끝내기
                                </S.SecondaryButton>

                                <S.PrimaryButton
                                    style={{ width: "auto", padding: "0 25px" }}
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "저장 중..." : "저장하고 타이머 시작"}
                                </S.PrimaryButton>
                            </S.ButtonGroup>
                        </S.BottomArea>
                    </>
                )}

                {/* ==================== 2. 기존 모드 (mode === "initial" | "reset") ==================== */}
                {!isComplete && currentStep === 1 && (
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

                {!isComplete && currentStep === 2 && (
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
                                    onChange={(e) => setCustomActivity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && submitCustomActivity()}
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
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && submitCustomTime()}
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
                            {!isReset && (
                                <S.StepDots>
                                    <S.Dot />
                                    <S.Dot $active />
                                </S.StepDots>
                            )}

                            <S.ButtonGroup>
                                {!isReset && (
                                    <>
                                        <S.SkipButton onClick={onClose}>
                                            건너뛰기
                                        </S.SkipButton>

                                        <S.SecondaryButton onClick={goPrev}>
                                            이전
                                        </S.SecondaryButton>
                                    </>
                                )}

                                <S.PrimaryButton onClick={handleComplete} disabled={isSubmitting}>
                                    {isSubmitting ? "저장 중..." : "완료"}
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