import { useState } from "react";

import Header from "../components/Header";
import RoutineCard from "../components/RoutineCard";
import RoutineModal from "../components/RoutineModal";
import { routineData } from "../data/routineData.jsx";
import Footer from "../components/Footer";

import * as S from "./LandingPage.styled";

function LandingPage() {
  const [activeTab, setActiveTab] = useState("routine");
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // 테스트용: 아직 모든 루틴 미완료라고 가정
  const completedRoutines = [false, false, false];

  const handleRoutineStart = (index) => {
    // 첫 번째 루틴은 바로 시작 가능
    if (index === 0) {
      console.log("첫 번째 루틴 시작");
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
          <Header />

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
                <S.StartButton>
                  회복 루틴 시작하기
                </S.StartButton>

                <S.ResetButton>
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
                15:00
              </S.ReportTime>

              <S.ReportDescription>
                입력한 정보를 바탕으로 AI가 리셋 시간을 추천했어요
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
                  47:32
                </S.Countdown>
              </S.ReportBottom>

              <S.ChangeTimeButton>
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
              Why Brainfit ?
            </S.TabButton>
          </S.TabMenu>

          {/* ROUTINE */}
          <S.RoutineSection>
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
                  onStart={() => handleRoutineStart(index)}
                />
              ))}
            </S.RoutineCards>
          </S.RoutineSection>

          {/* DIGITAL STATE */}
          <S.DigitalSection>
            <S.DigitalHeader>
              <S.DigitalTitle>
                My Digital State
              </S.DigitalTitle>

              <S.DigitalDescription>
                어쩌고어쩌고
              </S.DigitalDescription>
            </S.DigitalHeader>

            <S.DigitalResult>
              <S.BlurredDigitalText>
                오늘의 움직임 분석 결과 집중도와 반응 속도는 안정적인 흐름을 보였어요.
                <br />
                손의 움직임은 이전 루틴보다 부드러워졌으며 시선 유지 시간도 증가했어요.
                <br />
                오늘은 짧은 집중 루틴과 호흡 루틴을 함께 진행하는 것을 추천해요.
              </S.BlurredDigitalText>

              <S.ResultTitle>
                디지털 사용 데이터를 입력해주세요
              </S.ResultTitle>

              <S.ResultDescription>
                데이터를 입력하면
                <br />
                맞춤 타이머를 세팅할 수 있어요
              </S.ResultDescription>

              <S.ResultButton>
                입력하기
              </S.ResultButton>
            </S.DigitalResult>
          </S.DigitalSection>

        </S.MainContent>
        <Footer />

        {/* ROUTINE MODAL */}
        {showRoutineModal && (
          <RoutineModal
            onClose={() => setShowRoutineModal(false)}
          />
        )}

      </S.LandingPage>
  );
}

export default LandingPage;