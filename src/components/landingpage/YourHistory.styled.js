import styled from "styled-components";

export const Section = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: center;
    margin-top: 66px;
    margin-bottom: 62px;
`;

export const Header = styled.div`
    width: 1280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 60px;
`;

export const Label = styled.p`
    margin: 0;
    text-align: center;
    font-family: Poppins;
    font-size: 24px;
    font-weight: 400;
    line-height: 30px;
    color: #000;
    letter-spacing: -0.221px;
`;

export const Title = styled.h2`
    text-align: center;
    font-family: Poppins;
    font-size: 32px;
    font-weight: 700;
    line-height: 36px;
    color: #000;
    letter-spacing: -0.295px;
`;

export const TableTop = styled.div`
    width: 1280px;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    margin-bottom: 18px;
`;

export const DateSelector = styled.div`
    height: 44px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 12px;

    border: 1px solid #d8d8d8;
    border-radius: 24px;

    background: #ffffff;
`;

export const DateButton = styled.button`
    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    background: transparent;

    font-family: Poppins;
    font-size: 30px;
    font-weight: 300;
    line-height: 1;

    color: #9a9a9a;

    cursor: pointer;

    &:hover {
        color: #222222;
    }
`;

export const DateText = styled.span`
    min-width: 190px;

    text-align: center;

    font-family: Poppins;
    font-size: 16px;
    font-weight: 500;

    color: #333333;
`;

export const Table = styled.table`
    width: 1280px;
    table-layout: fixed;
    border-collapse: collapse;
    gap: 19px;

    background: #ffffff;
`;

export const TableHead = styled.thead`
    background: #fafafa;

    th {
        height: 54px;
        font-family: Inter;
        padding: 16px;

        font-size: 16px;
        font-weight: 600;
        color: #4F5459;

        text-align: left;
    }
`;

export const TimeHeader = styled.th`
    width: 162px;
    text-align: center !important;
`;

export const ActivityHeader = styled.th`
    width: 256px;
`;

export const RoutineHeader = styled.th`
    width: 256px;
`;

export const StatusHeader = styled.th`
    width: 116px;
    text-align: center !important;
`;

export const NoteHeader = styled.th`
    width: 256px;
`;

/* =========================
   Row
========================= */

export const TableRow = styled.tr`
    height: 56px;

    background: #ffffff;

    &:not(:last-child) {
        border-bottom: 1px solid #f1f1f1;
    }
`;

export const TimeCell = styled.td`
    padding: 16px;

    text-align: center;
    font-family: Inter;
    font-size: 15px;
    font-weight: 400;
    color: #24272A;
    line-height: 150%;
`;

export const ActivityCell = styled.td`
    padding: 16px;
    font-family: Inter;
    line-height: 150%;
    font-size: 15px;
    font-weight: 400;
    color: #444444;
`;

export const RoutineCell = styled.td`
    padding: 16px;
    align-items: center;
    align-self: stretch;

    font-size: 13px;
    color: #24272A;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
    font-family: Poppins;
`;

export const StatusCell = styled.td`
    padding: 16px;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

export const NoteCell = styled.td`
    display: flex;
    padding: 16px;
    align-items: flex-start;
    align-self: stretch;

    font-size: 15px;
    font-weight: 400;
    color: #24272A;
    line-height: 150%;
`;

/* =========================
   Routine badge
========================= */

export const RoutineBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 36px;

    padding: 8px 14px;

    border-radius: 20px;

    background: #f0f0f0;

    font-size: 13px;
    font-weight: 500;
    color: #24272A;
    font-family: Poppins;
    line-height: 150%;
    white-space: nowrap;
`;

/* =========================
   Status badge
========================= */

export const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-width: 40px;
    height: 22px;

    padding: 2px 8px;

    border-radius: 16px;
    background: #EFF8FF;

    font-size: 13px;
    font-weight: 400;
    line-height: 140%;

    white-space: nowrap;

    color: ${({ $status }) => {
        switch ($status) {
            case "완료":
                return "#175CD3";
            case "취소":
                return "#C11574";
            case "예정":
                return "#027A48";
            case "미실행":
                return "#B54708";
            default:
                return "#666666";
        }
    }};

    background: ${({ $status }) => {
        switch ($status) {
            case "완료":
                return "#EFF8FF";
            case "취소":
                return "#FDF2FA";
            case "예정":
                return "#ECFDF3";
            case "미실행":
                return "#FFFAEB";
            default:
                return "#F3F3F3";
        }
    }};
`;