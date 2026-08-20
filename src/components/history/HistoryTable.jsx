import * as S from "./HistoryTable.styled";

function HistoryTable({
    historyData = [],
    loading = false,
}) {
    return (
        <S.Table>
            <S.TableHead>
                <tr>
                    <S.TimeHeader>
                        시간
                    </S.TimeHeader>

                    <S.ActivityHeader>
                        업무내용 / 상황
                    </S.ActivityHeader>

                    <S.RoutineHeader>
                        추천 루틴
                    </S.RoutineHeader>

                    <S.StatusHeader>
                        상태
                    </S.StatusHeader>

                    <S.NoteHeader>
                        비고
                    </S.NoteHeader>
                </tr>
            </S.TableHead>

            <tbody>
                {loading ? (
                    <tr>
                        <S.ActivityCell colSpan={5}>
                            불러오는 중...
                        </S.ActivityCell>
                    </tr>
                ) : historyData.length === 0 ? (
                    <tr>
                        <S.ActivityCell colSpan={5}>
                            이 날짜엔 기록이 없어요
                        </S.ActivityCell>
                    </tr>
                ) : (
                    historyData.map((history) => (
                        <S.TableRow key={history.id}>
                            <S.TimeCell>
                                {history.time}
                            </S.TimeCell>

                            <S.ActivityCell>
                                {history.activity}
                            </S.ActivityCell>

                            <S.RoutineCell>
                                {history.routine ? (
                                    <S.RoutineBadge>
                                        {history.routine}
                                    </S.RoutineBadge>
                                ) : (
                                    "-"
                                )}
                            </S.RoutineCell>

                            <S.StatusCell>
                                <S.StatusBadge
                                    $status={history.status}
                                >
                                    {history.status}
                                </S.StatusBadge>
                            </S.StatusCell>

                            <S.NoteCell>
                                {history.note || "-"}
                            </S.NoteCell>
                        </S.TableRow>
                    ))
                )}
            </tbody>
        </S.Table>
    );
}

export default HistoryTable;