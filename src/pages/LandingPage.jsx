import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import RoutineCard from "../components/routine/RoutineCard.jsx";
import RoutineModal from "../components/routine/RoutineModal.jsx";

import WhyBrainfit from "../components/whyBrainfit/WhyBrainfit.jsx";
import YourHistory from "../components/history/YourHistory.jsx";
import DigitalState from "../components/digitalState/DigitalState.jsx";

import TimeChangeModal from "../components/digitalState/TimeChangeModal.jsx";

import RecoveryFlowModals from "../components/common/RecoveryFlowModals.jsx";

import { routineData } from "../data/routineData.jsx";

import { useRecoverySessionFlow } from "../hooks/useRecoverySessionFlow";
import { useRoutineHome } from "../hooks/useRoutineHome";
import { useRecoveryTimeSettings } from "../hooks/useRecoveryTimeSettings";

import { useNextReset } from "../hooks/useNextReset";
import { usePushSubscription } from "../hooks/usePushSubscription";

import {
  generateAIRecoveryPlan,
} from "../api/plans";

import {
  arePreviousStagesComplete,
  isStageComplete,
  stageStatusLabel,
} from "../config/recoveryRouting";

import * as S from "./LandingPage.styled";

function LandingPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    activeTab,
    setActiveTab,
  ] = useState("routine");

  const [
    activeRecommendedTimes,
    setActiveRecommendedTimes,
  ] = useState([]);

  const [
    generatingPlan,
    setGeneratingPlan,
  ] = useState(false);

  const routineRef =
    useRef(null);

  const digitalRef =
    useRef(null);

  /*
   * 알림 콜백과
   * sessionFlow 사이 연결
   */
  const notificationFlowRef =
    useRef(null);

  const {
    hasPlan,
    recoverySlotId,
    resetTimeLabel,
    countdownLabel,
    refresh:
    refreshNextReset,
  } = useNextReset(() => {
    notificationFlowRef.current?.();
  });

  /*
* 루틴 카드 관련
*/
  const routineHome =
    useRoutineHome({
      navigate,
    });

  /*
   * AI 계획 생성
   */
  const handleGenerateRecoveryPlan =
    async () => {
      try {
        setGeneratingPlan(
          true
        );

        await generateAIRecoveryPlan({
          notificationEnabled:
            true,
        });

        await Promise.all([
          refreshNextReset(),
          routineHome.loadRoutineSlot(),
        ]);
      } catch (error) {
        console.error(
          "AI 회복 계획 생성 실패:",
          error
        );
      } finally {
        setGeneratingPlan(
          false
        );
      }
    };

  /*
   * 세션 시작 모달 흐름
   */
  const sessionFlow =
    useRecoverySessionFlow({
      hasPlan,
      navigate,
      onGeneratePlan:
        handleGenerateRecoveryPlan,
    });

  useEffect(() => {
    notificationFlowRef.current =
      sessionFlow.openNotificationFlow;
  }, [
    sessionFlow.openNotificationFlow,
  ]);

  /*
   * 시간 변경 관련
   */
  const timeSettings =
    useRecoveryTimeSettings({
      recoverySlotId,
      resetTimeLabel,
      refreshNextReset,
    });

  /*
   * 최초 접속 Setup
   */
  const skipInitialSetupRef =
    useRef(
      Boolean(
        location.state
          ?.skipSetup
      )
    );

  useEffect(() => {
    if (
      skipInitialSetupRef.current
    ) {
      skipInitialSetupRef.current =
        false;

      return;
    }

    const hasSeen =
      sessionStorage.getItem(
        "hasSeenSetupModal"
      );

    if (!hasSeen) {
      sessionFlow.openInitialSetup();

      sessionStorage.setItem(
        "hasSeenSetupModal",
        "true"
      );
    }
  }, []);

  /*
   * Header scroll
   */
  useEffect(() => {
    const target =
      location.state
        ?.scrollTo;

    if (!target) {
      return;
    }

    if (
      target === "routine"
    ) {
      setActiveTab(
        "routine"
      );

      setTimeout(() => {
        routineRef.current
          ?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start",
          });
      }, 100);
    }

    if (
      target === "digital"
    ) {
      setTimeout(() => {
        digitalRef.current
          ?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start",
          });
      }, 100);
    }

    navigate(
      location.pathname,
      {
        replace: true,
        state: null,
      }
    );
  }, [
    location.state,
    location.pathname,
    navigate,
  ]);

  return (
    <S.LandingPage>
      {/* HERO */}
      <S.HeroSection>
        <S.HeroContent>
          <S.HeroText>
            <S.Title>
              나를 위한
              <br />
              맞춤 회복 루틴,
              Brainfit
            </S.Title>

            <S.Description>
              지친 순간을 알아채고
              <br />
              짧은 움직임으로
              나를 다시 깨워요
            </S.Description>

            <S.ButtonGroup>
              <S.StartButton
                onClick={
                  sessionFlow.openMainRoutineFlow
                }
              >
                회복 루틴 시작하기
              </S.StartButton>
            </S.ButtonGroup>
          </S.HeroText>

          <S.ReportBox>
            <S.ReportTop>
              <S.ReportLabel>
                다음 리셋 시간
              </S.ReportLabel>

              <S.AiBadge>
                Brainfit 추천
              </S.AiBadge>
            </S.ReportTop>

            <S.ReportTime>
              {generatingPlan
                ? "생성 중..."
                : hasPlan
                  ? resetTimeLabel
                  : "계획 없음"}
            </S.ReportTime>

            <S.ReportDescription>
              {generatingPlan
                ? "AI가 회복 계획을 만들고 있어요. 최대 1분 정도 걸려요."
                : hasPlan
                  ? "입력한 정보를 바탕으로 AI가 리셋 시간을 추천했어요"
                  : '"내 계획 다시 설정"으로 오늘의 리셋 시간을 만들어보세요'}
            </S.ReportDescription>

            <S.ReportDivider />

            <S.ReportBottom>
              <S.ReportBottomText>
                <S.ReportBottomLabel>
                  다음 리셋까지
                </S.ReportBottomLabel>

                <S.ReportBottomDescription>
                  시간이 되면 알림을 보내드려요
                </S.ReportBottomDescription>
              </S.ReportBottomText>

              <S.Countdown>
                {!generatingPlan &&
                  hasPlan
                  ? countdownLabel
                  : "--:--"}
              </S.Countdown>
            </S.ReportBottom>

            <S.ChangeTimeButton
              onClick={
                timeSettings.openTimeModal
              }
            >
              시간 선택하기
            </S.ChangeTimeButton>
          </S.ReportBox>
        </S.HeroContent>
      </S.HeroSection>

      {/* MAIN */}
      <S.MainContent>
        <S.TabMenu>
          <S.TabButton
            $active={
              activeTab ===
              "routine"
            }
            onClick={() =>
              setActiveTab(
                "routine"
              )
            }
          >
            Today's Routine
          </S.TabButton>

          <S.TabButton
            $active={
              activeTab ===
              "digital"
            }
            onClick={() =>
              setActiveTab(
                "digital"
              )
            }
          >
            Your History
          </S.TabButton>

          <S.TabButton
            $active={
              activeTab ===
              "progress"
            }
            onClick={() =>
              setActiveTab(
                "progress"
              )
            }
          >
            Why Brainfit
          </S.TabButton>
        </S.TabMenu>

        {activeTab ===
          "routine" && (
            <S.RoutineSection
              ref={
                routineRef
              }
            >
              <S.SectionHeader>
                <S.SectionLabel>
                  Today's Routine
                </S.SectionLabel>

                <S.SectionTitle>
                  잠깐 리프레시할까요?
                </S.SectionTitle>
              </S.SectionHeader>

              <S.RoutineCards>
                {routineData.map(
                  (
                    routine
                  ) => {
                    const isCompleted =
                      Boolean(
                        routineHome.routineSlot &&
                        isStageComplete(
                          routineHome.routineSlot,
                          routine.stageType
                        )
                      );

                    const isLocked =
                      routineHome.routineSlot
                        ? (
                          !isCompleted &&
                          !arePreviousStagesComplete(
                            routineHome.routineSlot,
                            routine.stageType
                          )
                        )
                        : routine.id !== 1;

                    const status =
                      routineHome.loadingRoutineSlot
                        ? "확인 중"
                        : routineHome.routineSlot
                          ? stageStatusLabel(
                            routineHome.routineSlot,
                            routine.stageType
                          )
                          : routine.status;

                    return (
                      <RoutineCard
                        key={
                          routine.id
                        }
                        {...routine}
                        status={
                          status
                        }
                        isCompleted={
                          isCompleted
                        }
                        isLocked={
                          isLocked
                        }
                        onStart={() =>
                          routineHome.handleRoutineStart(
                            routine
                          )
                        }
                      />
                    );
                  }
                )}
              </S.RoutineCards>
            </S.RoutineSection>
          )}

        {activeTab ===
          "progress" && (
            <WhyBrainfit />
          )}

        {activeTab ===
          "digital" && (
            <YourHistory />
          )}

        <div ref={digitalRef}>
          <DigitalState
            onRecommendedTimesChange={
              setActiveRecommendedTimes
            }
          />
        </div>
      </S.MainContent>

      {/* 루틴 상태 경고 */}
      {routineHome.showRoutineModal && (
        <RoutineModal
          {...(
            routineHome.routineModalContent ??
            {}
          )}
          onClose={
            routineHome.closeRoutineModal
          }
        />
      )}

      {/* 세션 흐름 모달 */}
      <RecoveryFlowModals
        flow={
          sessionFlow
        }
      />

      {/* 시간 변경 */}
      {timeSettings.showTimeModal && (
        <TimeChangeModal
          recommendedTimes={
            activeRecommendedTimes
          }
          currentTime={
            hasPlan
              ? resetTimeLabel
              : "15:00"
          }
          currentRepeat={
            timeSettings.repeatAlarm
          }
          activeRecommendedTimes={
            timeSettings.activeRecommendedTimes
          }
          onClose={
            timeSettings.closeTimeModal
          }
          onSave={
            timeSettings.handleSaveTime
          }
        />
      )}
    </S.LandingPage>
  );
}

export default LandingPage;