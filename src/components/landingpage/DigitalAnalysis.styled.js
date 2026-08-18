import styled from "styled-components";

export const Container = styled.div`
    width: 100%;
`;

export const UsagePreview = styled.div`
    width: 100%;

    padding: 30px 32px;

    box-sizing: border-box;

    border: 1px solid #d8d8d8;
    border-radius: 28px;

    background: #ffffff;
`;

export const PreviewTitle = styled.h3`
    margin: 0;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 600;

    color: #111111;
`;

export const PreviewDescription = styled.p`
    margin: 8px 0 20px;

    font-family: Poppins;
    font-size: 13px;

    color: #999999;
`;

export const PreviewBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 25px;

    border-radius: 15px;

    background: #fafafa;
`;

export const PreviewText = styled.span`
    font-family: Poppins;
    font-size: 14px;

    color: #777777;
`;

export const PreviewValue = styled.strong`
    font-family: Poppins;
    font-size: 15px;

    color: #333333;
`;

export const CardRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 28px;

    margin-top: 30px;
`;

export const ResultCard = styled.div`
    min-height: 335px;

    padding: 28px 30px;

    box-sizing: border-box;

    border: 1px solid #d8d8d8;
    border-radius: 28px;

    background: #ffffff;
`;

export const CardTitle = styled.h3`
    margin: 0 0 25px;

    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;

    color: #222222;
`;

export const StatRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;

    margin-bottom: 18px;
`;

export const StatBox = styled.div`
    min-height: 72px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 6px;

    border: 1px solid #dddddd;
    border-radius: 12px;

    strong {
        font-family: Poppins;
        font-size: 18px;
        font-weight: 500;

        color: #333333;
    }

    span {
        font-family: Poppins;
        font-size: 10px;

        color: #777777;
    }
`;

export const AnalysisBox = styled.div`
    padding: 18px;

    text-align: center;

    border: 1px solid #dddddd;
    border-radius: 12px;

    font-family: Poppins;
    font-size: 12px;
    line-height: 1.7;

    color: #555555;

    p {
        margin: 0;
    }

    p + p {
        margin-top: 5px;
    }

    strong {
        color: #4864ff;
        font-weight: 600;
    }
`;

export const ScheduleDescription = styled.p`
    margin: -10px 0 30px;

    font-family: Poppins;
    font-size: 11px;
    line-height: 1.6;

    color: #999999;
`;

export const ScheduleList = styled.div`
    display: flex;
    flex-direction: column;

    gap: 26px;
`;

export const ScheduleItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const TimeArea = styled.div`
    display: flex;
    align-items: center;

    gap: 16px;

    font-family: Poppins;
    font-size: 18px;

    color: #777777;
`;

export const Circle = styled.span`
    width: 9px;
    height: 9px;

    border: 2px solid #999999;
    border-radius: 50%;
`;

export const AlarmArea = styled.div`
    display: flex;
    align-items: center;

    gap: 10px;

    font-family: Poppins;
    font-size: 10px;

    color: #999999;
`;

export const Toggle = styled.div`
    position: relative;

    width: 38px;
    height: 20px;

    border-radius: 999px;

    background: #62dd63;
`;

export const ToggleCircle = styled.span`
    position: absolute;

    top: 2px;
    right: 2px;

    width: 16px;
    height: 16px;

    border-radius: 50%;

    background: #ffffff;
`;

export const Caption = styled.p`
    margin: 25px 0 0;

    font-family: Poppins;
    font-size: 10px;

    color: #aaaaaa;
`;

export const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;

    margin-top: 28px;
`;

export const EditButton = styled.button`
    width: 130px;
    height: 50px;

    border: 1px solid #c5c5c5;
    border-radius: 10px;

    background: #ffffff;

    color: #444444;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;

    cursor: pointer;
`;