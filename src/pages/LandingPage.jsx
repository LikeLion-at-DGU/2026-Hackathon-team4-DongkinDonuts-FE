import { useState } from "react";

import Header from "../components/Header";
import RoutineCard from "../components/RoutineCard";
import Footer from "../components/Footer";

import { routineData } from "../data/routineData";

import * as S from "./LandingPage.styled";

function LandingPage() {
  const [activeTab, setActiveTab] = useState("routine");

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
              작은 움직임이
              <br />
              뇌와 얼굴의 감각을 깨우는 시간
            </S.Description>

            <S.StartButton>
              루틴 시작하기
              <span>→</span>
            </S.StartButton>
          </S.HeroText>

          <S.ReportBox>
            <S.ReportTop>
              <S.ReportLabel>최근 Brainfit</S.ReportLabel>
              <S.ReportLink>전체 보기</S.ReportLink>
            </S.ReportTop>
            
            <S.ReportTime>
              어제 <strong>14:32</strong>
              <br />
              3분 리셋 루틴을 완료했어요
            </S.ReportTime>

            <S.ReportSubText>
              최근 루틴을 바탕으로
              <br />
              오늘의 활동을 준비했어요
            </S.ReportSubText>
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
            My Digital State
          </S.TabButton>

          <S.TabButton
            $active={activeTab === "progress"}
            onClick={() => setActiveTab("progress")}
          >
            My progress
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
            {routineData.map((routine) => (
              <RoutineCard
                key={routine.id}
                {...routine}
              />
            ))}
          </S.RoutineCards>
        </S.RoutineSection>

        {/* AI INSIGHT */}
        <S.InsightSection>
          <S.InsightHeader>
            <S.InsightTitle>
              AI INSIGHT
            </S.InsightTitle>

            <S.InsightDescription>
              어쩌고어쩌고
            </S.InsightDescription>
          </S.InsightHeader>

          <S.InsightResult>
            <S.BlurredInsightText>
              오늘의 움직임 분석 결과 집중도와 반응 속도는 안정적인 흐름을 보였어요.
              <br />
              손의 움직임은 이전 루틴보다 부드러워졌으며 시선 유지 시간도 증가했어요.
              <br />
              오늘은 짧은 집중 루틴과 호흡 루틴을 함께 진행하는 것을 추천해요.
            </S.BlurredInsightText>

            <S.LockIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 51 51" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M25.5 2.65625C22.5412 2.65625 19.7035 3.83164 17.6113 5.92384C15.5191 8.01604 14.3438 10.8537 14.3438 13.8125V17.6269C13.1984 17.7225 12.1911 17.9244 11.2582 18.4004C9.75816 19.1635 8.53819 20.382 7.77325 21.8811C7.293 22.8267 7.09325 23.8467 6.99762 25.007C6.90625 26.1354 6.90625 27.5294 6.90625 29.257V36.618C6.90625 38.3456 6.90625 39.7396 6.99762 40.868C7.09325 42.0283 7.29512 43.0482 7.77537 43.9917C8.53904 45.4922 9.7583 46.7122 11.2582 47.4767C12.2017 47.957 13.2218 48.1567 14.382 48.2524C15.5104 48.3438 16.9044 48.3438 18.632 48.3438H32.368C34.0956 48.3438 35.4896 48.3438 36.618 48.2524C37.7783 48.1567 38.7983 47.9549 39.7417 47.4746C41.2422 46.711 42.4622 45.4917 43.2267 43.9917C43.707 43.0482 43.9067 42.0283 44.0024 40.868C44.0938 39.7396 44.0938 38.3456 44.0938 36.618V29.257C44.0938 27.5294 44.0938 26.1354 44.0024 25.007C43.9067 23.8467 43.7049 22.8267 43.2246 21.8833C42.461 20.3828 41.2417 19.1628 39.7417 18.3982C38.8089 17.9244 37.8016 17.7225 36.6562 17.6269V13.8125C36.6562 7.65 31.6625 2.65625 25.5 2.65625ZM33.4688 17.5312V13.8125C33.4688 11.6991 32.6292 9.67217 31.1348 8.17774C29.6403 6.68331 27.6134 5.84375 25.5 5.84375C23.3866 5.84375 21.3597 6.68331 19.8652 8.17774C18.3708 9.67217 17.5312 11.6991 17.5312 13.8125V17.5312H33.4688ZM12.7054 21.2394C13.124 21.0269 13.6786 20.8781 14.6434 20.7995C15.6251 20.7209 16.8895 20.7188 18.7 20.7188H32.3C34.1105 20.7188 35.3749 20.7188 36.3588 20.7995C37.3214 20.8781 37.876 21.0269 38.2967 21.2394C39.1956 21.6984 39.9266 22.4294 40.3856 23.3304C40.5981 23.749 40.7469 24.3036 40.8255 25.2684C40.9041 26.2501 40.9062 27.5124 40.9062 29.325V36.55C40.9062 38.3605 40.9062 39.6249 40.8255 40.6087C40.7448 41.5714 40.5981 42.126 40.3856 42.5467C39.9266 43.4456 39.1956 44.1766 38.2967 44.6356C37.876 44.8481 37.3214 44.9969 36.3566 45.0755C35.3749 45.1541 34.1105 45.1562 32.3 45.1562H18.7C16.8895 45.1562 15.6251 45.1562 14.6412 45.0755C13.6786 44.9948 13.124 44.8481 12.7054 44.6356C11.8053 44.1776 11.0733 43.4464 10.6144 42.5467C10.4019 42.126 10.2531 41.5714 10.1745 40.6066C10.0959 39.6249 10.0938 38.3605 10.0938 36.55V29.325C10.0938 27.5124 10.0938 26.2501 10.1745 25.2663C10.2531 24.3036 10.4019 23.749 10.6144 23.3282C11.0733 22.4286 11.8053 21.6974 12.7054 21.2394Z" fill="black" />
              </svg></S.LockIcon>

            <S.ResultTitle>
              오늘의 결과가 준비됐어요
            </S.ResultTitle>

            <S.ResultDescription>
              AI가 오늘의 움직임을 분석했어요.
              <br />
              나의 오늘을 확인해보세요.
            </S.ResultDescription>

            <S.ResultButton>
              결과 확인하기 ›
            </S.ResultButton>
          </S.InsightResult>
        </S.InsightSection>
      </S.MainContent>

      <Footer />
    </S.LandingPage>
  );
}

export default LandingPage;