import { useState } from "react";
import {
    createContextSnapshot,
    createNextActivityPlan,
    CONDITION_LABEL_TO_STATE_CODE,
    getTodayContextSnapshot,
    activityLabelToCode,
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
        if (!selectedCondition) {
            window.alert("현재 상태를 하나 선택해주세요.");
            return;
        }

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
    //
    // 단, reset 모드는 상태 선택 UI 자체가 없어서 "오늘 스냅샷이 이미 있다"고 가정하는데,
    // 실제로는 없을 수 있다(온보딩 모달을 건너뛰었거나, hasSeenSetupModal이 세션에 남아있어
    // 재방문 시 초기 온보딩이 자동으로 안 뜨는 경우 등). 그 상태로 "내 계획 다시 설정"만
    // 반복해도 AI 생성이 "오늘의 상태 스냅샷이 필요합니다"로 매번 실패하는 버그가 있었다.
    // 그래서 reset 모드에선 완료 직전에 오늘 스냅샷 존재 여부를 확인하고, 없으면 중립
    // 상태("아직 괜찮아요")로 하나 만들어서 AI 생성이 항상 성공하도록 한다.
    const completeSetup = async (mode) => {
        console.log("completeSetup 호출됨");
        console.log("mode:", mode);
        console.log("selectedCondition:", selectedCondition);
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            let contextSnapshotId = null;

            // 상태가 선택돼 있으면 mode와 상관없이 오늘 상태 스냅샷 생성
            if (selectedCondition) {
                const stateCode =
                    CONDITION_LABEL_TO_STATE_CODE[
                    selectedCondition
                    ];

                console.log("선택 상태:", selectedCondition);
                console.log("변환 상태 코드:", stateCode);

                if (stateCode) {
                    const snapshot =
                        await createContextSnapshot([
                            stateCode,
                        ]);

                    contextSnapshotId =
                        snapshot.id;
                }
            } else if (mode === "reset") {
                const todaySnapshot = await getTodayContextSnapshot();
                if (!todaySnapshot) {
                    const fallbackStateCode = CONDITION_LABEL_TO_STATE_CODE["아직 괜찮아요"];
                    if (fallbackStateCode) {
                        await createContextSnapshot([fallbackStateCode]);
                    }
                }
            }

            // 활동/시간 입력이 있으면 다음 활동 계획 생성
            if (
                selectedActivity ||
                selectedTime
            ) {
                await createNextActivityPlan({
                    activityTags:
                        selectedActivity
                            ? [
                                activityLabelToCode(
                                    selectedActivity
                                ),
                            ]
                            : [],

                    expectedActivityMinutes:
                        timeLabelToMinutes(
                            selectedTime
                        ),

                    contextSnapshotId,
                });
            }

            return null;
        } catch (error) {
            console.error(
                "설정 저장 실패:",
                error
            );

            const message =
                error?.message ??
                "설정을 저장하지 못했습니다.";

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
