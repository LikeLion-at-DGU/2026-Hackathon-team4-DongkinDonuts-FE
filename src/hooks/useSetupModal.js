import { useState } from "react";
import {
    CONDITION_LABEL_TO_STATE_CODE,
    activityLabelToCode,
    createContextSnapshot,
    createNextActivityPlan,
    timeLabelToMinutes,
} from "../api/context";

export const useSetupModal = () => {
    const [step, setStep] = useState(1);

    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [isActivityInputOpen, setIsActivityInputOpen] = useState(false);
    const [customActivity, setCustomActivity] = useState("");

    const [isTimeInputOpen, setIsTimeInputOpen] = useState(false);
    const [customTime, setCustomTime] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const goNext = () => {
        setStep(2);
    };

    const goPrev = () => {
        setStep(1);
    };

    const openActivityInput = () => {
        if (customActivity.startsWith("#")) {
            setCustomActivity(customActivity.slice(1));
        }

        setIsActivityInputOpen(true);
    };

    const submitCustomActivity = () => {
        const value = customActivity.trim();

        if (!value) {
            setIsActivityInputOpen(false);
            return;
        }

        const activityWithHash = value.startsWith("#")
            ? value
            : `#${value}`;

        setCustomActivity(activityWithHash);
        setSelectedActivity(activityWithHash);
        setIsActivityInputOpen(false);
    };

    const openTimeInput = () => {
        setIsTimeInputOpen(true);
    };

    const submitCustomTime = () => {
        const value = customTime.trim();

        if (!value) {
            setIsTimeInputOpen(false);
            return;
        }

        setSelectedTime(value);
        setIsTimeInputOpen(false);
    };

    // "완료" 버튼 클릭 시 실제 백엔드에 반영한다.
    // - mode === "initial": 상태(있으면) + 활동/시간(있으면) 둘 다 생성
    // - mode === "reset"("내 계획 다시 설정"): 상태는 건드리지 않고 활동/시간만 새로 생성
    //   (지금 상태 스냅샷은 그대로 두고 NextActivityPlan만 새로 쌓는다는 백엔드 설계에 맞춤)
    const completeSetup = async (mode) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            let contextSnapshotId = null;

            if (mode !== "reset" && selectedCondition) {
                const stateCode = CONDITION_LABEL_TO_STATE_CODE[selectedCondition];
                if (stateCode) {
                    const snapshot = await createContextSnapshot([stateCode]);
                    contextSnapshotId = snapshot.id;
                }
            }

            if (selectedActivity || selectedTime) {
                await createNextActivityPlan({
                    activityTags: selectedActivity ? [activityLabelToCode(selectedActivity)] : [],
                    expectedActivityMinutes: timeLabelToMinutes(selectedTime),
                    contextSnapshotId,
                });
            }

            return null;
        } catch (error) {
            console.error("설정 저장 실패:", error);
            const message = error?.message ?? "설정을 저장하지 못했습니다.";
            setSubmitError(message);
            return message;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
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
        submitError,
        completeSetup,
    };
};
