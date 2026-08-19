import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RoutineCard from "../components/landingpage/RoutineCard.jsx";
import RoutineModal from "../components/landingpage/RoutineModal.jsx";
import { routineData } from "../data/routineData.jsx";
import WhyBrainfit from "../components/landingpage/WhyBrainfit.jsx";
import YourHistory from "../components/landingpage/YourHistory.jsx";
import DigitalState from "../components/landingpage/DigitalState.jsx";
import SetupModal from "../components/SetupModal";
import TimeChangeModal from "../components/landingpage/TimeChangeModal.jsx";
import { useNextReset } from "../hooks/useNextReset";

import * as S from "./LandingPage.styled";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();


  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupModalMode, setSetupModalMode] = useState("initial");

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [repeatAlarm, setRepeatAlarm] = useState(true);

  const {
    hasPlan,
    resetTimeLabel,
    countdownLabel,
    refresh: refreshNextReset,
  } = useNextReset();

  const [activeTab, setActiveTab] = useState("routine");
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  const routineRef = useRef(null);
  const digitalRef = useRef(null);

  // 브라우저 탭에서 처음 접속했을 때만 SetupModal 띄우기
  // 브라우저 탭에서 처음 접속했을 때만 SetupModal 띄우기
  useEffect(() => {
    const hasSeenSetupModal = sessionStorage.getItem(
      "hasSeenSetupModal"
    );

    if (!hasSeenSetupModal) {
      setSetupModalMode("initial");
      setShowSetupModal(true);

      sessionStorage.setItem(
        "hasSeenSetupModal",
        "true"
      );
    }
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
      navigate("/handroutine");
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
              디지털 피로를 위한
              <br />
              짧은 회복 루틴, Brainfit
            </S.Title>

            <S.Description>
              AI가 필요한 순간을 찾아
              <br />
              짧은 움직임으로 나를 다시 깨워요
            </S.Description>

            <S.ButtonGroup>
              <S.StartButton
                onClick={() => navigate("/handroutine")}
              >
                회복 루틴 시작하기
              </S.StartButton>

              <S.ResetButton
                onClick={() => {
                  setSetupModalMode("reset");
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
                AI 추천
              </S.AiBadge>
            </S.ReportTop>

            <S.ReportTime>
              {hasPlan ? resetTimeLabel : "계획 없음"}
            </S.ReportTime>

            <S.ReportDescription>
              {hasPlan
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
                  지금이 되면 알림을 보내드려요
                </S.ReportBottomDescription>
              </S.ReportBottomText>

              <S.Countdown>
                {hasPlan ? countdownLabel : "--:--"}
              </S.Countdown>
            </S.ReportBottom>

            <S.ChangeTimeButton
              onClick={() => setShowTimeModal(true)}
            >
              시간 변경하기
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
          mode={setupModalMode}
          onClose={() => {
            setShowSetupModal(false);
            refreshNextReset();
          }}
        />
      )}

      {showTimeModal && (
  <TimeChangeModal
    currentTime={hasPlan ? resetTimeLabel : ""}
    onClose={() => setShowTimeModal(false)}
    onSave={(time, repeat) => {
      // TODO: PATCH /plans/recovery-slots/{id}/schedule/, /notification/ 연동은
      // 별도 작업으로 남겨둠 — 지금은 로컬 상태만 반영.
      setRepeatAlarm(repeat);

      console.log("변경된 리셋 시간:", time);
      console.log("반복 알림:", repeat);
    }}
  />
)}
    </S.LandingPage>
  );
}

export default LandingPage;