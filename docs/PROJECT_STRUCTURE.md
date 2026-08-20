# Brainfit 프로젝트 구조 문서

작성일: 2026-08-19

이 문서는 현재 프론트엔드 프로젝트의 디렉터리/파일 역할과, 구현된 화면 및 기능이 어느 코드에 위치하는지 빠르게 파악하기 위한 안내서입니다.

## 1. 프로젝트 개요

Brainfit은 웹캠 기반 손 움직임과 호흡 루틴을 활용해 디지털 피로 회복을 돕는 React/Vite 프론트엔드입니다.

- 주요 프레임워크: React 19, Vite
- 라우팅: `react-router-dom`
- 스타일링: `styled-components`
- 손 인식: `@mediapipe/tasks-vision`
- API 통신: `fetch`, 일부 의존성으로 `axios` 설치됨
- 린트: `oxlint`

## 2. 실행 및 설정 파일

| 파일 | 역할 |
| --- | --- |
| `.env` | Vite 환경변수 파일입니다. 현재 API 코드에서 `VITE_API_BASE_URL`을 읽어 백엔드 기본 URL로 사용합니다. |
| `.gitignore` | `node_modules`, `dist`, 로그, IDE 파일, 백엔드 폴더 등을 Git 추적에서 제외합니다. |
| `.oxlintrc.json` | `oxlint` 설정입니다. React Hooks 규칙과 컴포넌트 export 관련 규칙을 지정합니다. |
| `index.html` | Vite 앱의 HTML 진입점입니다. Google Fonts를 로드하고 `/src/main.jsx`를 실행합니다. |
| `package.json` | 프로젝트 이름, 스크립트, 런타임/개발 의존성을 정의합니다. |
| `package-lock.json` | npm 의존성 잠금 파일입니다. |
| `README.md` | 서비스 소개와 기본 실행 방법을 담은 루트 README입니다. |
| `vite.config.js` | Vite 설정 파일입니다. 현재 React 플러그인만 등록되어 있습니다. |

주요 npm 스크립트:

```bash
npm run dev      # Vite 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # oxlint 실행
npm run preview  # 빌드 결과 미리보기
```

## 3. 최상위 디렉터리 구조

```text
.
├─ public/
├─ src/
├─ docs/
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
└─ vite.config.js
```

| 디렉터리 | 역할 |
| --- | --- |
| `public/` | 정적 파일을 보관합니다. Vite에서 루트 경로(`/images/...`)로 접근할 수 있습니다. |
| `src/` | React 애플리케이션 소스 코드 전체가 위치합니다. |
| `docs/` | 프로젝트 이해를 위한 문서가 위치합니다. 현재 문서가 여기에 포함됩니다. |

## 4. `public/` 구조

| 경로 | 역할 |
| --- | --- |
| `public/images/brain-reset.png` | 루틴 카드 이미지로 사용됩니다. `src/data/routineData.jsx`에서 참조합니다. |
| `public/images/problem.png` | Why Brainfit 슬라이드 이미지로 사용됩니다. |
| `public/images/interaction.png` | Why Brainfit 슬라이드 이미지로 사용됩니다. |
| `public/fonts/SUIT-Variable.woff2` | SUIT 폰트 파일입니다. 현재 코드에서 직접 `@font-face`로 연결된 부분은 확인되지 않습니다. |
| `public/models/hand_detector.tflite` | 손 인식 모델 파일로 보입니다. 현재 `useHandTracking`은 이 파일 대신 MediaPipe 원격 `hand_landmarker.task` 모델을 사용합니다. |

## 5. `src/` 진입점과 라우팅

| 파일 | 역할 |
| --- | --- |
| `src/main.jsx` | React 앱 진입점입니다. `RouterProvider`에 `router`를 연결해 앱을 렌더링합니다. |
| `src/App.jsx` | 공통 레이아웃입니다. `GlobalStyle`, `Header`, `Outlet`, `Footer`를 감싸고 1440px 기준 래퍼를 구성합니다. |
| `src/router/router.jsx` | 라우트 정의 파일입니다. `/`, `/handroutine`, `/breathroutine` 경로를 등록합니다. |

