import React from "react";
import { formatTime } from "../../utils/utils";
import {
  LiveTime,
  LiveDot,
  DataArea,
  DataCard,
  DataTitle,
  DataRow,
  DistanceCard,
  DistanceHeader,
  DistanceBar,
  DistanceMarker,
} from "./SessionDataPanel.styled";

const SessionDataPanel = ({ elapsedTime, successCount, handCount, screenDistance }) => {
  return (
    <>
      <LiveTime>
        <LiveDot />
        지속 시간 {formatTime(elapsedTime)}
      </LiveTime>

      <DataArea>
        <DataCard>
          <DataTitle>실시간 데이터</DataTitle>
          <DataRow>
            <div>
              <span>성공한 미션</span>
              <strong>{successCount}</strong>
            </div>
            <div>
              <span>손 인식</span>
              <strong>{handCount}</strong>
            </div>
          </DataRow>
        </DataCard>

        <DistanceCard>
          <DistanceHeader>
            <span>화면 거리</span>
            <strong className={screenDistance?.status === "적정" ? "distance-good" : "distance-warning"}>
              {screenDistance?.status ?? "인식되지 않음"}
            </strong>
          </DistanceHeader>

          {screenDistance?.status && screenDistance.status !== "인식되지 않음" && (
            <DistanceBar>
              <DistanceMarker style={{ left: `${screenDistance.value}%` }} />
            </DistanceBar>
          )}
        </DistanceCard>
      </DataArea>
    </>
  );
};

export default SessionDataPanel;