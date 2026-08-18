import * as S from "./YourHistory.styled";

const historyData = [
    {
        id: 1,
        time: "09:00",
        activity: "코딩 / 피곤함",
        routine: "짧은 눈 피로 Brainfit",
        status: "완료",
        note: "자율 휴식 달성",
    },
    {
        id: 2,
        time: "11:30",
        activity: "자료 정리 / 눈 피로",
        routine: "가벼운 스트레칭 Brainfit",
        status: "완료",
        note: "장시간 화면 주의",
    },
    {
        id: 3,
        time: "13:28",
        activity: "문서작성 /",
        routine: "-",
        status: "취소",
        note: "타이머 예약 취소",
    },
    {
        id: 4,
        time: "14:29",
        activity: "문서작성 /",
        routine: "-",
        status: "예정",
        note: "자세 점검 필요",
    },
    {
        id: 5,
        time: "16:00",
        activity: "영상 편집 / 피곤함",
        routine: "짧은 눈 피로 Brainfit",
        status: "완료",
        note: "자율 휴식 달성",
    },
    {
        id: 6,
        time: "23:30",
        activity: "자료 정리 /",
        routine: "-",
        status: "미실행",
        note: "예정된 세션을 실행하지 않음",
    },
    {
        id: 7,
        time: "23:47",
        activity: "코딩 / 눈 피로",
        routine: "짧은 눈 피로 Brainfit",
        status: "완료",
        note: "장시간 화면 주의",
    },
];

function YourHistory() {
    return (
        <S.Section>
            <S.Header>
                <S.Label>Your History</S.Label>
                <S.Title>나의 사용 기록을 확인해보세요</S.Title>
            </S.Header>

                <S.Table>
                    <S.TableHead>
                        <tr>
                            <S.TimeHeader>시간</S.TimeHeader>
                            <S.ActivityHeader>상황 / 업무내용</S.ActivityHeader>
                            <S.RoutineHeader>추천 루틴</S.RoutineHeader>
                            <S.StatusHeader>상태</S.StatusHeader>
                            <S.NoteHeader>비고</S.NoteHeader>
                        </tr>
                    </S.TableHead>

                    <tbody>
                        {historyData.map((history) => (
                            <S.TableRow key={history.id}>
                                <S.TimeCell>{history.time}</S.TimeCell>

                                <S.ActivityCell>
                                    {history.activity}
                                </S.ActivityCell>

                                <S.RoutineCell>
                                    {history.routine === "-" ? (
                                        "-"
                                    ) : (
                                        <S.RoutineBadge>
                                            {history.routine}
                                        </S.RoutineBadge>
                                    )}
                                </S.RoutineCell>

                                <S.StatusCell>
                                    <S.StatusBadge $status={history.status}>
                                        {history.status}
                                    </S.StatusBadge>
                                </S.StatusCell>

                                <S.NoteCell>{history.note}</S.NoteCell>
                            </S.TableRow>
                        ))}
                    </tbody>
                </S.Table>
        </S.Section>
    );
}

export default YourHistory;