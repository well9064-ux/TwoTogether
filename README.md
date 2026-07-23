# TwoTogether — Heart Round

6명이 게임을 통해 첫인상, 취향, 가치관과 팀워크를 알아가는 소셜 데이팅
게임 프로토타입입니다.

현재 구현된 범위:

- 3:3 샘플 참가자 프로필
- 참가자별 첫인상 선택
- 상호 선택 매칭 판정
- 결과 공개와 재시작
- PC 및 모바일 반응형 화면

## 개발 환경

- Node.js `22.13.0` 이상
- npm
- Git

## 처음 내려받기

```bash
git clone https://github.com/well9064-ux/TwoTogether.git
cd TwoTogether
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 개발 및 검증

```bash
npm run dev
npm run build
npm test
```

- `npm run dev`: 로컬 개발 서버 실행
- `npm run build`: 배포 가능한 빌드 생성
- `npm test`: 빌드 후 핵심 화면 서버 렌더링 검사

## 커밋과 푸시

```bash
git checkout main
git pull --rebase origin main
git add .
git commit -m "feat: 변경 내용 요약"
git push origin main
```

기능 단위로 브랜치를 사용할 때는 다음 흐름을 권장합니다.

```bash
git checkout -b codex/feature-name
git add .
git commit -m "feat: 변경 내용 요약"
git push -u origin codex/feature-name
```

## 배포

이 저장소는 `.openai/hosting.json`에 Heart Round의 Sites 프로젝트가 연결되어
있습니다. Codex에서 프로젝트를 연 뒤 빌드가 성공한 상태에서 배포를 요청하면
현재 커밋을 기준으로 새 버전을 저장하고 비공개 배포합니다.

배포 전 확인:

```bash
git status
npm test
```

실제 참가자 데이터, 사진, 연락처와 비밀키는 저장소에 커밋하지 않습니다.
환경 변수 파일(`.env*`)은 Git에서 제외되어 있습니다.
