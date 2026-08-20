import { useEffect, useState } from "react";
import {
  getPersistedElapsedSeconds,
  savePersistedElapsedSeconds,
} from "../utils/sessionDurationStorage";

// 세션 페이지 간 이동에도 지속 시간이 초기화되지 않도록 sessionStorage에 이어서 저장하는
// elapsedTime state. useState(0) 대신 사용하면 다음 세션으로 넘어가도 값이 이어진다.
export const usePersistedElapsedTime = () => {
  const [elapsedTime, setElapsedTime] = useState(getPersistedElapsedSeconds);

  useEffect(() => {
    savePersistedElapsedSeconds(elapsedTime);
  }, [elapsedTime]);

  return [elapsedTime, setElapsedTime];
};
