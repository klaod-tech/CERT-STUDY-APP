// 기출 문제 붙여넣기 파서 (전략 A)
// 지원 형식:
//   1. 문제 본문
//   a) 보기1   (a-d, ①-④, 1-4, 마커 뒤 . 또는 ) 허용)
//   b) 보기2
//   c) 보기3
//   d) 보기4
//   정답: c   (정답/답, : 또는 공백, 마커 종류 무관)

const OPTION_MARKER_INDEX = {
  a: 0, A: 0, "①": 0, 1: 0,
  b: 1, B: 1, "②": 1, 2: 1,
  c: 2, C: 2, "③": 2, 3: 2,
  d: 3, D: 3, "④": 3, 4: 3,
};

const QUESTION_START_RE = /^\s*(\d+)\s*[.)]\s*(.+)$/;
const OPTION_RE = /^\s*([a-dA-D①②③④1-4])(?:[.)]|\s)\s*(.+)$/;
const ANSWER_RE = /^\s*(?:정답|답)\s*[:：]?\s*([a-dA-D①②③④1-4])/;

export function parseExamText(text) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions = [];
  const errors = [];
  let current = null;

  function flush() {
    if (!current) return;
    const reasons = [];
    if (!current.question) reasons.push("문제 본문 없음");
    if (current.options.length !== 4) reasons.push(`보기 ${current.options.length}개 (4개 필요)`);
    if (current.answer === undefined) reasons.push("정답 없음");

    if (reasons.length) {
      errors.push({ raw: current.raw, reasons });
    } else {
      questions.push({
        id: crypto.randomUUID(),
        question: current.question,
        options: current.options,
        answer: current.answer,
      });
    }
    current = null;
  }

  for (const line of lines) {
    if (!current) {
      const qMatch = line.match(QUESTION_START_RE);
      if (qMatch) {
        current = { question: qMatch[2], options: [], answer: undefined, raw: [line] };
      } else {
        errors.push({ raw: [line], reasons: ["문제 시작을 찾을 수 없음"] });
      }
      continue;
    }

    current.raw.push(line);

    const optMatch = line.match(OPTION_RE);
    const ansMatch = line.match(ANSWER_RE);
    const qMatch = line.match(QUESTION_START_RE);

    if (optMatch && current.options.length < 4) {
      current.options.push(optMatch[2]);
    } else if (ansMatch) {
      current.answer = OPTION_MARKER_INDEX[ansMatch[1]];
      flush();
    } else if (qMatch && current.options.length === 0) {
      // 아직 보기가 없으면 여러 줄짜리 문제 본문으로 취급
      current.question += " " + qMatch[0].trim();
    } else if (current.options.length > 0) {
      // 보기 이어쓰기 (여러 줄 보기)
      current.options[current.options.length - 1] += " " + line;
    } else {
      current.question += " " + line;
    }
  }

  // 마지막 블록이 정답 없이 끝난 경우
  flush();

  return { questions, errors };
}
