import * as S from "./SessionConfirmModal.styled";

function ScheduledSessionModal({
    onClose,
    onStart,
}) {
    return (
        <S.Overlay>
            <S.Modal>
                <S.Icon>
                    !
                </S.Icon>

                <S.Title>
                    이미 예정된 시간이 있어요
                </S.Title>

                <S.Description>
                    지금 휴식 루틴을 시작할까요?
                </S.Description>

                <S.SubDescription>
                    예정된 휴식 중 가장 가까운 일정이 취소돼요
                </S.SubDescription>

                <S.ButtonRow>
                    <S.CancelButton
                        type="button"
                        onClick={onClose}
                    >
                        취소
                    </S.CancelButton>

                    <S.StartButton
                        type="button"
                        onClick={onStart}
                    >
                        시작
                    </S.StartButton>
                </S.ButtonRow>
            </S.Modal>
        </S.Overlay>
    );
}

export default ScheduledSessionModal;