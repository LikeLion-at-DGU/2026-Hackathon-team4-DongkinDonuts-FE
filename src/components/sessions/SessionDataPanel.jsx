import { memo } from "react";
import { formatTime } from "../../utils/handUtils";
import { LiveTime, LiveDot, DataArea, DataCard, DataTitle, DataRow, DistanceCard, DistanceHeader, DistanceBar, DistanceMarker } from "./SessionDataPanel.styled";

const SessionDataPanel = ({ elapsedTime = 0, successCount, handCount, screenDistance }) => {
  const hasHandMetrics = successCount !== undefined || handCount !== undefined || screenDistance;
  const distanceStatus = screenDistance?.status ?? "인식되지 않음";

  return (
    <>
      <LiveTime><LiveDot /> 지속 시간 {formatTime(elapsedTime)}</LiveTime>
      {hasHandMetrics && (
        <DataArea>
          <DataCard>
            <DataTitle>실시간 데이터</DataTitle>
            <DataRow>
              <div><span>미션 성공 횟수</span><strong>{successCount ?? 0}번</strong></div>
              <div><span>손 인식</span><strong>{handCount ?? 0}개</strong></div>
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
    </>
  );
};

export default memo(SessionDataPanel);