라우팅 구조:

| 경로 | 화면 컴포넌트 | 설명 |
| --- | --- | --- |
| `/` | `src/pages/LandingPage.jsx` | 메인 랜딩/대시보드 화면입니다. 루틴, 기록, Brainfit 소개, 디지털 사용 상태를 보여줍니다. |
| `/handroutine` | `src/pages/HandRoutinePage.jsx` | 웹캠 손 인식 기반 공 옮기기 미션 화면입니다. |
| `/breathroutine` | `src/pages/BreathRoutinePage.jsx` | 호흡 애니메이션과 단계 안내를 제공하는 호흡 루틴 화면입니다. |

## 6. `src/pages/` 구조

| 파일 | 역할 |
| --- | --- |
| `LandingPage.jsx` | 메인 화면입니다. 히어로, 루틴 탭, 히스토리 탭, Why Brainfit 탭, 디지털 상태 섹션, 온보딩/시간 변경 모달을 조합합니다. |
| `LandingPage.styled.js` | 랜딩 페이지 히어로, 탭, 루틴 섹션 등 페이지 단위 스타일을 정의합니다. |
| `HandRoutinePage.jsx` | 손 추적 루틴의 상태, 카메라 초기화, 미션 루프, 공 잡기/놓기 판정, Canvas 렌더링을 연결합니다. |
| `HandRoutinePage.styled.js` | 손 루틴과 공통 세션 화면의 검은 배경 레이아웃, 플레이 영역, 컨트롤 영역 스타일을 정의합니다. |
| `BreathRoutinePage.jsx` | 들숨 4초, 멈춤 2초, 날숨 6초 루틴을 2회 반복하는 호흡 세션 화면입니다. |
| `SessionPage.jsx` | 손 루틴과 호흡 루틴이 공유하는 세션 레이아웃입니다. 플레이 영역, 카메라, 데이터 패널, 미션 안내, 진행바, 종료/완료 모달, 하단 컨트롤을 배치합니다. |

## 7. `src/components/` 구조

### 7.1 공통 컴포넌트

| 파일 | 역할 |
| --- | --- |
| `Header.jsx` | 상단 헤더입니다. 로고 클릭 시 홈으로 이동하고, Routine/My Digital State 메뉴 클릭 시 랜딩 페이지의 해당 영역으로 스크롤하도록 `location.state`를 넘깁니다. |
| `Header.styled.js` | 헤더 스타일입니다. |
| `Footer.jsx` | 하단 푸터입니다. 현재 `/handroutine` 경로에서만 다크 스타일을 적용합니다. |
| `Footer.styled.js` | 푸터 스타일입니다. |
| `SetupModal.jsx` | 최초 접속 또는 계획 재설정 시 뜨는 설정 모달입니다. 현재 상태 선택, 활동 선택, 활동 시간 선택을 처리합니다. |
| `SetupModal.styled.js` | 설정 모달 스타일입니다. |

### 7.2 `src/components/landingpage/`

랜딩 페이지에서 사용하는 섹션/카드/모달 컴포넌트입니다.

