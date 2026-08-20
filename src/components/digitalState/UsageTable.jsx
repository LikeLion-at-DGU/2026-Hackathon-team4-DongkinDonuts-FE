import { useEffect, useRef } from "react";

import {
    DAYS,
    TIME_SLOTS,
} from "../../config/usageTableConfig";

import * as S from "./UsageTable.styled";

function UsageTable({
    selected,
    setCellValue,
    toggleRow,
    resetAll,
    readOnly = false,
}) {
    const selectedCount =
        Object.values(selected).filter(Boolean).length;

    // 마우스를 누른 채로 여러 칸을 쭉 지나가면 그 칸들이 한번에 선택/해제되게
    // 한다. 시작 칸을 누른 순간의 "반대값"을 드래그 내내 그대로 적용해서, 켜져
    // 있던 칸에서 드래그를 시작하면 지나가는 칸들을 전부 끄고, 꺼져 있던 칸에서
    // 시작하면 전부 켠다(칸마다 toggle하면 지나갈 때마다 반대로 튕겨서 드래그가
    // 안 먹힌다).
    const isDraggingRef = useRef(false);
    const dragValueRef = useRef(false);

    useEffect(() => {
        if (readOnly) return;

        const stopDragging = () => {
            isDraggingRef.current = false;
        };

        window.addEventListener("mouseup", stopDragging);

        return () => {
            window.removeEventListener("mouseup", stopDragging);
        };
    }, [readOnly]);

    const handleCellMouseDown = (rowIndex, colIndex, event) => {
        if (readOnly) return;

        // 네이티브 체크박스 클릭/드래그-텍스트-선택 동작은 막고, 드래그 로직이
        // 직접 상태를 바꾸게 한다(안 막으면 셀마다 change 이벤트가 따로 튀어서
        // 드래그 중간 칸들이 반영 안 되는 경우가 생김).
        event.preventDefault();

        const key = `${rowIndex}-${colIndex}`;
        const nextValue = !selected[key];

        dragValueRef.current = nextValue;
        isDraggingRef.current = true;

        setCellValue(rowIndex, colIndex, nextValue);
    };

    const handleCellMouseEnter = (rowIndex, colIndex) => {
        if (readOnly || !isDraggingRef.current) return;

        setCellValue(rowIndex, colIndex, dragValueRef.current);
    };

    return (
        <>
            <S.TopArea>
                <div>
                    <S.Title>
                        언제 PC를 주로 사용하시나요?
                    </S.Title>

                    <S.Description>
                        {readOnly
                            ? "입력한 PC 사용 패턴을 바탕으로 분석을 완료했어요."
                            : "요일별 사용 시간대를 선택하세요. 칸을 클릭해 켜고 끌 수 있어요."}
                    </S.Description>
                </div>

                <S.CheckGuide>
                    <S.GuideItem>
                        <S.GuideBox />
                        <span>미사용</span>
                    </S.GuideItem>

                    <S.GuideItem>
                        <S.GuideBox $checked>
                            ✓
                        </S.GuideBox>
                        <span>사용</span>
                    </S.GuideItem>
                </S.CheckGuide>
            </S.TopArea>

            <S.TableScroll>
                <S.Table>
                    <thead>
                        <tr>
                            <th>시간대</th>

                            {DAYS.map((day) => (
                                <th
                                    key={day}
                                    className={
                                        day === "일" ||
                                            day === "토"
                                            ? "weekend"
                                            : ""
                                    }
                                >
                                    {day}
                                </th>
                            ))}

                            <th>전체 선택</th>
                        </tr>
                    </thead>

                    <tbody>
                        {TIME_SLOTS.map(
                            (time, rowIndex) => {
                                const isRowSelected =
                                    DAYS.every(
                                        (_, colIndex) =>
                                            !!selected[
                                            `${rowIndex}-${colIndex}`
                                            ]
                                    );

                                return (
                                    <tr key={time}>
                                        <td>{time}</td>

                                        {DAYS.map(
                                            (day, colIndex) => {
                                                const key =
                                                    `${rowIndex}-${colIndex}`;

                                                return (
                                                    <td key={day}>
                                                        <S.Checkbox
                                                            type="checkbox"
                                                            checked={
                                                                !!selected[
                                                                key
                                                                ]
                                                            }
                                                            disabled={
                                                                readOnly
                                                            }
                                                            // 마우스 드래그는 mousedown/mouseenter가 처리한다(mousedown의
                                                            // preventDefault로 네이티브 클릭 토글은 막혀있음). onChange는
                                                            // 키보드(Space/Enter)로 체크박스를 조작하는 경우를 위한 것 —
                                                            // 그땐 mousedown을 안 거치니까 실제 체크 상태를 그대로 반영한다.
                                                            onChange={(e) =>
                                                                setCellValue(
                                                                    rowIndex,
                                                                    colIndex,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            onMouseDown={(e) =>
                                                                handleCellMouseDown(
                                                                    rowIndex,
                                                                    colIndex,
                                                                    e
                                                                )
                                                            }
                                                            onMouseEnter={() =>
                                                                handleCellMouseEnter(
                                                                    rowIndex,
                                                                    colIndex
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                );
                                            }
                                        )}

                                        <td>
                                            {!readOnly && (
                                                <S.RowButton
                                                    type="button"
                                                    $selected={
                                                        isRowSelected
                                                    }
                                                    onClick={() =>
                                                        toggleRow(rowIndex)
                                                    }
                                                >
                                                    {isRowSelected
                                                        ? "취소"
                                                        : "선택"}
                                                </S.RowButton>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </S.Table>
            </S.TableScroll>

            <S.TableFooter>
                <S.SelectedText>
                    주간 사용 시간{" "}
                    <S.SelectedCount>
                        {selectedCount}
                    </S.SelectedCount>
                    칸
                </S.SelectedText>

                <S.ScrollGuide>
                    스크롤을 내려 더 많은 시간대를 확인하세요
                </S.ScrollGuide>

                {!readOnly && (
                    <S.ResetButton
                        type="button"
                        onClick={resetAll}
                    >
                        전체 초기화
                    </S.ResetButton>
                )}
            </S.TableFooter>
        </>
    );
}

export default UsageTable;