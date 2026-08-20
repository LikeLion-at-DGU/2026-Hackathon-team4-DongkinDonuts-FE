import { useState } from "react";

import CloseButtonIcon from "../../assets/icons/CloseButton.svg";
import StreamLineIcon from "../../assets/icons/streamLine.svg";
import { generateAIRecoveryPlan } from "../../api/plans";
import { submitSessionFeedback } from "../../api/sessions";
import {
  ACTIVITY_OPTIONS,
  TIME_OPTIONS,
} from "../../config/setupModalConfig";
import { useSetupModal } from "../../hooks/useSetupModal";

import * as S from "./BrainResetPostSessionModals.styled";

const FEEDBACK_STORAGE_KEY = "brainfit_brain_reset_feedback";

const CONDITION_CHANGE_OPTIONS = [
  "훨씬 나아졌어요",
  "조금 나아졌어요",
  "비슷해요",
];

const DIFFICULTY_OPTIONS = [
  "딱 좋았어요",
  "너무 쉬웠어요",
  "조금 힘들었어요",
];

const RECOVERY_FEELING_BY_LABEL = {
  "훨씬 나아졌어요": "MUCH_BETTER",
  "조금 나아졌어요": "SLIGHTLY_BETTER",
  "비슷해요": "SAME",
};

const DIFFICULTY_FEEDBACK_BY_LABEL = {
  "딱 좋았어요": "JUST_RIGHT",
  "너무 쉬웠어요": "TOO_EASY",
  "조금 힘들었어요": "A_BIT_HARD",
};

function saveFeedback(feedback) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? "[]"
    );
    const items = Array.isArray(saved) ? saved : [];

    localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify([
        ...items.slice(-29),
        {
          ...feedback,
          submittedAt: new Date().toISOString(),
        },
      ])
    );
  } catch (error) {
    console.error("Brain Reset 피드백 저장 실패:", error);
  }
}

function ModalCloseButton({ onClick }) {
  return (
    <S.CloseButton type="button" onClick={onClick}>
      <img src={CloseButtonIcon} alt="닫기" />
    </S.CloseButton>
  );
}

export function BrainResetFeedbackModal({
  onComplete,
  slotId = null,
}) {
  const [conditionChange, setConditionChange] = useState("비슷해요");
  const [difficulty, setDifficulty] = useState("딱 좋았어요");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    saveFeedback({
      conditionChange,
      difficulty,
    });

    try {
      if (slotId) {
        await submitSessionFeedback({
          recoverySlotId: slotId,
          recoveryFeeling: RECOVERY_FEELING_BY_LABEL[conditionChange],
          difficultyFeedback: DIFFICULTY_FEEDBACK_BY_LABEL[difficulty],
        });
      }
      onComplete?.();
    } catch (error) {
      console.error("Brain Reset 피드백 저장 실패:", error);
      window.alert("피드백 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (slotId) {
        await submitSessionFeedback({
          recoverySlotId: slotId,
          skipped: true,
        });
      }
    } catch (error) {
      console.error("Brain Reset 피드백 건너뛰기 저장 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
    onComplete?.();
  };

  return (
    <S.Overlay>
      <S.WideModal
        role="dialog"
        aria-modal="true"
        aria-labelledby="brain-reset-feedback-title"
      >
        <ModalCloseButton onClick={handleComplete} />

        <S.SmallLabel>
          화면을 끄지 않고 리셋하기, Brainfit
        </S.SmallLabel>

        <S.Title id="brain-reset-feedback-title">
          모든 세션 완료! 휴식 루틴은 어떠셨나요?
        </S.Title>

        <S.Description>
          피드백을 반영하여
          <br />
          다음에는 더 딱 맞는 휴식 루틴을 추천해 드릴게요.
        </S.Description>

        <S.Section>
          <S.SectionLabel>현재 상태 변화</S.SectionLabel>
          <S.OptionGroup>
            {CONDITION_CHANGE_OPTIONS.map((option) => (
              <S.OptionButton
                key={option}
                type="button"
                $selected={conditionChange === option}
                onClick={() => setConditionChange(option)}
              >
                {option}
              </S.OptionButton>
            ))}
          </S.OptionGroup>
        </S.Section>

        <S.Section>
          <S.SectionLabel>동작 난이도</S.SectionLabel>
          <S.OptionGroup>
            {DIFFICULTY_OPTIONS.map((option) => (
              <S.OptionButton
                key={option}
                type="button"
                $selected={difficulty === option}
                onClick={() => setDifficulty(option)}
              >
                {option}
              </S.OptionButton>
            ))}
          </S.OptionGroup>
        </S.Section>

        <S.Divider />

        <S.Footer>
          <S.Dots aria-hidden="true">
            <S.Dot $active />
            <S.Dot $active />
            <S.Dot />
          </S.Dots>

          <S.ButtonGroup>
            <S.SecondaryButton
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              건너뛰기
            </S.SecondaryButton>
            <S.PrimaryButton
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "다음"}
            </S.PrimaryButton>
          </S.ButtonGroup>
        </S.Footer>
      </S.WideModal>
    </S.Overlay>
  );
}

