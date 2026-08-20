import { memo, useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CameraPreview from "../components/sessions/CameraPreview";
import SessionDataPanel from "../components/sessions/SessionDataPanel";
import SessionEndModal from "../components/sessions/SessionEndModal";
import SessionControls from "../components/sessions/SessionControls";
import MissionInstruction from "../components/sessions/MissionInstruction";
import ProgressBar from "../components/sessions/ProgressBar";
import QuitConfirmModal from "../components/sessions/QuitConfirmModal";
import { preloadTracking } from "../hooks/useMultiTracking";
import { getTrackingTypeForPath } from "../config/sessionData";
import {
  SessionGlobalStyle,
  RoutineContainer,
  ContentWrapper,
  PlayContainer,
  ControlsWrapper,
  PlayArea,
} from "./SessionPage.styled";

const SessionPage = ({
  isQuitModalOpen,
  onCloseQuit,
  onConfirmQuit,
  navigateOnQuitConfirm = true,
  remainingSessionsCount = 0,
  isMissionComplete,
  isTerminated,
  resetSession,
  onStopSession,
  onCloseSessionEnd,
  nextSessionPath,
  isNextSessionPending = false,
  instantReset = false,
  showCompletionModal = true,
  showNextSessionControl = true,
  showOverlay = true,
  cameraPreviewProps,
  dataPanelProps,
  instructionProps,
  progressProps,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  const containerRef = useRef(null);

  // 최초 1회 미션을 통과해 완료 모달을 본 적이 있어야 "다음 세션" 버튼을 쓸 수 있다.
  // hasShownCompletionModal은 한 번 true가 되면 이후 세션이 반복 초기화되어도 계속 true로
  // 유지되므로, 통과 이력이 있는 한 버튼은 계속 활성 상태를 유지한다.
  const isNextSessionDisabled = !hasShownCompletionModal && !isMissionComplete;

  const handleNextSession = useCallback(() => {
    if (isNextSessionPending || isNextSessionDisabled) return;

    if (nextSessionPath) {
      navigate(
        nextSessionPath,
        nextSessionPath === "/"
          ? { state: { skipSetup: true } }
          : undefined
      );
      return;
    }

    navigate("/recovery-session");
  }, [isNextSessionDisabled, isNextSessionPending, navigate, nextSessionPath]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // React Router의 <ScrollRestoration /> 동작과 DOM 렌더링이 
    // 완전히 끝난 직후 프레임에 스크롤을 실행하여 충돌과 깜빡임을 원천 차단합니다.
    const rafId = requestAnimationFrame(() => {
      containerRef.current.scrollIntoView({
        behavior: "auto", // 즉시 화면에 맞추기 위해 auto 사용 (smooth는 충돌 가능성 있음)
        block: "start",
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [location.pathname]); // 라우터 경로(pathname)가 바뀔 때마다 확실하게 실행

  // 현재 세션이 진행되는 동안, 다음 세션에 필요한 MediaPipe 모델을 백그라운드에서 미리 로드해둔다.
  // "다음 세션" 버튼을 눌렀을 때 모델 초기화 대기 없이 즉시 카메라가 뜨도록 하기 위함.
  useEffect(() => {
    const nextTrackingType = getTrackingTypeForPath(nextSessionPath);
    if (nextTrackingType) preloadTracking(nextTrackingType);
  }, [nextSessionPath]);

  // 완료 모달은 세션당 한 번만 보여준다(hasShownCompletionModal은 이후 계속 true로 유지).
  // 그 뒤로는 미션을 다시 완료할 때마다 모달 없이 조용히 반복 초기화된다.
  // 이때도 초기화 렌더(진행바가 100%인 채로 잠깐 드러나는 프레임)가 먼저 화면에 그려지도록
  // 한 프레임 이상 기다린 뒤에 세션을 초기화한다. resetSession을 모달 close와 같은 틱에서
  // 바로 호출하면 두 상태 변화가 한 번의 렌더로 묶여 100% 프레임이 그려질 기회 자체가
  // 사라지기 때문. 다만 이 지연이 오히려 완료 이펙트(파동 등)가 한 번 더 재생되는 것처럼
  // 보이는 세션(instantReset)에서는 지연 없이 즉시 초기화한다.
  useEffect(() => {
    if (
      !showCompletionModal ||
      !isMissionComplete ||
      isTerminated ||
      !hasShownCompletionModal
    ) {
      return;
    }

    if (instantReset) {
      resetSession?.();
      return;
    }
    let innerId;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => {
        resetSession?.();
      });
    });
    return () => {
      cancelAnimationFrame(outerId);
      if (innerId) cancelAnimationFrame(innerId);
    };
  }, [
    hasShownCompletionModal,
    instantReset,
    isMissionComplete,
    isTerminated,
    resetSession,
    showCompletionModal,
  ]);

  const handleCloseSessionEnd = useCallback(() => {
    if (isMissionComplete && !isTerminated) {
      setHasShownCompletionModal(true);
      return;
    }

    onCloseSessionEnd?.();
  }, [isMissionComplete, isTerminated, onCloseSessionEnd]);

  const shouldShowCompletionModal =
    showCompletionModal && isMissionComplete && !hasShownCompletionModal;

  return (
    <>
      <SessionGlobalStyle />
      <RoutineContainer ref={containerRef}>
        <QuitConfirmModal
          isOpen={isQuitModalOpen}
          onClose={onCloseQuit}
          onConfirm={onConfirmQuit}
          navigateOnConfirm={navigateOnQuitConfirm}
          remainingCount={remainingSessionsCount}
        />

        <ContentWrapper>
          <PlayContainer>
            <PlayArea>{children}</PlayArea>

            {showOverlay && (
              <>
                {cameraPreviewProps && <CameraPreview {...cameraPreviewProps} />}
                {dataPanelProps && <SessionDataPanel {...dataPanelProps} />}
                {instructionProps && <MissionInstruction {...instructionProps} />}
                {progressProps && <ProgressBar {...progressProps} />}
              </>
            )}

            <SessionEndModal
              isMissionComplete={shouldShowCompletionModal}
              isTerminated={isTerminated}
              onClose={handleCloseSessionEnd}
              onRestart={resetSession}
              nextSessionPath={nextSessionPath}
              isNextSessionPending={isNextSessionPending}
            />
          </PlayContainer>

          <ControlsWrapper>
            <SessionControls
              handleStopGame={onStopSession}
              nextSession={handleNextSession}
              showNextSession={showNextSessionControl}
              isNextSessionDisabled={isNextSessionDisabled}
            />
          </ControlsWrapper>
        </ContentWrapper>
      </RoutineContainer>
    </>
  );
};

export default memo(SessionPage);
