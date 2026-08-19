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
