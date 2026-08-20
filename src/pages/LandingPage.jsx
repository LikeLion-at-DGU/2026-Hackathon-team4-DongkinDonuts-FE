import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RoutineCard from "../components/routine/RoutineCard.jsx";
import RoutineModal from "../components/routine/RoutineModal.jsx";
import { routineData } from "../data/routineData.jsx";
import WhyBrainfit from "../components/whyBrainfit/WhyBrainfit.jsx";
import YourHistory from "../components/history/YourHistory.jsx";
import DigitalState from "../components/digitalState/DigitalState.jsx";
import SetupModal from "../components/common/SetupModal.jsx";
import TimeChangeModal from "../components/digitalState/TimeChangeModal.jsx";
import { useNextReset } from "../hooks/useNextReset";
import { usePushSubscription } from "../hooks/usePushSubscription";
import {
  cancelSnapshotRecoverySlotsBefore,
  generateAIRecoveryPlan,
  getTodayRecoverySlots,
  updateRecoverySlotNotification,
  updateRecoverySlotSchedule,
} from "../api/plans";

import * as S from "./LandingPage.styled";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();


  const [showSetupModal, setShowSetupModal] = useState(false);
  const [forceNextActivityInput, setForceNextActivityInput] = useState(false);

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [repeatAlarm, setRepeatAlarm] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [todayRecoverySlots, setTodayRecoverySlots] = useState([]);
  const [loadingRecoverySlots, setLoadingRecoverySlots] = useState(false);

  const {
    hasPlan,
    recoverySlotId,
    resetTimeLabel,
    countdownLabel,
    refresh: refreshNextReset,
  } = useNextReset(() => navigate("/handroutine"));

  // 탭이 닫혀있거나 오래 백그라운드에 있어도 회복 타이머 알림이 오도록 진짜 Web
  // Push를 구독한다(권한 이미 거부/미지원이면 조용히 스킵).
  usePushSubscription();

  // 상태 점검 흐름이 끝나면 방금 만든 현재 스냅샷과, 재사용하거나 새로 만든 이후
  // 활동 계획을 명시적으로 넘겨 AI 회복 계획을 만든다. LLM 호출이라 30~50초 정도
  // 걸릴 수 있어서 모달은 먼저 닫고 카드 쪽에 로딩 상태만 보여준다.
  const handleGenerateRecoveryPlan = (setupResult = {}) => {
    setGeneratingPlan(true);
    generateAIRecoveryPlan({
      contextSnapshot: setupResult.contextSnapshotId,
      nextActivityPlan: setupResult.nextActivityPlanId,
      notificationEnabled: true,
    })
      .then(() => refreshNextReset())
      .catch((error) => {
        console.error("AI 회복 계획 생성 실패:", error);
      })
      .finally(() => setGeneratingPlan(false));
  };

  const loadTodayRecoverySlots = async () => {
    setLoadingRecoverySlots(true);

    try {
      const slots = await getTodayRecoverySlots();
      setTodayRecoverySlots(Array.isArray(slots) ? slots : []);
      return Array.isArray(slots) ? slots : [];
    } catch (error) {
      console.error("오늘 예정 알림 조회 실패:", error);
      setTodayRecoverySlots([]);
      return [];
    } finally {
      setLoadingRecoverySlots(false);
    }
  };

  const handleOpenTimeModal = () => {
    setShowTimeModal(true);
    loadTodayRecoverySlots();
  };

  const [activeTab, setActiveTab] = useState("routine");
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  const routineRef = useRef(null);
  const digitalRef = useRef(null);

  // 서비스 진입은 곧 현재 상태 점검으로 간주한다. 같은 페이지에 머무르는 동안은
  // 사용자가 닫을 수 있지만, 홈 화면에 새로 진입하면 다시 상태를 확인한다.
  useEffect(() => {
    setForceNextActivityInput(false);
    setShowSetupModal(true);
  }, []);


  // Header에서 들어온 scrollTo 처리
  useEffect(() => {
    const target = location.state?.scrollTo;

    if (!target) return;

    if (target === "routine") {
      setActiveTab("routine");

      setTimeout(() => {
        routineRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }

    if (target === "digital") {
      setTimeout(() => {
        digitalRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }

    // scrollTo state 제거
    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

  // 테스트용: 아직 모든 루틴 미완료라고 가정
  const completedRoutines = [false, false, false];

  const handleRoutineStart = (index) => {
    // 첫 번째 루틴은 바로 시작 가능
    if (index === 0) {
      navigate("/recovery-session");
      return;
    }

    // 이전 루틴이 완료되지 않았다면 모달
    if (!completedRoutines[index - 1]) {
      setShowRoutineModal(true);
      return;
    }

    console.log(`${index + 1}번째 루틴 시작`);
  };



  return (
    <S.LandingPage>
      {/* HERO */}
      <S.HeroSection>
        <S.HeroContent>
          <S.HeroText>
            <S.Title>
              나를 위한
              <br />
              맞춤 회복 루틴, Brainfit
            </S.Title>

            <S.Description>
              지친 순간을 알아채고
              <br />
              짧은 움직임으로 나를 다시 깨워요
            </S.Description>

            <S.ButtonGroup>
              <S.StartButton
                onClick={() => navigate("/recovery-session")}
              >
                회복 루틴 시작하기
              </S.StartButton>

              <S.ResetButton
                onClick={() => {
                  setForceNextActivityInput(true);
                  setShowSetupModal(true);
                }}
              >
                내 계획 다시 설정
              </S.ResetButton>
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
              {generatingPlan ? "생성 중..." : hasPlan ? resetTimeLabel : "계획 없음"}
            </S.ReportTime>

            <S.ReportDescription>
              {generatingPlan
                ? "AI가 회복 계획을 만들고 있어요. 최대 1분 정도 걸려요."
                : hasPlan
                ? "입력한 정보를 바탕으로 AI가 리셋 시간을 추천했어요"
                : "\"내 계획 다시 설정\"으로 오늘의 리셋 시간을 만들어보세요"}
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
                {!generatingPlan && hasPlan ? countdownLabel : "--:--"}
              </S.Countdown>
            </S.ReportBottom>

            <S.ChangeTimeButton
              onClick={handleOpenTimeModal}
            >
              시간 선택하기
            </S.ChangeTimeButton>
          </S.ReportBox>
        </S.HeroContent>
      </S.HeroSection>

      {/* MAIN */}
      <S.MainContent>
        {/* TABS */}
        <S.TabMenu>
          <S.TabButton
            $active={activeTab === "routine"}
            onClick={() => setActiveTab("routine")}
          >
            Today's Routine
          </S.TabButton>

          <S.TabButton
            $active={activeTab === "digital"}
            onClick={() => setActiveTab("digital")}
          >
            Your History
          </S.TabButton>

          <S.TabButton
            $active={activeTab === "progress"}
            onClick={() => setActiveTab("progress")}
          >
            Why Brainfit
          </S.TabButton>
        </S.TabMenu>

        {/* TODAY'S ROUTINE */}
        {activeTab === "routine" && (
          <S.RoutineSection ref={routineRef}>
            <S.SectionHeader>
              <S.SectionLabel>
                Today's Routine
              </S.SectionLabel>

              <S.SectionTitle>
                잠깐 리프레시할까요?
              </S.SectionTitle>
            </S.SectionHeader>

            <S.RoutineCards>
              {routineData.map((routine, index) => (
                <RoutineCard
                  key={routine.id}
                  {...routine}
                  onStart={() =>
                    handleRoutineStart(index)
                  }
                />
              ))}
            </S.RoutineCards>
          </S.RoutineSection>
        )}

        {/* WHY BRAINFIT */}
        {activeTab === "progress" && (
          <WhyBrainfit />
        )}

        {/* YOUR HISTORY */}
        {activeTab === "digital" && (
          <YourHistory />
        )}

        <div ref={digitalRef}>
          <DigitalState />
        </div>
      </S.MainContent>

      {/* ROUTINE MODAL */}
      {showRoutineModal && (
        <RoutineModal
          onClose={() =>
            setShowRoutineModal(false)
          }
        />
      )}

      {/* SETUP MODAL */}
      {showSetupModal && (
        <SetupModal
          forceNextActivityInput={forceNextActivityInput}
          onClose={() => {
            setShowSetupModal(false);
            setForceNextActivityInput(false);
          }}
          onComplete={(result) => {
            setShowSetupModal(false);
            setForceNextActivityInput(false);
            handleGenerateRecoveryPlan(result);
          }}
        />
      )}

      {showTimeModal && (
        <TimeChangeModal
          currentTime={hasPlan ? resetTimeLabel : "15:00"}
          currentRepeat={repeatAlarm}
          currentSlotId={recoverySlotId}
          scheduledSlots={todayRecoverySlots}
          isLoadingScheduledSlots={loadingRecoverySlots}
          onClose={() => setShowTimeModal(false)}
          onSave={async (time, repeat) => {
            if (!recoverySlotId) {
              window.alert("변경할 예정된 리셋이 없어요. 먼저 \"내 계획 다시 설정\"으로 계획을 만들어주세요.");
              return false;
            }

            const [hour, minute] = time.split(":").map(Number);
            const scheduledAt = new Date();
            scheduledAt.setHours(hour, minute, 0, 0);

            // 현재 시간보다 이전 시간으로는 리셋 시간을 옮길 수 없다 — 허용하면
            // next_reset_time이 이미 지난 시각이 되어버려서(is_overdue) "다음
            // 리셋까지" 카운트다운이 곧바로 00:00에 멈춰버린다.
            const now = new Date();
            if (scheduledAt.getTime() < now.getTime()) {
              window.alert("현재 시간 이전으로는 리셋 시간을 변경할 수 없어요.");
              return false;
            }

            try {
              // 주의: Date.toISOString()은 항상 UTC로 변환한다. 백엔드는
              // USE_TZ=False + TIME_ZONE="Asia/Seoul"라서 naive datetime을
              // "그 시각 그대로"(KST 벽시계 시간)로 저장한다. 여기서 toISOString()을
              // 쓰면 KST(UTC+9) 브라우저 기준 "16:00"이 "07:00Z"로 변환되고, 백엔드는
              // 그 "07:00"을 그대로 저장해버려서 사용자가 고른 시간과 9시간 어긋난
              // 값이 저장되는 버그가 있었다. UTC 변환 없이 로컬 벽시계 시간을 그대로
              // 문자열로 만들어서 보낸다.
              const pad = (n) => String(n).padStart(2, "0");
              const scheduledAtLocal =
                `${scheduledAt.getFullYear()}-${pad(scheduledAt.getMonth() + 1)}-${pad(scheduledAt.getDate())}` +
                `T${pad(scheduledAt.getHours())}:${pad(scheduledAt.getMinutes())}:00`;

              await updateRecoverySlotSchedule(recoverySlotId, scheduledAtLocal);
              await updateRecoverySlotNotification(recoverySlotId, {
                notificationEnabled: true,
                repeatRule: repeat ? "DAILY" : "",
              });
              await cancelSnapshotRecoverySlotsBefore({
                before: scheduledAtLocal,
                excludeSlot: recoverySlotId,
              });

              setRepeatAlarm(repeat);
              await refreshNextReset();
              await loadTodayRecoverySlots();
              return true;
            } catch (error) {
              console.error("리셋 시간 변경 실패:", error);
              window.alert("시간 변경에 실패했어요. 잠시 후 다시 시도해주세요.");
              return false;
            }
          }}
        />
      )}
    </S.LandingPage>
  );
}

export default LandingPage;