| 파일 | 역할 |
| --- | --- |
| `RoutineCard.jsx` | Today's Routine 카드입니다. 제목, 설명, 상태, 배경 이미지를 표시하고 시작 버튼 클릭을 부모로 전달합니다. |
| `RoutineCard.styled.js` | 루틴 카드 스타일입니다. |
| `RoutineModal.jsx` | 이전 루틴 미완료 시 표시되는 경고 모달입니다. |
| `RoutineModal.styled.js` | 루틴 경고 모달 스타일입니다. |
| `WhyBrainfit.jsx` | Brainfit의 문제의식/관점을 슬라이드 형태로 보여줍니다. |
| `WhyBrainfit.styled.jsx` | Why Brainfit 슬라이드 섹션 스타일입니다. |
| `YourHistory.jsx` | 날짜 선택 캘린더와 사용 기록 테이블을 표시합니다. |
| `YourHistory.styled.js` | 히스토리 섹션, 캘린더, 테이블 스타일입니다. |
| `DigitalState.jsx` | 디지털 사용 상태 섹션의 상위 컴포넌트입니다. 패턴 존재 여부와 분석 결과를 API로 조회한 뒤 잠금/입력/결과 UI를 선택합니다. |
| `DigitalState.styled.js` | 디지털 상태 섹션의 잠금 화면 및 레이아웃 스타일입니다. |
| `DigitalUsage.jsx` | PC 사용 패턴 입력표, 분석 카드, 추천 휴식 일정 카드, 저장/생성/수정 버튼을 조합합니다. |
| `DigitalUsage.styled.js` | 디지털 사용 패턴 입력/결과 카드들의 스타일입니다. |
| `UsageTable.jsx` | 요일 x 24시간 사용 패턴 체크 테이블입니다. |
| `UsageTable.styled.js` | 사용 패턴 테이블 스타일입니다. |
| `DigitalAnalysisCard.jsx` | 분석 결과 카드입니다. 입력 전에는 잠금 안내를, 결과 모드에서는 분석 요약을 표시합니다. |
| `DigitalScheduleCard.jsx` | 오늘의 추천 휴식 일정 카드입니다. 결과 모드에서 자동 알림 토글을 표시합니다. |
| `TimeChangeModal.jsx` | 히어로의 리셋 시간을 변경하는 모달입니다. 추천 시간, 직접 시간 선택, 반복 알림 토글을 제공합니다. |
| `TimeChangeModal.styled.js` | 시간 변경 모달 스타일입니다. |

### 7.3 `src/components/sessions/`

손 루틴과 호흡 루틴의 세션 화면에서 공통으로 사용하는 컴포넌트입니다.

| 파일 | 역할 |
| --- | --- |
| `HandPlayArea.jsx` | 손 루틴의 Canvas 요소를 렌더링합니다. 실제 그림은 `src/engine/canvasRenderer.js`에서 수행됩니다. |
| `BreathPlayArea.jsx` | 호흡 루틴의 중앙 원형 애니메이션을 렌더링합니다. |
| `CameraPreview.jsx` | 카메라 영상 미리보기와 로딩 문구를 표시합니다. |
| `CameraPreview.styled.js` | 카메라 프리뷰 스타일입니다. |
| `SessionDataPanel.jsx` | 지속 시간, 미션 성공 횟수, 손 인식 개수, 화면 거리 상태를 표시합니다. 호흡 루틴에서는 시간만 표시됩니다. |
| `SessionDataPanel.styled.js` | 세션 데이터 패널 스타일입니다. |
| `SessionControls.jsx` | 세션 종료/초기화 버튼을 표시합니다. |
| `SessionControls.styled.js` | 세션 컨트롤 버튼 스타일입니다. |
| `MissionInstruction.jsx` | 현재 미션 안내 문구를 표시합니다. 손 미션과 호흡 단계 문구를 모두 처리합니다. |
| `MissionInstruction.styled.js` | 미션 안내 텍스트 스타일입니다. |
| `ProgressBar.jsx` | 손 미션 진행률 또는 호흡 단계 진행률을 표시합니다. |
| `ProgressBar.styled.js` | 진행바 스타일입니다. |
| `SessionEndModal.jsx` | 미션 완료 또는 세션 종료 시 표시되는 모달입니다. 홈 이동/다시 시작 동작을 제공합니다. |
| `QuitConfirmModal.jsx` | 세션 종료 확인 모달입니다. |
| `Modal.styled.js` | 세션 완료/종료 계열 모달의 공통 스타일입니다. |

## 8. `src/hooks/` 구조

