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

export const TopArea = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 43px;
`;

export const Title = styled.h3`
    margin: 0;
    font-family: Poppins;
    font-size: 30px;
    font-weight: 600;
    line-height: 40.232px; 
    letter-spacing: -0.306px;
    color: #000;
`;

export const Description = styled.p`
    margin: 10px 0 0;

    font-family: Poppins;
    font-size: 19px;
    font-weight: 400;
    color: #949191;
    line-height: 32.186px;
    letter-spacing: -0.196px;
`;

export const CheckGuide = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;

    font-family: Poppins;
    font-size: 13px;
    font-weight: 500;
    color: #4F5459;
`;

export const GuideItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const GuideBox = styled.div`
    width: 17px;
    height: 17px;

    display: flex;
    align-items: center;
    justify-content: center;

    box-sizing: border-box;

    border: 1px solid ${({ $checked }) =>
        $checked ? "#9A9A9A" : "#D5D5D5"};

    border-radius: 4px;

    background: ${({ $checked }) =>
        $checked ? "#9A9A9A" : "#FFFFFF"};

    color: #FFFFFF;

    font-size: 12px;
    font-weight: 700;
    line-height: 1;
`;


export const TableScroll = styled.div`
    width: 100%;
    height: 400px;

    overflow-y: auto;
    overflow-x: hidden;

    border: none;
    background: #ffffff;

    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.05);

    /* 스크롤은 가능 + 스크롤바 숨기기 */
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    font-family: Poppins;

    th,
    td {
        height: 55px;

        border-bottom: 1px solid #eeeeee;

        text-align: center;
        vertical-align: middle;

        font-weight: 600;
        line-height: 140%;
        color: #4F5459;
    }

    th {
        position: sticky;
        top: 0;

        z-index: 2;

        background: #f7f7f7;

        font-size: 14px;
        font-weight: 600;
        line-height: 140%; 
        color: #4F5459;
    }

    th:first-child,
    td:first-child {
        width: 220px;
    }

    th:last-child,
    td:last-child {
        width: 140px;
    }

    th.weekend {
        color: #ef4848;
    }
`;

export const Checkbox = styled.input`
    width: 17px;
    height: 17px;

    accent-color: #8f8f8f;

    cursor: pointer;
`;

export const RowButton = styled.button`
    width: 55px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0 auto;
    padding: 0;

    border: 1px solid
        ${({ $selected }) => ($selected ? "#9A9A9A" : "#BDBDBD")};
    border-radius: 6px;

    background: ${({ $selected }) =>
        $selected ? "#9A9A9A" : "#FFFFFF"};

    color: ${({ $selected }) =>
        $selected ? "#FFFFFF" : "#4F5459"};

    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;

    cursor: pointer;
`;

export const TableFooter = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;

    padding-top: 16px;

    font-family: Poppins;
    font-size: 11px;
    color: #999999;
`;

export const SelectedText = styled.span`
    justify-self: start;
`;

export const ScrollGuide = styled.span`
    justify-self: center;
`;

export const ResetButton = styled.button`
    justify-self: end;

    border: none;
    background: transparent;

    color: #999999;

    font-family: Poppins;
    font-size: 11px;

    cursor: pointer;
`;

export const CardRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 28px;

    margin-top: 30px;
`;

export const InfoCard = styled.div`
    position: relative;

    min-height: 335px;

    padding: 28px 30px;

    box-sizing: border-box;

    border: 1px solid #d8d8d8;
    border-radius: 28px;

    background: #ffffff;
`;

export const CardTitle = styled.h3`
    margin: 0;

    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;

    color: #222222;
`;

export const AutoAlarm = styled.div`
    position: absolute;
    top: 29px;
    right: 28px;

    display: flex;
    align-items: center;

    gap: 10px;

    font-family: Poppins;
    font-size: 11px;

    color: #999999;
`;

export const DisabledToggle = styled.div`
    position: relative;

    width: 38px;
    height: 20px;

    border-radius: 999px;

    background: #62dd63;

    &::after {
        content: "";

        position: absolute;

        top: 2px;
        right: 2px;

        width: 16px;
        height: 16px;

        border-radius: 50%;

        background: #ffffff;
    }
`;

export const EmptyContent = styled.div`
    height: 250px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
`;

export const EmptyIcon = styled.div`
    margin-bottom: 20px;

    font-size: 38px;
    color: #aaaaaa;
`;

export const EmptyTitle = styled.p`
    margin: 0;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;

    color: #555555;
`;

export const EmptyDescription = styled.p`
    margin: 20px 0 0;

    font-family: Poppins;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.7;

    color: #aaaaaa;
`;

export const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;

    gap: 14px;

    margin-top: 28px;
`;

export const SaveButton = styled.button`
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

export const CreateButton = styled.button`
    min-width: 260px;
    height: 50px;

    padding: 0 24px;

    border: none;
    border-radius: 10px;

    background: #2e2e2e;
    color: #ffffff;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;

    cursor: pointer;

    &:hover {
        background: #111111;
    }
`;