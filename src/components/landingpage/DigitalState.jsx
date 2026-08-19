import { useState } from "react";

import DigitalUsage from "./DigitalUsage";

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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="43"
                            viewBox="0 0 35 43"
                            fill="none"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M17.1347 0C14.408 0 11.7931 1.08315 9.86504 3.01117C7.93701 4.9392 6.85386 7.55416 6.85386 10.2808V13.7958C5.79837 13.884 4.87016 14.07 4.01049 14.5086C2.62811 15.2119 1.50388 16.3347 0.798965 17.7163C0.356401 18.5877 0.172326 19.5276 0.0842046 20.5968C-3.64752e-08 21.6367 0 22.9213 0 24.5133V31.2967C0 32.8888 -3.64752e-08 34.1734 0.0842046 35.2132C0.172326 36.2824 0.358359 37.2223 0.800923 38.0918C1.50466 39.4745 2.62824 40.5988 4.01049 41.3033C4.87995 41.7459 5.81991 41.93 6.88911 42.0181C7.92894 42.1023 9.21355 42.1023 10.8056 42.1023H23.4637C25.0558 42.1023 26.3404 42.1023 27.3802 42.0181C28.4494 41.93 29.3894 41.7439 30.2588 41.3014C31.6415 40.5976 32.7658 39.4741 33.4703 38.0918C33.9129 37.2223 34.097 36.2824 34.1851 35.2132C34.2693 34.1734 34.2693 32.8888 34.2693 31.2967V24.5133C34.2693 22.9213 34.2693 21.6367 34.1851 20.5968C34.097 19.5276 33.911 18.5877 33.4684 17.7182C32.7646 16.3355 31.6411 15.2113 30.2588 14.5067C29.3992 14.07 28.4709 13.884 27.4155 13.7958V10.2808C27.4155 4.60188 22.8136 0 17.1347 0ZM24.4781 13.7077V10.2808C24.4781 8.3332 23.7044 6.46537 22.3272 5.08821C20.9501 3.71105 19.0823 2.93737 17.1347 2.93737C15.1871 2.93737 13.3192 3.71105 11.9421 5.08821C10.5649 6.46537 9.79123 8.3332 9.79123 10.2808V13.7077H24.4781Z"
                                fill="none"
                                stroke="#000"
                                strokeWidth="2"
                            />
                        </svg>
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