| 파일 | 역할 |
| --- | --- |
| `useSetupModal.js` | 설정 모달의 단계 이동, 상태/활동/시간 선택, 직접 입력 상태를 관리합니다. |
| `useTimeChangeModal.js` | 시간 변경 모달의 추천 시간 선택, 스크롤형 시/분 선택, 반복 토글, 저장 처리를 담당합니다. |
| `useWhyBrainfit.js` | Why Brainfit 슬라이드의 현재 인덱스, 이전/다음 이동, dot 이동을 관리합니다. |
| `useHistoryCalendar.js` | 히스토리 날짜 선택, 달력 열기/닫기, 월 이동, 날짜 선택 상태를 관리합니다. |
| `useDigitalState.js` | 디지털 상태 섹션의 `locked`, `input`, `result` 단계를 관리합니다. |
| `useDigitalUsage.js` | PC 사용 패턴 선택값, 저장 중 상태, 알림 토글, 임시 저장/생성 버튼 동작을 관리합니다. |
| `useHandTracking.js` | MediaPipe HandLandmarker 초기화, 웹캠 시작/정리, 손 좌표/주먹 여부/화면 거리 계산을 담당합니다. |
| `useSessionState.js` | 손 루틴 세션의 공, 미션, 진행률, 타이머, 완료/종료 상태와 관련 ref/state를 한곳에서 관리합니다. |
| `useSessionLoop.js` | `requestAnimationFrame` 기반 세션 프레임 루프를 실행/정리합니다. |

## 9. `src/engine/` 구조

손 루틴의 핵심 게임 로직입니다.

| 파일 | 역할 |
| --- | --- |
| `missionManager.js` | 미션 초기화, 목표 영역 선택, 목표 안에 공이 들어갔는지 판정, 미션 성공/실패 처리를 담당합니다. |
| `ballManager.js` | 움직이는 목표 위치 갱신, 손에 잡힌 공 위치 이동, 손을 폈을 때 공 놓기, 가장 가까운 공 잡기를 처리합니다. |
| `canvasRenderer.js` | Canvas에 목표 영역, 공, 손 위치, 손-공 연결선을 그립니다. |

## 10. `src/config/` 구조

| 파일 | 역할 |
| --- | --- |
| `handRoutineConfig.js` | 손 추적/공 조작 관련 수치 설정입니다. 위치 smoothing, 주먹 판정 임계값, 공 잡기 거리, 타임어택 시간 등이 포함됩니다. |
| `handMissions.js` | 손 루틴 미션 목록입니다. 색 분류, 순서 잡기, 움직이는 목표, 같은 색 모으기, 타임어택을 정의합니다. |
| `ballTypes.js` | 공 색상 타입과 표시 이름을 정의합니다. |
| `digitalUsageConfig.js` | 추천 휴식 일정과 초기 알림 상태를 정의합니다. |
| `usageTableConfig.js` | PC 사용 패턴 테이블의 요일과 24시간 시간대 목록을 정의합니다. |
| `timeChangeConfig.js` | 시간 변경 모달의 추천 시간, 시/분 목록, picker item 높이를 정의합니다. |

## 11. `src/data/` 구조

현재 랜딩 페이지의 여러 영역은 정적 데이터를 사용합니다.

| 파일 | 역할 |
| --- | --- |
| `routineData.jsx` | Today's Routine 카드 데이터입니다. 루틴 제목, 설명, 상태, 이미지 경로를 정의합니다. |
| `whybrainfitData.jsx` | Why Brainfit 슬라이드 데이터입니다. 문제 제기/관점/웹캠 활용 메시지와 카드 정보를 정의합니다. |
| `historyData.js` | Your History 테이블에 표시되는 사용 기록 목업 데이터입니다. |

## 12. `src/api/` 구조

| 파일 | 역할 |
| --- | --- |
| `digitalState.js` | 디지털 사용 패턴 관련 백엔드 API 함수 모음입니다. `VITE_API_BASE_URL`을 기준으로 조회, 상태 확인, 분석 조회, 일괄 저장, 초기화를 수행합니다. |

API 함수:

