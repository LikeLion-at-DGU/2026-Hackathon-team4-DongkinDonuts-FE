import UsageTable from "./UsageTable";
import DigitalAnalysisCard from "./DigitalAnalysisCard";
import DigitalScheduleCard from "./DigitalScheduleCard";

import LockIcon from "../../assets/icons/LockIcon.svg";

import * as U from "./DigitalUsage.styled";
import * as S from "./DigitalState.styled";

function DigitalLockedView({
    onOpen,
}) {
    return (
        <U.Container>
            {/* 실제 입력 화면과 완전히 동일한 UsageCard */}
            <S.LockedUsageWrapper>
                <U.UsageCard>
                    <UsageTable
                        selected={{}}
                        toggleCell={() => {}}
                        setCellValue={() => {}}
                        toggleRow={() => {}}
                        resetAll={() => {}}
                        readOnly
                    />
                </U.UsageCard>

                {/* blur */}
                <S.LockedBlur />

                {/* 가운데 잠금 안내 */}
                <S.LockContent>
                    <S.LockIcon>
                        <img
                            src={LockIcon}
                            alt=""
                        />
                    </S.LockIcon>

                    <S.ResultTitle>
                        디지털 사용 데이터를 입력해주세요
                    </S.ResultTitle>

                    <S.ResultDescription>
                        데이터를 입력하면
                        <br />
                        맞춤 타이머를 세팅할 수 있어요
                    </S.ResultDescription>

                    <S.ResultButton
                        type="button"
                        onClick={onOpen}
                    >
                        입력하기
                    </S.ResultButton>
                </S.LockContent>
            </S.LockedUsageWrapper>

            {/* PC 패턴을 아직 안 넣었어도, 둘 다 스스로 실제 데이터를 조회해서
                보여준다(분석은 최근 세션 기록, 일정은 "내 계획 다시 설정"으로만
                만든 계획도 포함) — 실제 결과 화면과 완전히 동일한 CardRow */}
            <U.CardRow>
                <DigitalAnalysisCard />
                <DigitalScheduleCard />
            </U.CardRow>
        </U.Container>
    );
}

export default DigitalLockedView;