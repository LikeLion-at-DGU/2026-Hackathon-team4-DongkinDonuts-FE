import { useState } from "react";

import DigitalUsage from "./DigitalUsage";
import LockIcon from "../../assets/icons/LockIcon.svg";
import * as S from "./DigitalState.styled";

function DigitalState() {
    const [digitalStep, setDigitalStep] = useState("locked");

    const [selected, setSelected] = useState({});

    return (
        <S.DigitalSection>
            <S.DigitalHeader>
                <S.DigitalTitle>
                    My Digital State
                </S.DigitalTitle>

                <S.DigitalDescription>
                    평소 PC 사용 패턴을 입력하면 Brainfit이 집중시간과 사용 습관을 분석해
                    <br />
                    적정 휴식 시간을 추천하고, 나에게 맞는 휴식 일정을 자동으로 설정해줘요.
                </S.DigitalDescription>
            </S.DigitalHeader>

            {digitalStep === "locked" && (
                <S.DigitalResult>
                    <S.BlurredDigitalText>
                        오늘의 움직임 분석 결과 집중도와 반응 속도는 안정적인 흐름을 보였어요.
                        <br />
                        손의 움직임은 이전 루틴보다 부드러워졌으며 시선 유지 시간도 증가했어요.
                        <br />
                        오늘은 짧은 집중 루틴과 호흡 루틴을 함께 진행하는 것을 추천해요.
                    </S.BlurredDigitalText>

                    <S.LockIcon>
                        <img src={LockIcon} alt="잠금" />
                    </S.LockIcon>

                    <S.ResultTitle>
                        디지털 사용 데이터를 입력해주세요
                    </S.ResultTitle>

                    <S.ResultDescription>
                        데이터를 입력하면
                        <br />
                        맞춤 타이머를 세팅할 수 있어요
                    </S.ResultDescription>

                    <S.ResultButton
                        onClick={() => setDigitalStep("input")}
                    >
                        입력하기
                    </S.ResultButton>
                </S.DigitalResult>
            )}

            {digitalStep !== "locked" && (
                <DigitalUsage
                    mode={digitalStep}
                    selected={selected}
                    setSelected={setSelected}
                    onCreate={() => setDigitalStep("result")}
                    onEdit={() => setDigitalStep("input")}
                />
            )}
        </S.DigitalSection>
    );
}

export default DigitalState;