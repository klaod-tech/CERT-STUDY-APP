# 앞으로 할 작업 (will_done)

> 기준 문서: [자격증_학습앱_개발계획.md](./자격증_학습앱_개발계획.md)

## 0단계 — Supabase 준비 (완료)
- Supabase 프로젝트 생성, URL/anon key `js/supabase.js`에 반영 완료
- Anonymous Sign-Ins 활성화 완료
- SQL 테이블(`categories`/`notes`/`concepts`/`quizzes`) + RLS 정책 생성 완료
- 참고: 익명 로그인은 **브라우저 origin별로 별도 계정**이 생성됨. `localhost:8000`에서 테스트한 데이터와 `klaod-tech.github.io` 배포본의 데이터는 서로 다른 익명 계정에 저장되어 분리되어 있음(둘 다 Supabase에 존재, 유실 아님). 앞으로는 배포된 GitHub Pages 주소를 실제 사용처로 사용.

## 실제 동작 검증 (완료)
- GitHub Pages 배포본(`https://klaod-tech.github.io/CERT-STUDY-APP/`)에서 카테고리 추가, 필기 작성/자동저장, 목록 반영까지 실제 확인됨
- 남은 검증: 핵심개념 편집, 문제풀이(단어문제/기출문제 파싱·풀기·오답노트·회차기록) 실제 화면에서 확인

## 8단계 — 마무리 & 배포 (완료)
- git 저장소 초기화 + 초기 커밋 완료
- `.gitignore` 작성 완료 (`.env` 등 제외)
- GitHub 저장소 생성(`klaod-tech/CERT-STUDY-APP`, Public) → push 완료
- GitHub Pages 활성화 완료 — 최초 배포 시 "Deployment failed" 및 Queued 멈춤 발생 → Settings → Actions → Workflow permissions를 "Read and write permissions"로 변경 후 재배포하여 해결
- 남은 것: `README.md` 작성 (선택, 급하지 않음 — 본인만 쓰는 용도라 우선순위 낮음)

## 7단계 — (선택) PDF 일괄 변환 도구
- `tools/pdf-to-json.js` (전략 B): PDF 기출을 로컬에서 일괄 텍스트 추출 → 형식 정규화 → JSON → Supabase 업로드
- 현재 `tools/` 폴더 비어 있음. 필요해질 때(PDF 기출 다량 확보 시) 작업.

## 기타 다듬을 만한 부분 (선택, 급하지 않음)
- 카테고리 이름 수정/삭제 (개발계획 4-1의 "선택" 항목, 현재 추가만 가능)
- 문제풀이 통계에 회차별 정답률 추이 그래프(현재는 표 형태만)

## 역할 분담 (개발계획 8번 항목, 계획대로 유지)
- **문제 차출(데이터 준비)**: Claude에서 진행 — 기출 텍스트를 `parser.js`가 인식하는 형식으로 정리해서 전달
- **웹 구현**: VSCode에서 진행 — 0단계부터 순서대로
- 형식 합의: `parser.js`가 인식하는 형식 = `문제문 / a)b)c)d) 4개 보기 / 정답: x` (마커 종류는 유연하게 허용됨, 자세한 사양은 `js/parser.js` 참고)
