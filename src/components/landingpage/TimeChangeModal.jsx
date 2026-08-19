import CloseButton from "../../assets/icons/CloseButton.svg";

import { useTimeChangeModal } from "../../hooks/useTimeChangeModal";
import {
    RECOMMENDED_TIMES,
    HOURS,
    MINUTES,
} from "../../config/timeChangeConfig";

import * as S from "./TimeChangeModal.styled";

function TimeChangeModal({
    currentTime = "15:00",
    onClose,
    onSave,
}) {
    const {
        selectedTime,
        selectedHour,
        selectedMinute,
        repeat,
        hourRef,
        minuteRef,
        handleRecommendedTime,
        handleHourScroll,
        handleMinuteScroll,
        handleHourChange,
        handleMinuteChange,
        toggleRepeat,
        handleSave,
    } = useTimeChangeModal(currentTime, onSave, onClose);

    return (
        <S.Overlay onClick={onClose}>
            <S.ModalPositioner>
                <S.Modal onClick={(e) => e.stopPropagation()}>
                    <S.CloseButton type="button" onClick={onClose}>
                        <img src={CloseButton} alt="닫기" />
                    </S.CloseButton>

                    <S.Title>시간 변경하기</S.Title>

                    <S.Description>
                        원하는 리셋 시간을 선택하거나 직접 설정할 수 있어요.
                    </S.Description>

                    <S.Divider />

                    <S.Section>
                        <S.SectionTitle>추천 시간</S.SectionTitle>

                        <S.SectionDescription>
                            사용 패턴과 입력 내용을 바탕으로 설정한 최적의 시간이에요.
                        </S.SectionDescription>

                        <S.RecommendedTimes>
                            {RECOMMENDED_TIMES.map((time) => (
                                <S.TimeButton
                                    key={time}
                                    type="button"
                                    $active={selectedTime === time}
                                    onClick={() => handleRecommendedTime(time)}
                                >
                                    {time}
                                </S.TimeButton>
                            ))}
                        </S.RecommendedTimes>
                    </S.Section>

                    <S.Divider />

                    <S.Section>
                        <S.SectionTitle>직접 설정</S.SectionTitle>

                        <S.SectionDescription>
                            원하는 시간을 직접 설정할 수 있어요.
                        </S.SectionDescription>

                        <S.TimePicker>
                            <S.TimeColumn
                                ref={hourRef}
                                onScroll={handleHourScroll}
                            >
                                <S.PickerSpacer />

                                {HOURS.map((hour) => (
                                    <S.PickerItem
                                        key={hour}
                                        type="button"
                                        $active={selectedHour === hour}
                                        onClick={() => handleHourChange(hour)}
                                    >
                                        {hour}
                                    </S.PickerItem>
                                ))}

                                <S.PickerSpacer />
                            </S.TimeColumn>

                            <S.Colon>:</S.Colon>

                            <S.TimeColumn
                                ref={minuteRef}
                                onScroll={handleMinuteScroll}
                            >
                                <S.PickerSpacer />

                                {MINUTES.map((minute) => (
                                    <S.PickerItem
                                        key={minute}
                                        type="button"
                                        $active={selectedMinute === minute}
                                        onClick={() => handleMinuteChange(minute)}
                                    >
                                        {minute}
                                    </S.PickerItem>
                                ))}

                                <S.PickerSpacer />
                            </S.TimeColumn>

                            <S.SelectedLine />
                        </S.TimePicker>
                    </S.Section>

                    <S.Divider />

                    <S.RepeatRow>
                        <div>
                            <S.SectionTitle>반복 설정</S.SectionTitle>

                            <S.SectionDescription>
                                매일 같은 시간에 알림을 받을까요?
                            </S.SectionDescription>
                        </div>

                        <S.Toggle
                            type="button"
                            $active={repeat}
                            onClick={toggleRepeat}
                        >
                            <S.ToggleCircle $active={repeat} />
                        </S.Toggle>
                    </S.RepeatRow>

                    <S.Divider />

                    <S.ButtonRow>
                        <S.CancelButton
                            type="button"
                            onClick={onClose}
                        >
                            취소
                        </S.CancelButton>

                        <S.SaveButton
                            type="button"
                            onClick={handleSave}
                        >
                            저장하기
                        </S.SaveButton>
                    </S.ButtonRow>
                </S.Modal>
            </S.ModalPositioner>
        </S.Overlay>
    );
}

export default TimeChangeModal;
