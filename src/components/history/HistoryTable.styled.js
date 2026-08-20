import styled from "styled-components";

export const Table = styled.table`
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;

    background: #ffffff;
`;

export const TableHead = styled.thead`
    position: sticky;
    top: 0;

    z-index: 10;

    background: #fafafa;

    th {
        height: 54px;
        padding: 16px;

        box-sizing: border-box;

        font-family: "SUIT", sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: #4f5459;

        text-align: center;

        background: #fafafa;
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
    width: 210px;
    text-align: left; 
    padding-left: 15px !important;
`;

export const StatusHeader = styled.th`
    width: 116px;
    text-align: left; 
`;

export const NoteHeader = styled.th`
    width: 256px;
`;

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

    font-family: "SUIT", sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;

    color: #24272a;
`;

export const ActivityCell = styled.td`
    padding: 16px;
    text-align: center;

    font-family: "SUIT", sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;

    color: #444444;
`;

export const RoutineCell = styled.td`
    padding: 16px;
    text-align: center;
    font-family: "SUIT", sans-serif;
    font-size: 17px;
    font-weight: 500;
    line-height: 150%;

    color: #24272a;
`;

export const StatusCell = styled.td`
    padding: 17px;
    padding-left: 8px;

    text-align: center;
`;

export const NoteCell = styled.td`
    padding: 16px;

    font-family: "SUIT", sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;

    color: #444444;

    text-align: center;
`;

export const RoutineBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 35px;

    padding: 3px 12px;

    border-radius: 20px;

    background: #f0f0f0;

    font-family: "SUIT", sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 150%;

    color: #24272a;

    white-space: nowrap;
`;

export const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-width: 45px;
    height: 22px;

    padding: 2px 8px;

    border-radius: 16px;

    font-size: 15px;
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