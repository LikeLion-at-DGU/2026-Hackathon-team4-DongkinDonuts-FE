import * as S from "./SetupModal.styled";

// 활동 선택 옵션 버튼 + "+ 직접입력" 커스텀 입력 토글.
// ActivityStep(온보딩)과 NextRestSetupModal(다음 휴식 알림 설정)이 동일한 마크업을 쓴다.
export function ActivityOptionGroup({
    options,
    selectedActivity,
    onSelectActivity,
    isActivityInputOpen,
    customActivity,
    onCustomActivityChange,
    onOpenActivityInput,
    onSubmitCustomActivity,
}) {
    return (
        <S.OptionGroup>
            {options.map((option) => (
                <S.OptionButton
                    key={option}
                    type="button"
                    $selected={selectedActivity === option}
                    onClick={() => onSelectActivity(option)}
                >
                    {option}
                </S.OptionButton>
            ))}

            {isActivityInputOpen ? (
                <S.CustomInput
                    autoFocus
                    value={customActivity}
                    placeholder="활동 입력"
                    onChange={(e) => onCustomActivityChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSubmitCustomActivity();
                        }
                    }}
                    onBlur={onSubmitCustomActivity}
                />
            ) : (
                <S.OptionButton
                    type="button"
                    onClick={onOpenActivityInput}
                    $selected={
                        customActivity !== "" &&
                        selectedActivity === customActivity
                    }
                >
                    {customActivity || "+ 직접입력"}
                </S.OptionButton>
            )}
        </S.OptionGroup>
    );
}

// 활동 시간 선택 옵션 버튼 + "+ 직접입력" 커스텀 입력 토글.
// 입력값 검증(숫자 제한, 최소 시간 등)과 버튼 라벨 포맷은 호출부 책임으로 남겨둔다
// (ActivityStep은 45분 최소 검증이 있고, NextRestSetupModal은 없음 — 동작 차이 유지).
export function TimeOptionGroup({
    options,
    selectedTime,
    onSelectTime,
    isTimeInputOpen,
    customTime,
    onCustomTimeChange,
    onOpenTimeInput,
    onSubmitCustomTime,
    inputMode,
    customButtonLabel,
}) {
    return (
        <S.OptionGroup>
            {options.map((option) => (
                <S.OptionButton
                    key={option}
                    type="button"
                    $selected={selectedTime === option}
                    onClick={() => onSelectTime(option)}
                >
                    {option}
                </S.OptionButton>
            ))}

            {isTimeInputOpen ? (
                <S.CustomInput
                    autoFocus
                    inputMode={inputMode}
                    value={customTime}
                    placeholder="시간 입력"
                    onChange={(e) => onCustomTimeChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSubmitCustomTime();
                        }
                    }}
                    onBlur={onSubmitCustomTime}
                />
            ) : (
                <S.OptionButton
                    type="button"
                    onClick={onOpenTimeInput}
                    $selected={
                        customTime !== "" && selectedTime === customTime
                    }
                >
                    {customButtonLabel
                        ? customButtonLabel(customTime)
                        : customTime || "+ 직접입력"}
                </S.OptionButton>
            )}
        </S.OptionGroup>
    );
}
