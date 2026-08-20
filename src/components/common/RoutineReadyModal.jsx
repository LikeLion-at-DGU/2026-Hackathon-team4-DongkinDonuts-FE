import * as S from "./SessionConfirmModal.styled";

function RoutineReadyModal({
    onClose,
}) {
    return (
        <S.Overlay>
            <S.Modal>
                <S.CheckIcon>
                    ✓
                </S.CheckIcon>

                <S.Title>
                    지금 입력한 상태에 맞는
                    <br />
                    맞춤 휴식 루틴이 준비됐어요
                </S.Title>

                <S.Description>
                    예정된 시간에 맞춰 알려드릴게요
                </S.Description>

                <S.ButtonRow>
                    <S.CancelButton
                        type="button"
                        onClick={onClose}
                    >
                        취소
                    </S.CancelButton>

                    <S.StartButton
                        type="button"
                        onClick={onClose}
                    >
                        확인
                    </S.StartButton>
                </S.ButtonRow>
            </S.Modal>
        </S.Overlay>
    );
}

export default RoutineReadyModal;