export function NextRestSetupModal({
  onClose,
  onComplete,
}) {
  const setup = useSetupModal();
  const [isGenerating, setIsGenerating] = useState(false);

  const isBusy = setup.isSubmitting || isGenerating;

  const handleSave = async () => {
    if (!setup.selectedActivity || !setup.selectedTime) {
      window.alert("활동과 활동 시간을 하나씩 선택해주세요.");
      return;
    }

    const errorMessage = await setup.completeSetup("reset");

    if (errorMessage) {
      window.alert(errorMessage);
      return;
    }

    setIsGenerating(true);

    try {
      await generateAIRecoveryPlan({
        notificationEnabled: true,
      });
      onComplete?.();
    } catch (error) {
      console.error("다음 휴식 알림 생성 실패:", error);
      window.alert("다음 휴식 알림 설정에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <S.Overlay>
      <S.WideModal
        role="dialog"
        aria-modal="true"
        aria-labelledby="next-rest-setup-title"
      >
        <ModalCloseButton onClick={onClose} />

        <S.SmallLabel>
          화면을 끄지 않고 휴식하기, Brainfit
        </S.SmallLabel>

        <S.Title id="next-rest-setup-title">
          다음 휴식 알림 시간 설정
        </S.Title>

        <S.Description>
          분산된 주의를 바로잡고 깊이 몰입할 수 있도록 미리 활동과 시간을 세팅해 주세요.
          <br />
          설정한 시간이 지나면 Brainfit이 잊지 않고 휴식 알림을 보내드려요.
        </S.Description>

        <S.Section $compact>
          <S.SectionLabel>활동 선택</S.SectionLabel>
          <S.OptionGroup>
            {ACTIVITY_OPTIONS.map((option) => (
              <S.OptionButton
                key={option}
                type="button"
                $selected={setup.selectedActivity === option}
                onClick={() =>
                  setup.setSelectedActivity(
                    setup.selectedActivity === option ? "" : option
                  )
                }
              >
                {option}
              </S.OptionButton>
            ))}

            {setup.isActivityInputOpen ? (
              <S.CustomInput
                autoFocus
                value={setup.customActivity}
                placeholder="활동 입력"
                onChange={(event) =>
                  setup.setCustomActivity(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setup.submitCustomActivity();
                  }
                }}
                onBlur={setup.submitCustomActivity}
              />
            ) : (
              <S.OptionButton
                type="button"
                onClick={setup.openActivityInput}
                $selected={
                  setup.customActivity !== "" &&
                  setup.selectedActivity === setup.customActivity
                }
              >
                {setup.customActivity || "+ 직접입력"}
              </S.OptionButton>
            )}
          </S.OptionGroup>
        </S.Section>

        <S.Section>
          <S.SectionLabel>활동 시간</S.SectionLabel>
          <S.OptionGroup>
            {TIME_OPTIONS.map((option) => (
              <S.OptionButton
                key={option}
                type="button"
                $selected={setup.selectedTime === option}
                onClick={() =>
                  setup.setSelectedTime(
                    setup.selectedTime === option ? "" : option
                  )
                }
              >
                {option}
              </S.OptionButton>
            ))}

            {setup.isTimeInputOpen ? (
              <S.CustomInput
                autoFocus
                value={setup.customTime}
                placeholder="시간 입력"
                onChange={(event) =>
                  setup.setCustomTime(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setup.submitCustomTime();
                  }
                }}
                onBlur={setup.submitCustomTime}
              />
            ) : (
              <S.OptionButton
                type="button"
                onClick={setup.openTimeInput}
                $selected={
                  setup.customTime !== "" &&
                  setup.selectedTime === setup.customTime
                }
              >
                {setup.customTime || "+ 직접입력"}
              </S.OptionButton>
            )}
          </S.OptionGroup>
        </S.Section>

        <S.Divider />

        <S.Footer>
          <S.Dots aria-hidden="true">
            <S.Dot $active />
            <S.Dot $active />
            <S.Dot />
          </S.Dots>

          <S.ButtonGroup>
            <S.SecondaryButton type="button" onClick={onClose}>
              끝내기
            </S.SecondaryButton>
            <S.PrimaryButton
              type="button"
              onClick={handleSave}
              disabled={isBusy}
            >
              {isBusy ? "저장 중..." : "저장하고 타이머 시작"}
            </S.PrimaryButton>
          </S.ButtonGroup>
        </S.Footer>
      </S.WideModal>
    </S.Overlay>
  );
}

export function NextRestScheduledModal({
  onConfirm,
}) {
  return (
    <S.Overlay>
      <S.NoticeModal
        role="dialog"
        aria-modal="true"
        aria-labelledby="next-rest-scheduled-title"
      >
        <S.NoticeIcon
          src={StreamLineIcon}
          alt=""
          aria-hidden="true"
        />
        <S.NoticeTitle id="next-rest-scheduled-title">
          다음 휴식이 예정되어 있어요
          <br />
          시간에 맞춰 다시 알려드릴게요.
        </S.NoticeTitle>
        <S.NoticeDescription>
          설정된 시간이 되면 휴식 알림이 자동으로 전송돼요.
        </S.NoticeDescription>
        <S.NoticeButton type="button" onClick={onConfirm}>
          확인
        </S.NoticeButton>
      </S.NoticeModal>
    </S.Overlay>
  );
}
