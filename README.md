# 🧠 Brainfit

> 언제 쉴지, 무엇으로 쉴지까지 함께 제안하는 AI 휴식 인터벤션 서비스

Brainfit은 사용자의 PC 사용 패턴과 지금의 몸 상태(눈 피로, 목·어깨 뻐근함, 집중 저하, 졸림 등)를 함께 읽어,
적절한 휴식 시점을 먼저 제안하고 웹캠 기반의 짧은 회복 루틴으로 이어주는 웹 서비스입니다.
화면을 끄는 대신, 손과 얼굴을 직접 움직이며 반응하는 화면으로 전환해
디지털 기기 사용으로 지친 뇌와 몸을 깨우고 리셋합니다.

## 💡 Service

학술·의학적 근거를 참고한 인터벤션 타이머 엔진과 AI Hand·Face Tracking을 결합해,
"언제 쉴지"와 "무엇을 하며 쉴지"를 함께 개인화합니다.

- ⏱️ **Smart Timer Engine** : 상태별 휴식 주기와 PC 사용 패턴을 결합한 개인화 휴식 제안
- 🔔 **Two-Track Notification** : 사용 패턴 기반 자동 배치 + 현재 상태 기반 동적 계산의 하이브리드 알림
- 🖐️ **Hand Tracking** : 손동작을 활용한 인지 운동 미션
- 🙂 **Face Tracking** : 눈·목·어깨 움직임을 활용한 페이스·바디 웰니스
- 📊 **Digital Wellbeing** : 디지털 기기 사용 시간을 기록·분석
- 📅 **History** : 캘린더 형태로 수행 이력 확인

## 🎯 Goal

디지털 기기 사용으로 부족해진 휴식과 신체·인지 활동을,
사용자를 대신해 "언제·무엇을" 판단해주는 개인화된 인터벤션으로 관리할 수 있도록 돕습니다.

## ✨ 주요 기능

### 1. 스마트 인터벤션 타이머 엔진

학술·의학적 근거를 참고해 상태별로 서로 다른 휴식 주기를 적용하고, PC 사용 패턴과 결합해 불필요한 알림을 줄이면서 적절한 시점에 휴식을 제안합니다.

- 눈 피로, 목·어깨 뻐근함, 집중 저하, 졸림 등 사용자가 입력한 상태에 따라 휴식 주기가 달라짐
- PC 사용 패턴을 미리 입력하면 개인의 디지털 사용 상황에 맞게 일정이 정교해짐
- 사용 패턴 데이터가 부족해도 기본 휴식 루틴으로 바로 이용 가능

### 2. Two-Track 하이브리드 알림 시스템

| Track | 방식 | 설명 |
| --- | --- | --- |
| Track 1 | 패턴 기반 자동 배치 | 요일별 PC 사용 시간대와 과거 사용 패턴을 분석해, 사용이 집중되는 시간대에 휴식 알림을 자동 배치 |
| Track 2 | 상태 기반 동적 계산 | 현재 입력한 피로 상태와 세션 이후 예정된 작업 시간을 바탕으로 향후 회복 슬롯을 연쇄적으로 생성 |

예를 들어 '1시간 동안 코딩'을 설정하고 현재 상태가 눈 피로라면, 해당 상태에 맞는 휴식 간격을 기준으로 미래의 회복 슬롯이 순차적으로 만들어집니다. 새로운 타이머가 기존 알림과 가까우면 중복 알림을 정리하고, 알림 후 일정 시간 세션에 진입하지 않으면 자동으로 취소되어 작업 흐름을 불필요하게 방해하지 않습니다.

### 3. 맞춤형 회복 세션 (3단계, 상태 변화 반영)

하나의 세션은 아래 3단계로 구성되어 순차적으로 진행됩니다.

| 단계 | 이름 | 설명 |
| --- | --- | --- |
| BRAIN_WAKE | 가볍게 깨우기 | 시선과 손을 움직이며 화면에 집중해 흐트러진 감각을 깨움 |
| BRAIN_SHIFT | 맞춤 세션 | 하나의 활동(손/눈/목/어깨 등)에 집중하며 주의를 전환 |
| BRAIN_RESET | 마무리하기 | 호흡과 움직임으로 긴장을 내려놓는 마무리 루틴 |

특히 '맞춤 세션' 단계에서는 최초 입력 상태와 실제 휴식 시점에 새롭게 입력한 상태를 비교해 루틴을 갱신합니다. 예컨대 처음엔 눈 피로를 선택했지만 휴식 시점엔 목·어깨가 뻐근하다고 입력했다면 눈 이완과 목 스트레칭을 결합하고, 동일한 상태가 반복되면 중복 동작을 제거해 더 효율적인 루틴을 제공합니다.

### 4. 웹캠 기반 능동적 인터랙션

고개, 시선, 손, 상체 등의 움직임을 인식하고 반복 횟수·화면과의 거리 등 즉각적인 피드백을 제공해, 영상을 시청하는 수동적 휴식과 차별화합니다.

**손(Hand) 인지 미션** — 웹캠 영상에서 손 랜드마크를 추적하는 미니게임형 미션

- 같은 색깔 구역에 공 넣기 (`COLOR_SORT`)
- 순서대로 공 잡기 (`SEQUENCE`)
- 움직이는 목표에 공 넣기 (`MOVING_TARGET`)
- 같은 색 3개 모으기 (`SAME_COLOR`)

**얼굴·자세 기반 루틴** — 각 루틴은 `low / medium / high` 난이도를 지원

