import { memo } from "react";
import { BALL_TYPES } from "../../config/ballTypes";
import { Instruction, MissionText, InstructionSub } from "./MissionInstruction.styled";

const BREATH_TITLES = {
  INHALE: "4초 동안 깊게 들이마시세요",
  HOLD: "2초 동안 숨을 멈추세요",
  EXHALE: "6초 동안 천천히 내쉬세요",
};

const MissionInstruction = ({ mission, sequenceOrder = [], sameColorTargetType, missionRemaining, phase }) => {
  const getMissionTitle = () => {
    if (mission.type === "BREATH") return BREATH_TITLES[phase] ?? "들숨과 날숨을 이어가세요";
    switch (mission.type) {
      case "COLOR_SORT": return "같은 색깔 구역에 공 넣기";
      case "SEQUENCE": {
        const names = sequenceOrder.map((color) => BALL_TYPES[color]?.name).filter(Boolean);
        return `순서: ${names.join(" → ")}`;
      }
      case "MOVING_TARGET": return "움직이는 목표에 공 넣기";
      case "SAME_COLOR": return `${BALL_TYPES[sameColorTargetType]?.name ?? "같은 색"} 공 3개 모으기`;
      case "TIME_ATTACK": return `${missionRemaining}초 안에 공 3개 옮기기`;
      default: return mission.title || "";
    }
  };

  const getMissionSubText = () => {
    switch (mission.type) {
      case "COLOR_SORT": return "공 3개를 각각 같은 색 영역에 넣어보세요";
      case "SEQUENCE": return "표시된 순서대로 공을 옮겨보세요";
      case "MOVING_TARGET": return "움직이는 목표에 공 3개를 넣어보세요";
      case "SAME_COLOR": return "같은 색 공 3개를 목표 영역에 모아보세요";
      case "TIME_ATTACK": return "제한 시간 안에 목표 영역으로 옮겨보세요";
      default: return "";
    }
  };

  return (
    <Instruction>
      <MissionText>{getMissionTitle()}</MissionText>
      {mission.type !== "BREATH" && <InstructionSub> · {getMissionSubText()}</InstructionSub>}
    </Instruction>
  );
};

export default memo(MissionInstruction);
