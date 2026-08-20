import { memo } from "react";
import { formatTime } from "../../utils/handUtils";
import { DIFFICULTY_LABELS } from "../../config/difficultyConfig";
import { LiveTime, LiveDot, DataArea, DataCard, DataTitle, DataRow, DistanceCard, DistanceHeader, DistanceBar, DistanceMarker, SessionImageWrap } from "./SessionDataPanel.styled";

const SessionDataPanel = ({ elapsedTime = 0, successCount, handCount, difficulty, screenDistance, sessionImage }) => {
  const hasHandMetrics = successCount !== undefined || handCount !== undefined || difficulty !== undefined || screenDistance;
  const distanceStatus = screenDistance?.status ?? "인식되지 않음";

  return (
    <>
      <LiveTime><LiveDot /> 지속 시간 {formatTime(elapsedTime)}</LiveTime>
      {hasHandMetrics && (
        <DataArea>
          <DataCard>
            <DataTitle>실시간 데이터</DataTitle>
            <DataRow>
              {difficulty !== undefined ? (
                <div><span>난이도</span><strong>{DIFFICULTY_LABELS[difficulty] ?? difficulty}</strong></div>
              ) : (
                <div><span>손 인식</span><strong>{handCount ?? 0} 개</strong></div>
              )}
              <div><span>반복 횟수</span><strong>{successCount ?? 0} 번</strong></div>
            </DataRow>
          </DataCard>
          <DistanceCard>
            <DistanceHeader>
              <span>화면 거리</span>
              <strong className={distanceStatus === "적정" ? "distance-good" : "distance-warning"}>{distanceStatus}</strong>
            </DistanceHeader>
            {screenDistance?.status && distanceStatus !== "인식되지 않음" && (
              <DistanceBar><DistanceMarker style={{ left: `${screenDistance.value}%` }} /></DistanceBar>
            )}
          </DistanceCard>
        </DataArea>
      )}
      {hasHandMetrics && sessionImage && (
        <SessionImageWrap>
          <img src={sessionImage} alt="" />
        </SessionImageWrap>
      )}
    </>
  );
};

export default memo(SessionDataPanel);
