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
    margin-bottom: 30px;
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
    height: 44px;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    margin-bottom: 18px;

    position: relative;
    z-index: 10;

    flex-shrink: 0;
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

export const DateSelectorWrapper = styled.div`
    position: relative;
`;

export const DateText = styled.button`
    min-width: 190px;

    padding: 0;

    border: none;
    background: transparent;

    text-align: center;

    font-family: Poppins;
    font-size: 16px;
    font-weight: 500;

    color: #333333;

    cursor: pointer;
`;

export const Calendar = styled.div`
    position: absolute;

    top: 54px;
    right: 0;

    z-index: 50;

    width: 290px;

    padding: 18px;

    box-sizing: border-box;

    background: #ffffff;

    border: 1px solid #e5e5e5;
    border-radius: 16px;

    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
`;

export const CalendarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 18px;
`;

export const CalendarTitle = styled.div`
    font-family: Poppins;
    font-size: 16px;
    font-weight: 600;

    color: #24272a;
`;

export const CalendarArrow = styled.button`
    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: transparent;

    color: #777;

    font-size: 24px;

    cursor: pointer;

    &:hover {
        background: #f5f5f5;
        color: #222;
    }
`;

export const WeekRow = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    margin-bottom: 8px;

    span {
        text-align: center;

        font-family: Poppins;
        font-size: 12px;
        font-weight: 500;

        color: #9a9a9a;
    }

    span:first-child,
    span:last-child {
        color: #e04141;
    }
`;

export const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    row-gap: 6px;
`;

export const CalendarDay = styled.button`
    width: 34px;
    height: 34px;

    justify-self: center;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: ${({ $active }) =>
        $active ? "#242424" : "transparent"};

    color: ${({ $active }) =>
        $active ? "#ffffff" : "#333333"};

    font-family: Poppins;
    font-size: 13px;
    font-weight: ${({ $active }) =>
        $active ? 600 : 400};

    cursor: pointer;

    &:hover {
        background: ${({ $active }) =>
            $active ? "#242424" : "#f2f2f2"};
    }
`;

export const EmptyDay = styled.div`
    width: 34px;
    height: 34px;
`;

export const TableViewport = styled.div`
    width: 1280px;
    height: 530px;

    position: relative;

    overflow-y: auto;
    overflow-x: hidden;

    background: #ffffff;

    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);

    scrollbar-width: thin;
    scrollbar-color: #cfcfcf transparent;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: #cfcfcf;
        border-radius: 10px;
    }
`;