| 함수 | HTTP | 경로 | 역할 |
| --- | --- | --- | --- |
| `getDigitalPatterns` | `GET` | `/digital-state/patterns/` | 저장된 PC 사용 패턴 조회 |
| `getDigitalPatternStatus` | `GET` | `/digital-state/patterns/status/` | 사용 패턴 존재 여부 조회 |
| `getDigitalPatternAnalysis` | `GET` | `/digital-state/patterns/analysis/` | 사용 패턴 분석 결과 조회 |
| `saveDigitalPatterns` | `PUT` | `/digital-state/patterns/bulk/` | 사용 패턴 일괄 저장 |
| `deleteDigitalPatterns` | `DELETE` | `/digital-state/patterns/` | 사용 패턴 초기화 |

## 13. `src/utils/` 구조

| 파일 | 역할 |
| --- | --- |
| `handUtils.js` | 손 루틴에서 사용하는 시간 포맷, 거리 계산, 선형 보간, 랜덤 미션 선택, 공 생성 유틸을 제공합니다. |
| `dateUtils.js` | 히스토리 날짜 포맷과 월별 캘린더 day 배열 생성을 담당합니다. |

## 14. `src/styles/` 구조

| 파일 | 역할 |
| --- | --- |
| `GlobalStyle.jsx` | CSS reset과 전역 `box-sizing`을 정의합니다. `App.jsx`에서 적용합니다. |
| `theme.js` | theme 객체를 export합니다. 현재는 비어 있습니다. |

## 15. `src/assets/` 구조

| 경로 | 역할 |
| --- | --- |
| `src/assets/icons/ArrowIcon.svg` | 루틴 카드 시작 버튼 아이콘입니다. |
| `src/assets/icons/ArrowSide.svg` | Why Brainfit 슬라이드 좌우 이동 아이콘입니다. |
| `src/assets/icons/CloseButton.svg` | 설정/시간 변경 모달 닫기 버튼 아이콘입니다. |
| `src/assets/icons/ClockIcon.svg` | 추천 휴식 일정 카드 아이콘입니다. |
| `src/assets/icons/LockIcon.svg` | 디지털 상태 잠금/분석 대기 UI 아이콘입니다. |
| `src/assets/icons/streamLine.svg` | 세션 완료 모달 아이콘입니다. |
| `src/assets/icons/Warning.svg` | 루틴 제한/세션 종료 경고 모달 아이콘입니다. |

## 16. 구현된 화면 및 기능 매핑

### 16.1 공통 레이아웃

| 기능 | 구현 위치 | 설명 |
| --- | --- | --- |
| 앱 진입 및 라우터 연결 | `src/main.jsx` | `RouterProvider`로 전체 라우터를 연결합니다. |
| Header/Outlet/Footer 공통 배치 | `src/App.jsx` | 모든 라우트가 공통 레이아웃 안에서 렌더링됩니다. |
| 상단 메뉴 이동 | `src/components/Header.jsx` | Routine/My Digital State 클릭 시 홈으로 이동하면서 스크롤 대상 상태를 전달합니다. |
| 하단 푸터 | `src/components/Footer.jsx` | 연락처, 제품, 팀 정보, 앱 스토어 버튼 UI를 표시합니다. |

### 16.2 랜딩 페이지 `/`

