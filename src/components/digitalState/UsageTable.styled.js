import styled from "styled-components";
import { FONT_POPPINS } from "../../styles/fonts";

export const TopArea = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 43px;
`;

export const Title = styled.h3`
    margin: 0;

    font-family: ${FONT_POPPINS};
    font-size: 30px;
    font-weight: 600;
    line-height: 40.232px;
    letter-spacing: -0.306px;

    color: #000;
`;

export const Description = styled.p`
    margin: 10px 0 0;

    font-family: ${FONT_POPPINS};
    font-size: 19px;
    font-weight: 400;
    line-height: 32.186px;
    letter-spacing: -0.196px;

    color: #949191;
`;

export const CheckGuide = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;

    font-family: ${FONT_POPPINS};
    font-size: 13px;
    font-weight: 500;

    color: #4f5459;
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

    border: 1px solid
        ${({ $checked }) =>
            $checked ? "#9A9A9A" : "#D5D5D5"};

    border-radius: 4px;

    background: ${({ $checked }) =>
        $checked ? "#9A9A9A" : "#ffffff"};

    color: #ffffff;

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

    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const Table = styled.table`
    width: 100%;

    border-collapse: collapse;
    table-layout: fixed;

    font-family: ${FONT_POPPINS};

    th,
    td {
        height: 55px;

        border-bottom: 1px solid #eeeeee;

        text-align: center;
        vertical-align: middle;

        font-weight: 600;
        line-height: 140%;

        color: #4f5459;
    }

    th {
        position: sticky;
        top: 0;

        z-index: 2;

        background: #f7f7f7;

        font-size: 14px;
        font-weight: 600;
        line-height: 140%;

        color: #4f5459;
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

// 드래그로 여러 칸을 한번에 선택/해제할 때 실제로 마우스 이벤트를 받는 건
// td 전체 — 작은 체크박스만 클릭/드래그 대상이면 칸 사이를 지나갈 때 마우스가
// 자꾸 빗나가서 드래그가 뚝뚝 끊긴다. td를 통째로 히트 영역으로 쓰고, 안의
// Cell은 그 히트 영역 안에서 크게 그려주는 시각적 표시일 뿐이다.
export const CellTd = styled.td`
    cursor: ${({ $readOnly }) =>
        $readOnly ? "default" : "pointer"};

    user-select: none;
    -webkit-user-select: none;

    &:focus-visible {
        outline: 2px solid #4f5459;
        outline-offset: -2px;
    }
`;

export const Cell = styled.div`
    width: 36px;
    height: 36px;
    margin: 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;

    box-sizing: border-box;

    border: 1.5px solid
        ${({ $selected }) =>
            $selected ? "#9A9A9A" : "#D9D9D9"};

    border-radius: 10px;

    background: ${({ $selected }) =>
        $selected ? "#9A9A9A" : "#ffffff"};

    color: #ffffff;

    font-size: 15px;
    font-weight: 700;
    line-height: 1;

    transition:
        background 0.08s ease,
        border-color 0.08s ease,
        transform 0.05s ease;

    ${({ $readOnly, $selected }) =>
        !$readOnly &&
        `
        ${CellTd}:hover & {
            border-color: ${
                $selected ? "#9A9A9A" : "#B7B7B7"
            };
            background: ${
                $selected ? "#8A8A8A" : "#F3F3F3"
            };
        }

        ${CellTd}:active & {
            transform: scale(0.92);
        }
    `}
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
        ${({ $selected }) =>
            $selected ? "#9A9A9A" : "#BDBDBD"};

    border-radius: 6px;

    background: ${({ $selected }) =>
        $selected ? "#9A9A9A" : "#ffffff"};

    color: ${({ $selected }) =>
        $selected ? "#ffffff" : "#4F5459"};

    font-family: ${FONT_POPPINS};
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

    font-family: ${FONT_POPPINS};
    font-size: 11px;

    color: #999999;
`;

export const SelectedText = styled.span`
    justify-self: start;
    color: #949191;
    text-align: center;
    font-family: ${FONT_POPPINS};
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    letter-spacing: 0.32px;
`;

export const SelectedCount = styled.span`
    color: #bf2b2b;
    font-weight: 500;
`;

export const ScrollGuide = styled.span`
    justify-self: center;
    color: #868383;
    margin-top: 5px;
    text-align: center;
    font-family: ${FONT_POPPINS};
    font-size: 19.646px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0.196px;
`;

export const ResetButton = styled.button`
    justify-self: end;

    border: none;
    background: transparent;

    color: #949494;

    font-family: ${FONT_POPPINS};
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 30px; /* 187.5% */
    letter-spacing: 0.32px;
    border-bottom: 1px solid #949191;

    cursor: pointer;
`;