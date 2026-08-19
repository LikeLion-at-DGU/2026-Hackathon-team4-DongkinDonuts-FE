import { memo } from "react";
import { BALL_TYPES } from "../../config/ballTypes";
import { Instruction, MissionText, InstructionSub } from "./MissionInstruction.styled";

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
      // 헬스/루틴 세션 타입
      case "EYE_BLINK":
        return "지그시 눈 깜빡이기";
      case "EYE_TRACKING":
        return "∞ 궤도 시선 추적";
      case "NECK_STRETCH":
        return "목 측면 신전";
      case "SHOULDER_PMR":
        return "어깨 점진적 이완 (PMR)";
      case "FOCUS_PINCH":
        return "양손 핀치 링 맞추기";
      case "DROWSY_ICE":
        return "얼음 조각 깨기";

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
      // 헬스/루틴 세션 서브 문구
      case "EYE_BLINK":
        return "3초간 눈을 지그시 감았다 떠주세요";
      case "EYE_TRACKING":
        return "화면의 무한대 궤적을 시선으로 따라가세요";
      case "NECK_STRETCH":
        return "고개를 옆으로 기울여 목 근육을 stretch 해주세요";
      case "SHOULDER_PMR":
        return "어깨를 귀까지 으쓱 올렸다 툭 떨어뜨리세요";
      case "FOCUS_PINCH":
        return "엄지와 검지를 꼬집듯 핀치하여 링을 맞추세요";
      case "DROWSY_ICE":
        return "주먹을 움직여 화면 속 얼음을 깨뜨리세요!";

      // 기존 게임 인터랙션 세션 서브 문구
      case "COLOR_SORT":
        return "공 3개를 각각 같은 색 영역에 넣어보세요";
      case "SEQUENCE":
        return "제시된 순서대로 공을 잡아보세요";
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
      <MissionText>{title}</MissionText>
      {subText && mission.type !== "BREATH" && <InstructionSub> · {subText}</InstructionSub>}
    </Instruction>
  );
};

export default memo(MissionInstruction);