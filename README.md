# 🧠 Brainfit

> 매일 10분, 뇌와 표정을 깨우는 AI 데일리 웰니스

Brainfit은 노트북·PC의 웹캠을 활용해  
손과 얼굴을 직접 움직이며 인지 건강과 웰니스를 관리하는 웹 서비스입니다.

## 💡 Service

AI Hand·Face Tracking을 활용하여 사용자의 움직임을 분석하고  
매일 10분 동안 수행할 수 있는 맞춤형 웰니스 루틴을 제공합니다.

- 🖐️ **Hand Tracking** : 손동작을 활용한 인지 운동
- 🙂 **Face Tracking** : 얼굴 움직임을 활용한 페이스 웰니스
- 🧘 **Mindfulness** : 하루 루틴을 마무리하는 마인드풀니스

## 🎯 Goal

디지털 기기 사용으로 부족해진 신체·인지 활동을  
하루 10분의 작은 습관으로 관리할 수 있도록 돕습니다.

## 👥 Team

**멋쟁이사자처럼 동국대학교 중앙해커톤 4팀**

## 🚀 Getting Started

```bash
npm install
npm install @mediapipe/tasks-vision
npm run dev
```

## 🚢 Deployment

이 프로젝트는 GitHub Actions와 GitHub Pages로 자동 배포합니다.

### 최초 1회 GitHub 설정

1. GitHub 저장소에서 `Settings` → `Pages`로 이동합니다.
2. `Build and deployment`의 `Source`를 `GitHub Actions`로 선택합니다.
3. `Settings` → `Secrets and variables` → `Actions` → `Variables`에 필요한 값을 등록합니다.
   - `VITE_API_BASE_URL`: 배포 환경에서 사용할 API 서버 주소
   - `VITE_BASE_PATH`: 기본값은 `/<REPO_NAME>/`이며, 커스텀 도메인을 쓰면 `/`로 설정

### 자동 배포 흐름

- `main` 브랜치에 push하면 `npm ci` → `npm run lint` → `npm run build` 후 GitHub Pages로 배포됩니다.
- `main` 대상 Pull Request에서는 배포 없이 lint/build 검증만 실행됩니다.
- 수동 배포가 필요하면 GitHub `Actions` 탭에서 `Deploy Frontend to GitHub Pages` 워크플로우를 `Run workflow`로 실행합니다.

### 로컬 사전 검증

```bash
npm ci
npm run lint
npm run build
```
