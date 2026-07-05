# 앞으로 할 작업 (will_done)

> 기준 문서: [자격증_학습앱_개발계획.md](./자격증_학습앱_개발계획.md)

## 0단계 — Supabase 준비 (미착수, 최우선 블로커)
- supabase.com 프로젝트 생성 (무료 티어)
- SQL 에디터에서 `categories` / `notes` / `concepts` / `quizzes` 4개 테이블 + RLS 정책 생성
- Auth → **Anonymous Sign-Ins 활성화** (Authentication → Settings에서 토글) — 로그인 화면 없이 `js/auth.js`의 `ensureSession()`이 자동으로 익명 로그인 처리함
- 프로젝트 URL + anon key 확보 → `js/supabase.js`의 `YOUR_SUPABASE_URL` / `YOUR_SUPABASE_ANON_KEY` 교체
- **이게 끝나야 앱 진입부터 실제 데이터 CRUD까지 전부 테스트 가능** (지금은 코드만 완성된 상태)
- 참고: 익명 로그인은 브라우저별로 별도 계정이 생성되므로 **이 PC 하나에서만** 데이터가 유지됨(사용자 확인 완료, 의도된 동작).

## 실제 동작 검증 (0단계 이후)
- 앱 진입 시 익명 로그인 자동 처리 확인
- 카테고리 추가 → 필기/핵심개념/문제풀이 각각 생성·자동저장·목록 반영
- 문제풀이: 단어문제 자동생성, 기출문제 붙여넣기 파싱 → 저장 → 풀기 → 오답노트 → 회차기록 정상 동작 확인
- 사이드바 접기/펼치기 UI 확인

## 7단계 — (선택) PDF 일괄 변환 도구
- `tools/pdf-to-json.js` (전략 B): PDF 기출을 로컬에서 일괄 텍스트 추출 → 형식 정규화 → JSON → Supabase 업로드
- 현재 `tools/` 폴더 비어 있음. 필요해질 때(PDF 기출 다량 확보 시) 작업.

## 8단계 — 마무리 & 배포 (미착수)
- git 저장소 초기화 (`git init`) — 아직 저장소 아님
- `.gitignore` 작성 (데이터 파일 없음 — Supabase에만 존재 — 이지만 OS/에디터 파일 등 기본 제외 필요)
- `README.md` 작성 (Supabase 설정 방법 안내, 본인 키 사용 안내)
- GitHub 저장소 생성 → push → Settings → Pages 활성화
- 로컬 확인용 실행 방법 안내 (`Live Server` 또는 `python -m http.server`)
- ⚠️ `anon key`는 RLS로 보호되어 공개돼도 안전하지만, **`service_role key`는 절대 커밋 금지** — README에도 명시할 것

## 기타 다듬을 만한 부분 (선택, 급하지 않음)
- 카테고리 이름 수정/삭제 (개발계획 4-1의 "선택" 항목, 현재 추가만 가능)
- 문제풀이 통계에 회차별 정답률 추이 그래프(현재는 표 형태만)

## 역할 분담 (개발계획 8번 항목, 계획대로 유지)
- **문제 차출(데이터 준비)**: Claude에서 진행 — 기출 텍스트를 `parser.js`가 인식하는 형식으로 정리해서 전달
- **웹 구현**: VSCode에서 진행 — 0단계부터 순서대로
- 형식 합의: `parser.js`가 인식하는 형식 = `문제문 / a)b)c)d) 4개 보기 / 정답: x` (마커 종류는 유연하게 허용됨, 자세한 사양은 `js/parser.js` 참고)