| 기능/화면 | 구현 위치 | 설명 |
| --- | --- | --- |
| 히어로 섹션 | `src/pages/LandingPage.jsx`, `src/pages/LandingPage.styled.js` | 서비스 카피, 시작 버튼, 계획 재설정 버튼, 다음 리셋 시간 카드가 포함됩니다. |
| 최초 접속 설정 모달 | `src/pages/LandingPage.jsx`, `src/components/SetupModal.jsx`, `src/hooks/useSetupModal.js` | `sessionStorage.hasSeenSetupModal`을 사용해 브라우저 탭 최초 접속 시 한 번 표시합니다. |
| 계획 재설정 모달 | `src/pages/LandingPage.jsx`, `src/components/SetupModal.jsx` | 히어로의 "내 계획 다시 설정" 버튼에서 `mode="reset"`으로 열립니다. |
| 리셋 시간 변경 | `src/components/landingpage/TimeChangeModal.jsx`, `src/hooks/useTimeChangeModal.js`, `src/config/timeChangeConfig.js` | 추천 시간/직접 시간 선택/반복 토글을 제공하고 `LandingPage`의 `resetTime` 상태를 갱신합니다. |
| Today's Routine 탭 | `src/pages/LandingPage.jsx`, `src/components/landingpage/RoutineCard.jsx`, `src/data/routineData.jsx` | 3개 루틴 카드를 표시합니다. 첫 번째 루틴 시작 시 `/handroutine`으로 이동합니다. |
| 루틴 순서 제한 모달 | `src/components/landingpage/RoutineModal.jsx` | 이전 루틴 미완료 상태에서 뒤 루틴을 시작하면 경고 모달을 표시합니다. |
| Why Brainfit 탭 | `src/components/landingpage/WhyBrainfit.jsx`, `src/hooks/useWhyBrainfit.js`, `src/data/whybrainfitData.jsx` | 슬라이드와 dot/화살표 이동을 제공합니다. |
| Your History 탭 | `src/components/landingpage/YourHistory.jsx`, `src/hooks/useHistoryCalendar.js`, `src/data/historyData.js` | 날짜 선택 캘린더와 사용 기록 테이블을 표시합니다. |
| My Digital State 섹션 | `src/components/landingpage/DigitalState.jsx`, `src/hooks/useDigitalState.js`, `src/api/digitalState.js` | 백엔드에서 PC 사용 패턴 존재 여부와 분석 결과를 조회합니다. |
| PC 사용 패턴 입력/저장 | `src/components/landingpage/DigitalUsage.jsx`, `src/components/landingpage/UsageTable.jsx`, `src/hooks/useDigitalUsage.js` | 요일/시간대별 체크 테이블을 제공하고 API에 저장합니다. |
| 분석 결과 카드 | `src/components/landingpage/DigitalAnalysisCard.jsx` | 입력 전 안내와 결과 모드의 분석 요약을 표시합니다. |
| 추천 휴식 일정 카드 | `src/components/landingpage/DigitalScheduleCard.jsx`, `src/config/digitalUsageConfig.js` | 결과 모드에서 추천 시간과 자동 알림 토글을 표시합니다. |

### 16.3 손 루틴 `/handroutine`

| 기능/화면 | 구현 위치 | 설명 |
| --- | --- | --- |
| 손 루틴 페이지 | `src/pages/HandRoutinePage.jsx` | 카메라/MediaPipe 초기화, 프레임 루프, 미션 처리, 세션 UI 연결을 담당합니다. |
| 웹캠/손 인식 | `src/hooks/useHandTracking.js` | MediaPipe HandLandmarker로 최대 2개 손을 인식하고 손 좌표, 주먹 여부, 화면 거리 상태를 계산합니다. |
| 세션 상태 | `src/hooks/useSessionState.js` | 공 목록, 미션, 진행률, 성공 횟수, 제한 시간, 완료/종료 상태를 관리합니다. |
| 프레임 루프 | `src/hooks/useSessionLoop.js` | `requestAnimationFrame` 루프를 실행합니다. |
| 미션 초기화/판정 | `src/engine/missionManager.js` | 미션 타입에 맞게 공/목표를 배치하고 공을 놓았을 때 성공 여부를 판정합니다. |
| 공 잡기/놓기 | `src/engine/ballManager.js` | 주먹을 쥐면 가까운 공을 잡고, 손을 펴면 일정 시간 뒤 놓는 로직을 처리합니다. |
| Canvas 렌더링 | `src/components/sessions/HandPlayArea.jsx`, `src/engine/canvasRenderer.js` | 목표 영역, 공, 손 위치, 연결선을 Canvas에 그립니다. |
| 카메라 프리뷰 | `src/components/sessions/CameraPreview.jsx` | 세션 화면 위에 카메라 영상을 표시합니다. |
| 데이터 패널 | `src/components/sessions/SessionDataPanel.jsx` | 지속 시간, 성공 횟수, 손 인식 개수, 화면 거리 상태를 표시합니다. |
| 미션 안내 | `src/components/sessions/MissionInstruction.jsx` | 현재 미션에 맞는 안내 문구를 표시합니다. |
| 진행바 | `src/components/sessions/ProgressBar.jsx` | 미션 진행률을 0~100%로 표시합니다. |
| 종료/초기화/완료 모달 | `src/pages/SessionPage.jsx`, `src/components/sessions/SessionControls.jsx`, `src/components/sessions/QuitConfirmModal.jsx`, `src/components/sessions/SessionEndModal.jsx` | 세션 종료 확인, 홈 이동, 다시 시작 동작을 제공합니다. |