- 눈 깜빡임 (Eye Blink)
- 시선 추적 (Eye Tracking)
- 목 스트레칭 (Neck Stretch)
- 어깨 PMR (Shoulder PMR, 점진적 근이완)
- 포커스 핀치 (Focus Pinch)
- 기상 루틴 (Wake-up Sunrise)
- 호흡 루틴 (Breath)

### 5. 디지털 사용 시간 관리 & 히스토리

- 하루 디지털 기기 사용 시간을 기록/분석하고 알림 스케줄을 설정
- 세션 수행 이력을 캘린더로 조회

## 🛠️ 기술 스택

**Frontend**

- React 19 + React Router 7 (SPA, 클라이언트 라우팅)
- Vite 8 (빌드/개발 서버)
- styled-components (CSS-in-JS)
- axios (백엔드 API 통신)
- oxlint (린트)

**AI / Computer Vision**

- `@mediapipe/tasks-vision` (Google MediaPipe HandLandmarker) — 웹캠 영상에서 손 랜드마크를 실시간 추출해 손 인지 미션 판정에 사용
- 얼굴·시선·자세 트래킹(눈 깜빡임, 시선, 목/어깨 자세)에도 동일한 비전 트래킹 파이프라인 활용

**인증 / 데이터**

- 별도 로그인 없이 브라우저별 UUID(`X-Device-Code` 헤더)로 사용자를 식별
- 세션/플랜/디지털 사용량 데이터는 분리된 백엔드 API(`api.dgu14thlikelion.shop`)와 통신

**인프라 / 배포**

- GitHub Actions CI/CD
- 가비아(Gabia) 클라우드 서버 + Nginx 정적 파일 서빙

## 📁 프로젝트 구조

```text
src/
├── api/          # 백엔드 API 클라이언트 및 도메인별 요청 함수
├── components/   # 공통 UI, 세션/루틴/히스토리/디지털 상태 컴포넌트
├── config/       # 미션·난이도·트래킹 등 각종 설정값
├── data/         # 정적 데이터(루틴 소개, 히스토리 프리뷰 등)
├── engine/       # 손 미션용 공(ball) 물리/렌더링/미션 매니저
├── hooks/        # 카메라·트래킹·세션 상태 등 커스텀 훅
├── pages/        # 라우트별 페이지 컴포넌트
├── router/       # React Router 라우트 정의
├── styles/       # 전역 스타일
└── utils/        # 카메라, 날짜, 손 좌표 계산 등 유틸 함수
```

## 👥 Team

**멋쟁이사자처럼 동국대학교 중앙해커톤 4팀**

## 🚀 Getting Started

```bash
npm install
npm install @mediapipe/tasks-vision
npm run dev
```

## 🚢 Deployment

이 프로젝트는 GitHub Actions에서 프론트엔드를 빌드한 뒤, 가비아 클라우드 서버의 정적 파일 배포 디렉터리로 산출물을 업로드해 자동 배포합니다.

### 자동 배포 흐름

- `main` 브랜치에 push하면 `npm ci` → `npm run lint` → `npm run build` 후 가비아 서버로 `dist` 산출물이 업로드됩니다.
- `main` 대상 Pull Request에서는 배포 없이 lint/build 검증만 실행됩니다.
- 수동 배포가 필요하면 GitHub `Actions` 탭에서 `Deploy Frontend to Gabia` 워크플로우를 `Run workflow`로 실행합니다.

### 최초 1회 서버 설정

가비아 클라우드 콘솔 터미널에서 프론트엔드 정적 파일이 위치할 디렉터리를 준비합니다.

```bash
sudo mkdir -p /var/www/brainfit
sudo chown -R $USER:$USER /var/www/brainfit
```

Nginx를 사용한다면 프론트엔드 도메인이 위 디렉터리를 바라보도록 설정합니다.

```nginx
server {
    listen 80;
    server_name www.dgu14thlikelion.shop;

    root /var/www/brainfit;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

API 서버는 프론트엔드와 분리된 주소를 사용합니다.

```text
Frontend: https://www.dgu14thlikelion.shop
Backend API: https://api.dgu14thlikelion.shop/api/v1
```

### GitHub Actions 설정

GitHub 저장소에서 `Settings` → `Secrets and variables` → `Actions`로 이동해 아래 값을 등록합니다.

Secrets:

- `GABIA_HOST`: 가비아 서버 IP 또는 도메인
- `GABIA_USER`: SSH 접속 사용자
- `GABIA_SSH_PORT`: SSH 포트, 기본값은 `22`
- `GABIA_SSH_PRIVATE_KEY`: GitHub Actions 배포용 SSH private key
- `GABIA_DEPLOY_PATH`: 프론트엔드 정적 파일 배포 경로, 예: `/var/www/brainfit`

Variables:

- `VITE_API_BASE_URL`: 배포 환경 API 주소, 예: `https://api.dgu14thlikelion.shop/api/v1`
- `GABIA_POST_DEPLOY_COMMAND`: 배포 후 실행할 명령, 예: `sudo systemctl reload nginx`

### 배포용 SSH 키 설정

로컬 또는 서버에서 배포 전용 SSH 키를 생성합니다.

```bash
ssh-keygen -t ed25519 -C "github-actions-brainfit-deploy" -f gabia_deploy_key
```

가비아 서버의 배포 사용자에 public key를 등록합니다.

```bash
mkdir -p ~/.ssh
cat gabia_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

`gabia_deploy_key` 파일의 내용을 GitHub Secret `GABIA_SSH_PRIVATE_KEY`에 등록합니다.

### 로컬 사전 검증

```bash
npm ci
npm run lint
npm run build
```
