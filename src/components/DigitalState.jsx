import * as S from "./DigitalState.styled";

function DigitalState() {
    return (
        <S.DigitalSection>
            <S.DigitalHeader>
                <S.DigitalTitle>
                    My Digital State
                </S.DigitalTitle>

                <S.DigitalDescription>
                    어쩌고어쩌고
                </S.DigitalDescription>
            </S.DigitalHeader>

            <S.DigitalResult>
                <S.BlurredDigitalText>
                    오늘의 움직임 분석 결과 집중도와 반응 속도는 안정적인 흐름을 보였어요.
                    <br />
                    손의 움직임은 이전 루틴보다 부드러워졌으며 시선 유지 시간도 증가했어요.
                    <br />
                    오늘은 짧은 집중 루틴과 호흡 루틴을 함께 진행하는 것을 추천해요.
                </S.BlurredDigitalText>

                <S.LockIcon>
                    {/* 여기 svg도 지금 LandingPage에 있는 거 그대로 복붙 */}
                </S.LockIcon>

                <S.ResultTitle>
                    디지털 사용 데이터를 입력해주세요
                </S.ResultTitle>

                <S.ResultDescription>
                    데이터를 입력하면
                    <br />
                    맞춤 타이머를 세팅할 수 있어요
                </S.ResultDescription>

                <S.ResultButton>
                    입력하기
                </S.ResultButton>
            </S.DigitalResult>
        </S.DigitalSection>
    );
}

export default DigitalState;