손 루틴 미션 타입:

| 미션 타입 | 정의 위치 | 동작 |
| --- | --- | --- |
| `COLOR_SORT` | `src/config/handMissions.js`, `src/engine/missionManager.js` | 각 공을 같은 색 목표 영역에 넣습니다. |
| `SEQUENCE` | `src/config/handMissions.js`, `src/engine/missionManager.js` | 지정된 색 순서대로 공을 잡아 옮깁니다. |
| `MOVING_TARGET` | `src/config/handMissions.js`, `src/engine/ballManager.js` | 움직이는 목표에 공 3개를 넣습니다. |
| `SAME_COLOR` | `src/config/handMissions.js`, `src/utils/handUtils.js` | 같은 색 공 3개를 목표 영역에 모읍니다. |
| `TIME_ATTACK` | `src/config/handMissions.js`, `src/config/handRoutineConfig.js` | 20초 안에 공 3개를 목표 영역으로 옮깁니다. |

### 16.4 호흡 루틴 `/breathroutine`

| 기능/화면 | 구현 위치 | 설명 |
| --- | --- | --- |
| 호흡 루틴 페이지 | `src/pages/BreathRoutinePage.jsx` | 들숨/멈춤/날숨 단계, 전체 시간, 완료/종료 상태를 관리합니다. |
| 호흡 애니메이션 | `src/components/sessions/BreathPlayArea.jsx` | 12초 주기의 scale 애니메이션 원을 표시합니다. |
| 단계 안내 | `src/components/sessions/MissionInstruction.jsx` | `INHALE`, `HOLD`, `EXHALE` 상태에 따라 안내 문구를 표시합니다. |
| 호흡 진행바 | `src/components/sessions/ProgressBar.jsx` | 현재 호흡 사이클 안에서 들숨/멈춤/날숨 진행률을 표시합니다. |
| 공통 세션 UI | `src/pages/SessionPage.jsx` | 손 루틴과 동일한 세션 레이아웃, 종료/초기화/완료 모달을 사용합니다. |

호흡 루틴 시간 구성:

| 단계 | 시간 |
| --- | --- |
| 들숨 | 4초 |
| 멈춤 | 2초 |
| 날숨 | 6초 |
| 전체 | 12초 사이클 x 2회 = 24초 |

## 17. 데이터 흐름 요약

### 17.1 랜딩 초기 설정 흐름

```text
LandingPage
└─ sessionStorage.hasSeenSetupModal 확인
   ├─ 없으면 SetupModal initial 모드 표시
   └─ 있으면 모달 생략
```

### 17.2 디지털 사용 패턴 흐름

```text
DigitalState
├─ getDigitalPatternStatus()
├─ has_any_pattern이 true면 getDigitalPatternAnalysis()
└─ useDigitalState의 단계에 따라
   ├─ locked: 입력 유도 잠금 UI
   ├─ input: UsageTable 입력 UI
   └─ result: 분석/추천 일정 UI
```

저장/생성 버튼 흐름:

