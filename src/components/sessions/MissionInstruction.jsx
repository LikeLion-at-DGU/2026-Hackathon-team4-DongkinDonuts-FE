import { memo } from "react";
import { BALL_TYPES } from "../../config/ballTypes";
import { Instruction, InstructionPill, MissionText, InstructionSub } from "./MissionInstruction.styled";

const BREATH_TITLES = {
  INHALE: "4초 동안 깊게 들이마시세요",
  HOLD: "2초 동안 숨을 멈추세요",
  EXHALE: "6초 동안 천천히 내쉬세요",
};

const MissionInstruction = ({
  mission = {},
  sequenceOrder = [],
  sameColorTargetType,
  missionRemaining,
  phase,
  missionText,
  instructionSub,
}) => {
  const getTitle = () => {
    if (missionText) return missionText;
    if (!mission || !mission.type) return mission?.title || "";

    if (mission.type === "BREATH") {
      return BREATH_TITLES[phase] ?? "들이마시고 내쉬며 이어가세요";
    }

    switch (mission.type) {

      // 기존 게임 인터랙션 세션 타입
      case "COLOR_SORT":
        return "같은 색깔 구역에 공 넣기";
      case "SEQUENCE": {
        const names = sequenceOrder.map((color) => BALL_TYPES[color]?.name).filter(Boolean);
        return `순서: ${names.join(" → ")}`;
      }
      case "MOVING_TARGET":
        return "움직이는 목표에 공 넣기";
      case "SAME_COLOR":
        return `${BALL_TYPES[sameColorTargetType]?.name ?? "같은 색"} 공 3개 모으기`;
      case "TIME_ATTACK":
        return `${missionRemaining}초 안에 공 3개 옮기기`;
      default:
        return mission.title || "";
    }
  };

  const getSubText = () => {
    if (instructionSub) return instructionSub;
    if (!mission || !mission.type) return "";

    switch (mission.type) {
      // 기존 게임 인터랙션 세션 서브 문구
      case "COLOR_SORT":
        return "공 3개를 각각 같은 색 영역에 넣어보세요";
      case "SEQUENCE":
        return "제시된 순서대로 공을 잡았다 놓으세요";
      case "MOVING_TARGET":
        return "움직이는 목표에 공 3개를 넣어보세요";
      case "SAME_COLOR":
        return "같은 색 공 3개를 목표 영역에 모아보세요";
      case "TIME_ATTACK":
        return "제한 시간 안에 목표 영역으로 옮겨보세요";
      default:
        return "";
    }
  };

  const title = getTitle();
  const subText = getSubText();

  return (
    <Instruction>
      <InstructionPill>
        <MissionText>{title}</MissionText>
        {subText && mission.type !== "BREATH" && <InstructionSub> · {subText}</InstructionSub>}
      </InstructionPill>
    </Instruction>
  );
};

export default memo(MissionInstruction);