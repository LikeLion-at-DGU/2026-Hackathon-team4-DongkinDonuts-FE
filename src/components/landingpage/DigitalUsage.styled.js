import styled from "styled-components";

export const Container = styled.div`
    width: 100%;
`;

export const UsageCard = styled.div`
    width: 100%;
    padding: 35px 32px 34px;

    box-sizing: border-box;

    border: 1px solid rgba(166, 166, 166, 0.7);
    border-radius: 31px;

    background: rgba(217, 217, 217, 0.15);
`;

export const CardRow = styled.div`
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 32px;

    width: 100%;

    margin-top: 32px;
`;

export const InfoCard = styled.div`
    position: relative;

    width: 100%;

    height: 513px;

    padding: 40px 45px 27px;

    box-sizing: border-box;

    border: 1.091px solid rgba(166, 166, 166, 0.7);
    border-radius: 31.7px;

    background: #ffffff;
`;

export const CardTitle = styled.h3`
    margin: 0;

    display: flex;
    align-items: center;
    gap: 12px;

    font-family: Poppins;
    font-size: 30px;
    font-weight: 600;
    line-height: 40.232px;
    letter-spacing: -0.306px;

    color: #000000;

    svg {
        display: block;
        flex-shrink: 0;
    }
`;

/* =========================
   입력 전 EMPTY 상태
========================= */

export const EmptyContent = styled.div`
    position: absolute;

    top: 105px;
    left: 32px;
    right: 32px;
    bottom: 40px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
`;

export const EmptyIcon = styled.div`
    width: ${({ $circle }) =>
        $circle ? "66px" : "auto"};

    height: ${({ $circle }) =>
        $circle ? "66px" : "auto"};

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 44px;

    border: ${({ $circle }) =>
        $circle
            ? "1px solid #d9d9d9"
            : "none"};

    border-radius: ${({ $circle }) =>
        $circle ? "50%" : "0"};

    box-sizing: border-box;

    svg {
        display: block;
    }
`;

export const EmptyTitle = styled.p`
    margin: 0;

    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;
    line-height: 29.247px;
    letter-spacing: -0.2px;

    color: #646464;

    white-space: nowrap;
`;

export const EmptyDescription = styled.p`
    margin: 28px 0 0;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: -0.14px;

    color: #aaaaaa;
`;

/* =========================
   분석 완료 공통 영역
========================= */

export const ResultContent = styled.div`
    margin-top: 9px;
`;

/* =========================
   왼쪽 분석 결과
========================= */

export const StatRow = styled.div`
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 14px;
    margin-top: 60px;
    margin-bottom: 29px;
`;

export const StatBox = styled.div`
    width: 138px;
    height: 100px;

    flex-shrink: 0;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background: #ffffff;

    border: 1.09145px solid rgba(166, 166, 166, 0.7);
    border-radius: 15px;

    strong {
        margin: 0;

        font-family: Poppins;
        font-size: 27px;
        font-weight: 500;
        line-height: 32px;

        color: #343434;
    }

    span {
        margin: 0;

        font-family: Poppins;
        font-size: 16px;
        font-weight: 500;
        line-height: 32px;

        color: rgba(0, 0, 0, 0.6);

        white-space: nowrap;
    }
`;

export const AnalysisBox = styled.div`
    width: 100%;
    height: 145px;

    padding: 27px 20px;

    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;

    border: 1.091px solid rgba(166, 166, 166, 0.7);
    border-radius: 15px;

    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 32px;

    color: #454545;

    p {
        margin: 0;
    }

    p + p {
        margin-top: 6px;
    }

    strong {
        color: #3355fa;
        font-weight: 600;
    }
`;

/* =========================
   오른쪽 추천 휴식 일정
========================= */

export const ScheduleDescription = styled.p`
    margin: 0 50px 50px;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    letter-spacing: 0.14px;

    color: #868383;
`;

export const ScheduleList = styled.div`
    position: relative;

    display: flex;
    flex-direction: column;

    gap: 56px;

    padding-left: 50px;

    &::before {
        content: "";

        position: absolute;

        left: 55px;
        top: 10px;
        bottom: 10px;

        width: 1px;

        background: #d5d5d5;
    }
`;

export const ScheduleItem = styled.div`
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
`;

export const TimeArea = styled.div`
    display: flex;
    align-items: center;

    gap: 28px;

    font-family: Poppins;
    font-size: 27px;
    font-weight: 500;
    line-height: 26px;

    color: #949191;
`;

export const Circle = styled.span`
    width: 17px;
    height: 17px;

    flex-shrink: 0;
    box-sizing: border-box;

    border: 2px solid #8f8f8f;
    border-radius: 50%;

    background: #ffffff;
`;

export const AlarmArea = styled.div`
    display: flex;
    align-items: center;

    gap: 10px;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;

    color: #7b7878;
`;

export const Toggle = styled.div`
    position: relative;

    width: 42px;
    height: 22px;

    flex-shrink: 0;

    border-radius: 999px;

    background: ${({ $active }) =>
    $active ? "#76ee59" : "#d4d4d4"};
`;

export const ToggleCircle = styled.span`
    position: absolute;

    top: 3px;
    left: ${({ $active }) =>
    $active ? "23px" : "3px"};

    width: 16px;
    height: 16px;

    border-radius: 50%;

    background: #ffffff;
`;

/* =========================
   카드 하단 설명
========================= */

export const Caption = styled.p`
    position: absolute;

    left: 32px;
    bottom: 27px;

    margin: 0;

    font-family: Poppins;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;

    color: #868383;
`;

/* =========================
   하단 버튼
========================= */

export const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;

    gap: 26px;

    margin-top: 32px;
`;

export const SaveButton = styled.button`
    width: 136px;
    height: 66px;

    border: 0.769px solid rgba(166, 166, 166, 0.7);
    border-radius: 16px;

    background: #fafafa;
    color: #000000;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;
    line-height: 30.929px;
    letter-spacing: -0.21px;

    cursor: pointer;
`;

export const CreateButton = styled.button`
    width: 350px;
    height: 66px;

    padding: 18px 33px;

    border: none;
    border-radius: 16px;

    background: #404040;
    color: #ffffff;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;
    line-height: 30.929px;
    letter-spacing: -0.21px;

    cursor: pointer;

    &:hover {
        background: #333333;
    }
`;

export const EditButton = styled.button`
    width: 136px;
    height: 66px;

    border: 0.769px solid rgba(166, 166, 166, 0.7);
    border-radius: 16px;

    background: #fafafa;
    color: #000000;

    font-family: Poppins;
    font-size: 21px;
    font-weight: 500;
    line-height: 30.929px;
    letter-spacing: -0.21px;

    cursor: pointer;

    &:hover {
        background: #f2f2f2;
    }
`;