```text
DigitalUsage
└─ useDigitalUsage
   ├─ 임시 저장: saveDigitalPatterns(selected)
   └─ 타이머 생성: saveDigitalPatterns(selected) 성공 후 result 모드 전환
```

### 17.3 손 루틴 세션 흐름

```text
HandRoutinePage
├─ useHandTracking: MediaPipe 초기화 + 카메라 시작
├─ useSessionState: 미션/공/진행 상태 초기화
├─ useSessionLoop: requestAnimationFrame 실행
└─ 매 프레임
   ├─ detectHands()
   ├─ updateMovingTarget()
   ├─ updateGrabbedBalls()
   ├─ grabNearestBall()
   └─ renderSession()
```

### 17.4 호흡 루틴 세션 흐름

```text
BreathRoutinePage
├─ performance.now() 기준 elapsed 계산
├─ 4초 들숨, 2초 멈춤, 6초 날숨 단계 계산
├─ 24초 도달 시 완료 상태 전환
└─ SessionPage에 진행 상태 전달
```

## 18. 현재 구현 상태 및 주의점

아래 항목은 문서 작성 시점의 코드 기준으로 확인한 구현 메모입니다.

- `DigitalAnalysisCard.jsx`는 `analysis` prop을 받을 수 있는 구조지만 현재 실제 API 분석값을 화면에 사용하지 않고 정적 수치/문구를 표시합니다.
- `UsageTable.jsx`는 `toggleCell(rowIndex, colIndex)`, `toggleRow(rowIndex)` 형태로 호출하지만, `useDigitalUsage.js`의 `toggleCell`은 단일 key를, `toggleRow`는 `rowKeys.every(...)`가 가능한 배열을 기대합니다. 현재 상태로는 체크 UI 또는 행 전체 선택 동작이 의도대로 작동하지 않을 수 있습니다.
- `LandingPage.jsx`의 `completedRoutines`는 `[false, false, false]`로 고정되어 있어 실제 루틴 완료 여부가 저장/반영되지 않습니다.
- `LandingPage.jsx`의 `repeatAlarm` 상태는 시간 변경 모달에서 저장되지만 현재 화면 동작에 추가로 사용되지는 않습니다.
- `public/models/hand_detector.tflite`는 저장소에 포함되어 있지만 현재 손 루틴은 원격 MediaPipe 모델 URL을 사용합니다.
- `Footer.jsx`의 다크 푸터 적용 경로는 현재 `/handroutine`만 포함합니다. `/breathroutine`은 공통 세션 레이아웃을 쓰지만 푸터 다크 경로에는 포함되어 있지 않습니다.

## 19. 빠른 탐색 가이드

목적별로 먼저 볼 파일:

| 알고 싶은 것 | 먼저 볼 파일 |
| --- | --- |
| 앱 전체 라우팅 | `src/router/router.jsx` |
| 공통 레이아웃 | `src/App.jsx` |
| 랜딩 화면 구성 | `src/pages/LandingPage.jsx` |
| 루틴 카드 데이터 | `src/data/routineData.jsx` |
| 손 루틴 핵심 흐름 | `src/pages/HandRoutinePage.jsx` |
| 손 인식 로직 | `src/hooks/useHandTracking.js` |
| 손 루틴 미션 판정 | `src/engine/missionManager.js` |
| 손 루틴 Canvas 렌더링 | `src/engine/canvasRenderer.js` |
| 호흡 루틴 로직 | `src/pages/BreathRoutinePage.jsx` |
| 세션 공통 UI | `src/pages/SessionPage.jsx` |
| 디지털 상태 API | `src/api/digitalState.js` |
| PC 사용 패턴 입력 | `src/components/landingpage/UsageTable.jsx`, `src/hooks/useDigitalUsage.js` |
| 히스토리 달력 | `src/hooks/useHistoryCalendar.js`, `src/utils/dateUtils.js` |
| 전역 스타일 | `src/styles/GlobalStyle.jsx` |
