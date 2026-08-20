import { useState } from "react";

import StreamLineIcon from "../../assets/icons/streamLine.svg";
import {
  generateAIRecoveryPlan,
  getRecoverySlot,
} from "../../api/plans";
import { submitSessionFeedback } from "../../api/sessions";
import { applyDifficultyFeedbackToSlot } from "../../utils/routineDifficultyFeedback";
import {
  ACTIVITY_OPTIONS,
  TIME_OPTIONS,
} from "../../config/setupModalConfig";
import { useSetupModal } from "../../hooks/useSetupModal";
import {
  ActivityOptionGroup,
  TimeOptionGroup,
} from "../common/SetupOptionGroups";

import * as S from "../common/SetupModal.styled";
import * as C from "../common/SessionConfirmModal.styled";

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

export function BrainResetFeedbackModal({
  onComplete,
  slotId = null,
}) {
  const [conditionChange, setConditionChange] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isSubmitting) return;

    if (!conditionChange || !difficulty) {
      window.alert("현재 상태 변화와 동작 난이도를 하나씩 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    saveFeedback({
      conditionChange,
      difficulty,
    });

    try {
      if (slotId) {
        const difficultyFeedback = DIFFICULTY_FEEDBACK_BY_LABEL[difficulty];
        await submitSessionFeedback({
          recoverySlotId: slotId,
          recoveryFeeling: RECOVERY_FEELING_BY_LABEL[conditionChange],
          difficultyFeedback,
        });

        const slot = await getRecoverySlot(slotId);
        applyDifficultyFeedbackToSlot({
          slotId,
          difficultyFeedback,
          fallbackRoutines: slot?.routine_instances ?? [],
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

  return (
    <S.Overlay>
      <S.Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="brain-reset-feedback-title"
      >
        <S.SmallLabel>
          화면을 끄지 않고 휴식하기, Brainfit
        </S.SmallLabel>

        <S.Title id="brain-reset-feedback-title">
          모든 세션 완료! 휴식 루틴은 어떠셨나요?
        </S.Title>

        <S.Description>
          피드백을 반영하여
          <br />
          다음에는 더 딱 맞는 휴식 루틴을 추천해 드릴게요.
        </S.Description>

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

        <S.SectionLabel $marginTop>동작 난이도</S.SectionLabel>
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

        <S.BottomArea>
          <S.ButtonGroup>
            <S.PrimaryButton
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "다음"}
            </S.PrimaryButton>
          </S.ButtonGroup>
        </S.BottomArea>
      </S.Modal>
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

    const result = await setup.completeSetup("reset");

    if (result?.errorMessage) {
      window.alert(result.errorMessage);
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
      <S.Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="next-rest-setup-title"
      >
        <S.SmallLabel>
          화면을 끄지 않고 휴식하기, Brainfit
        </S.SmallLabel>

        <S.Title id="next-rest-setup-title">
          다음 휴식 알림 시간 설정
        </S.Title>

        <S.Description>
          분산된 주의를 바로잡고 깊이 몰입할 수 있도록 미리 활동과 시간을 세팅해 주세요.
          <br />
          설정한 시간이 지나면 Brainfit이<br />잊지 않고 휴식 알림을 보내드려요.
        </S.Description>

        <S.SectionLabel>활동 선택</S.SectionLabel>
        <ActivityOptionGroup
          options={ACTIVITY_OPTIONS}
          selectedActivity={setup.selectedActivity}
          onSelectActivity={(option) =>
            setup.setSelectedActivity(
              setup.selectedActivity === option ? "" : option
            )
          }
          isActivityInputOpen={setup.isActivityInputOpen}
          customActivity={setup.customActivity}
          onCustomActivityChange={setup.setCustomActivity}
          onOpenActivityInput={setup.openActivityInput}
          onSubmitCustomActivity={setup.submitCustomActivity}
        />

        <S.SectionLabel $marginTop>활동 시간</S.SectionLabel>
        <TimeOptionGroup
          options={TIME_OPTIONS}
          selectedTime={setup.selectedTime}
          onSelectTime={(option) =>
            setup.setSelectedTime(
              setup.selectedTime === option ? "" : option
            )
          }
          isTimeInputOpen={setup.isTimeInputOpen}
          customTime={setup.customTime}
          onCustomTimeChange={setup.setCustomTime}
          onOpenTimeInput={setup.openTimeInput}
          onSubmitCustomTime={setup.submitCustomTime}
        />

        <S.BottomArea>
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
        </S.BottomArea>
      </S.Modal>
    </S.Overlay>
  );
}

export function NextRestScheduledModal({
  onConfirm,
}) {
  return (
    <S.Overlay>
      <C.Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="next-rest-scheduled-title"
      >
        <C.CheckIcon>
          <img src={StreamLineIcon} alt="" aria-hidden="true" />
        </C.CheckIcon>

        <C.Title id="next-rest-scheduled-title">
          다음 휴식이 예정되어 있어요
          <br />
          시간에 맞춰 다시 알려드릴게요.
        </C.Title>

        <C.Description>
          설정된 시간이 되면<br />휴식 알림이 자동으로 전송돼요.
        </C.Description>

        <C.SingleButtonRow>
          <C.StartButton type="button" onClick={onConfirm}>
            확인
          </C.StartButton>
        </C.SingleButtonRow>
      </C.Modal>
    </S.Overlay>
  );
}
