import { memo } from "react";
import { formatTime } from "../../utils/handUtils";
import { DIFFICULTY_LABELS } from "../../config/difficultyConfig";
import { LiveTime, LiveDot, StageLabel, DataArea, DataCard, DataTitle, DataRow, DistanceCard, DistanceHeader, DistanceBar, DistanceMarker, SessionImageWrap, SessionImageCaption } from "./SessionDataPanel.styled";

// 세션 흐름상 현재 위치를 나타내는 단계 라벨. "custom" 단계는 (현재 단계/총 세션 개수)를 덧붙인다.
const getStageLabel = (sessionStage, stepInfo) => {
  if (sessionStage === "custom") {
    return "맞춤세션";
  }
  if (sessionStage === "wakeup") return "가볍게 깨우기";
  if (sessionStage === "finish") return "마무리하기";
  return null;
};

const SessionDataPanel = ({ elapsedTime = 0, successCount, handCount, difficulty, screenDistance, sessionImage, sessionStage, stepInfo }) => {
  const hasHandMetrics = successCount !== undefined || handCount !== undefined || difficulty !== undefined;
  const distanceStatus = screenDistance?.status ?? "인식되지 않음";
  const stageLabel = getStageLabel(sessionStage, stepInfo);

  return (
    <>
      <LiveTime><LiveDot /> 지속 시간 {formatTime(elapsedTime)}</LiveTime>
      {stageLabel && <StageLabel>{stageLabel}</StageLabel>}
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
          {screenDistance && (
            <DistanceCard>
              <DistanceHeader>
                <span>화면 거리</span>
                <strong className={distanceStatus === "적정" ? "distance-good" : "distance-warning"}>{distanceStatus}</strong>
              </DistanceHeader>
              {screenDistance?.status && distanceStatus !== "인식되지 않음" && (
                <DistanceBar><DistanceMarker style={{ left: `${screenDistance.value}%` }} /></DistanceBar>
              )}
            </DistanceCard>
          )}
        </DataArea>
      )}
      {hasHandMetrics && sessionImage && (
        <SessionImageWrap>
          <img src={sessionImage} alt="" />
          <SessionImageCaption>[ 위 동작을 참고해주세요 ]</SessionImageCaption>
        </SessionImageWrap>
      )}
    </>
  );
};

export default memo(SessionDataPanel);
