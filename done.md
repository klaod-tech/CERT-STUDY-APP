# 완료된 작업 (done)

> 기준 문서: [자격증_학습앱_개발계획.md](./자격증_학습앱_개발계획.md)

## 1단계 — 기본 골격 + 인증 (로그인 화면 없는 방식으로 변경)
- `index.html`: 3단 레이아웃(사이드바/기능패널/메인보드)
- `js/supabase.js`: Supabase 클라이언트 초기화 (실제 프로젝트 URL/anon key 반영 완료)
- `js/auth.js`: `ensureSession()` — 저장된 세션이 있으면 재사용, 없으면 **익명 로그인(anonymous sign-in)** 자동 실행. 로그인 화면 없이 앱 진입 시 자동으로 처리됨.
  - **주의**: 익명 로그인은 브라우저(로컬 저장소) 단위로 계정이 생성되므로 **이 PC 하나에서만** 데이터가 유지됨. 다른 기기/브라우저에서 열면 새 빈 계정으로 시작함 (사용자 확인 후 "이 PC만 사용"으로 결정됨).
- `js/store.js`: categories/notes/concepts/quizzes CRUD 전부 구현 (2~6단계에서 쓸 것까지 미리 작성돼 있었음)

## 2단계 — 사이드바
- `js/sidebar.js`: 카테고리 목록 렌더링, 하단 `+`로 자격증 추가, 선택 강조
- 상단 ☰ 클릭 시 사이드바+패널 접기/펼치기 (`app-layout.collapsed`, CSS 트랜지션)

## 3단계 — 기능 패널
- `js/panel.js`: 필기/문제풀이/핵심개념 탭 3개, "n번 진행" 카운트, 제목 리스트

## 4단계 — 필기 에디터
- `js/note.js`: title + textarea, `input` + debounce(500ms) 자동저장

## 5단계 — 핵심개념 에디터
- `js/concept.js`: `단어:뜻` 행 입력, `+ 행 추가`, 행 삭제, 자동저장 (items jsonb)

## 6단계 — 문제풀이
- `js/parser.js`: 기출 붙여넣기 파서 (전략 A)
  - `a)b)c)d)`, `①②③④`, `1)2)3)4` 마커 혼용 지원, 여러 줄 문제/보기 이어쓰기 지원
  - 파싱 실패 항목은 원문 + 실패 사유와 함께 별도 반환 (수동 수정 유도)
- `js/quiz.js`:
  - 우측 상단 `[단어 문제 | 기출 문제]` 토글
  - 단어 문제: 핵심개념 데이터 재활용 → 4지선다 자동 생성 (오답은 같은 카테고리 다른 용어 뜻에서 무작위 추출)
  - 기출 문제: 붙여넣기 → 파싱 미리보기(정답 표시 + 실패 항목 하이라이트) → 저장
  - 풀이 모드: 문제 표시 → 선택 → 채점, 오답노트(`wrong_questions`) 자동 갱신, "틀린 문제만 풀기", 회차별 기록(`attempts`) + 정답률 통계 테이블

## 그 밖에 이번 세션에서 발견/수정한 문제
- **`js/app.js`가 아예 없었음** — `index.html`이 참조만 하고 있어서 이전 단계 작업물이 화면에 전혀 연결되지 않는 상태였음. 새로 작성해서 사이드바→패널→보드 라우팅, 우측 하단 `+` 버튼(탭별 새 항목 생성)까지 전부 배선함. Supabase 연결 실패 시(0단계 미완료 상태) 화면에 에러 메시지를 보여주도록 처리.
- **`panel.js` 버그**: 카테고리를 선택해도 리스트 클릭 핸들러가 연결되지 않던 문제(`onItemSelect`가 `setCategory` 쪽에 전달 안 됨) 수정.
- **`note.js` XSS 여지**: 제목/본문을 이스케이프 없이 `innerHTML`에 삽입하던 부분 → `js/utils.js`의 `escapeHtml`로 수정. `concept.js`/`quiz.js`도 처음부터 이스케이프 적용해서 작성.
- **로그인 UI 제거**: 사용자가 혼자 이 PC에서만 쓸 것이라고 확인 → 로그인/회원가입/로그아웃 화면과 버튼을 전부 제거하고, 앱 시작 시 자동으로 익명 로그인되도록 단순화 (`auth-screen` 관련 HTML/CSS 삭제, `auth.js`를 `ensureSession()` 하나로 축소).

## 스타일 다듬기
- 전체 배경 흰색 → 연한 파란색(`#eaf2fb`)
- 기능 패널 너비 220px → 260px
- 필기/핵심개념/문제풀이 제목 입력란: 높이 확대, `border-radius` 적용, 본문과 너비 통일
- 폰트를 Pretendard(웹폰트 CDN)로 변경 (클로드 브랜드 폰트는 라이선스 문제로 사용 불가 — 협의 후 대체)

## 0단계 완료 + 배포
- Supabase 프로젝트 생성, 테이블/RLS, Anonymous Sign-Ins 활성화, URL/anon key 반영까지 전부 완료
- git 저장소 초기화 + 초기 커밋, GitHub(`klaod-tech/CERT-STUDY-APP`, Public) push, GitHub Pages 배포 완료
  - 배포 첫 시도 "Deployment failed"/큐 멈춤 발생 → Settings → Actions → Workflow permissions를 "Read and write permissions"로 변경 후 재배포하여 해결
- 배포 주소: `https://klaod-tech.github.io/CERT-STUDY-APP/`
- **실사용 확인**: 배포된 사이트에서 카테고리 추가, 필기 작성/자동저장까지 실제로 동작 확인됨

## 검증
- 전체 JS 파일 `node --check` 구문 검사 통과.
- `parser.js`는 실제 샘플 텍스트(정상 2문제 + 보기 부족 오류 1건)로 단위 테스트 후 통과 확인.
- GitHub Pages 배포본에서 실제 브라우저로 E2E 동작 확인(필기 기준). 핵심개념/문제풀이는 아직 실사용 미확인.
- 2026-07-06: 배포 주소 응답 재확인(200 OK, 최신 커밋 반영됨).
- 2026-07-06: 커밋 `0d104c0` 배포에서 "Deployment failed" 재발. Actions API로 확인 시 build 단계는 성공, deploy 단계만 실패.
  - Workflow permissions는 이미 "Read and write permissions"로 정상 설정되어 있어 권한 문제는 아닌 것으로 확인됨.
  - 어젯밤 `9c2cbf8` 커밋의 배포 작업이 9시간 이상 "queued" 상태로 멈춰 있는 것을 발견(그 사이 다른 배포는 성공/실패가 섞여 발생) — 간헐적 실패 패턴이라 원인 특정에는 Actions 탭의 실제 에러 로그 확인이 필요. 미해결.
