import { useRef, useState } from "react";
import RoutineCard from "../components/RoutineCard";
import RoutineModal from "../components/RoutineModal";
import { routineData } from "../data/routineData.jsx";
import WhyBrainfit from "../components/WhyBrainfit";
import YourHistory from "../components/YourHistory";


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

  const routineRef = useRef(null);
  const insightRef = useRef(null);

  const scrollToRoutine = () => {
    routineRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToInsight = () => {
    insightRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
            Why Brainfit
          </S.TabButton>
        </S.TabMenu>

        {/* 탭에 따라 이 부분만 변경 */}
        {activeTab === "routine" && (
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
        )}

        {activeTab === "progress" && (
          <WhyBrainfit />
        )}


        {activeTab === "digital" && (
            < YourHistory />
        )}

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

            <S.LockIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="47" height="47" viewBox="0 0 47 47" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M23.4989 2.44775C20.7723 2.44775 18.1573 3.53091 16.2293 5.45893C14.3013 7.38695 13.2181 10.0019 13.2181 12.7285V16.2436C12.1626 16.3317 11.2344 16.5178 10.3747 16.9564C8.99237 17.6596 7.86814 18.7825 7.16322 20.164C6.72066 21.0354 6.53658 21.9754 6.44846 23.0446C6.36426 24.0844 6.36426 25.369 6.36426 26.9611V33.7444C6.36426 35.3365 6.36426 36.6211 6.44846 37.6609C6.53658 38.7301 6.72262 39.6701 7.16518 40.5396C7.86892 41.9222 8.9925 43.0465 10.3747 43.7511C11.2442 44.1936 12.1842 44.3777 13.2534 44.4659C14.2932 44.5501 15.5778 44.5501 17.1699 44.5501H29.828C31.42 44.5501 32.7046 44.5501 33.7445 44.4659C34.8137 44.3777 35.7536 44.1917 36.6231 43.7491C38.0058 43.0454 39.13 41.9218 39.8346 40.5396C40.2772 39.6701 40.4612 38.7301 40.5494 37.6609C40.6336 36.6211 40.6336 35.3365 40.6336 33.7444V26.9611C40.6336 25.369 40.6336 24.0844 40.5494 23.0446C40.4612 21.9754 40.2752 21.0354 39.8326 20.166C39.1289 18.7833 38.0053 17.659 36.6231 16.9544C35.7634 16.5178 34.8352 16.3317 33.7797 16.2436V12.7285C33.7797 7.04963 29.1778 2.44775 23.4989 2.44775ZM30.8423 16.1555V12.7285C30.8423 10.781 30.0687 8.91312 28.6915 7.53596C27.3143 6.1588 25.4465 5.38512 23.4989 5.38512C21.5513 5.38512 19.6835 6.1588 18.3063 7.53596C16.9292 8.91312 16.1555 10.781 16.1555 12.7285V16.1555H30.8423ZM11.7083 19.5726C12.0941 19.3768 12.6052 19.2397 13.4942 19.1673C14.3989 19.0948 15.5641 19.0928 17.2325 19.0928H29.7653C31.4337 19.0928 32.5989 19.0928 33.5056 19.1673C34.3926 19.2397 34.9037 19.3768 35.2915 19.5726C36.1198 19.9956 36.7934 20.6692 37.2164 21.4995C37.4123 21.8853 37.5493 22.3964 37.6218 23.2855C37.6942 24.1902 37.6962 25.3534 37.6962 27.0237V33.6818C37.6962 35.3502 37.6962 36.5154 37.6218 37.422C37.5474 38.3091 37.4123 38.8202 37.2164 39.208C36.7934 40.0363 36.1198 40.7099 35.2915 41.1329C34.9037 41.3287 34.3926 41.4658 33.5036 41.5383C32.5989 41.6107 31.4337 41.6127 29.7653 41.6127H17.2325C15.5641 41.6127 14.3989 41.6127 13.4923 41.5383C12.6052 41.4639 12.0941 41.3287 11.7083 41.1329C10.8788 40.7109 10.2043 40.037 9.7814 39.208C9.58557 38.8202 9.4485 38.3091 9.37604 37.4201C9.30359 36.5154 9.30163 35.3502 9.30163 33.6818V27.0237C9.30163 25.3534 9.30163 24.1902 9.37604 23.2835C9.4485 22.3964 9.58557 21.8853 9.7814 21.4976C10.2043 20.6685 10.8788 19.9947 11.7083 19.5726Z" fill="black" />
              </svg>
            </S.LockIcon>

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

      {/* ROUTINE MODAL */}
      {
        showRoutineModal && (
          <RoutineModal
            onClose={() => setShowRoutineModal(false)}
          />
        )
      }

    </S.LandingPage >
  );
}

export default LandingPage;