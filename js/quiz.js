import { getConcepts, saveQuiz } from "./store.js";
import { parseExamText } from "./parser.js";
import { escapeHtml, shuffle } from "./utils.js";

// ---------- 생성 화면 (단어 문제 | 기출 문제 토글) ----------
export function renderQuizCreator(container, categoryId, onSaved) {
  let mode = "word";

  container.innerHTML = `
    <div class="quiz-toggle">
      <button type="button" class="toggle-btn active" data-mode="word">단어 문제</button>
      <button type="button" class="toggle-btn" data-mode="exam">기출 문제</button>
    </div>
    <input type="text" id="quiz-title" class="editor-title" placeholder="제목" />
    <div id="quiz-creator-body"></div>
  `;

  container.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mode = btn.dataset.mode;
      renderBody();
    });
  });

  renderBody();

  function renderBody() {
    const body = document.getElementById("quiz-creator-body");
    if (mode === "word") {
      body.innerHTML = `<button type="button" id="gen-word-quiz-btn">핵심개념으로 문제 생성</button>`;
      document.getElementById("gen-word-quiz-btn").addEventListener("click", async () => {
        const concepts = await getConcepts(categoryId);
        const pool = concepts.flatMap((c) => c.items || []).filter((i) => i.term && i.meaning);
        if (pool.length < 4) {
          alert("핵심개념에 단어:뜻이 4개 이상 있어야 문제를 생성할 수 있습니다.");
          return;
        }
        const questions = pool.map((item) => {
          const wrongPool = shuffle(pool.filter((p) => p !== item)).slice(0, 3);
          const options = shuffle([item.meaning, ...wrongPool.map((w) => w.meaning)]);
          return {
            id: crypto.randomUUID(),
            question: item.term,
            options,
            answer: options.indexOf(item.meaning),
          };
        });
        const title = document.getElementById("quiz-title").value || "단어 문제";
        const saved = await saveQuiz({
          title,
          category_id: categoryId,
          source: "word",
          questions,
          attempts: [],
          wrong_questions: [],
        });
        onSaved && onSaved(saved);
      });
    } else {
      body.innerHTML = `
        <textarea id="exam-paste" placeholder="기출 문제 붙여넣기 (문제/보기4개/정답 형식)" style="width:100%; height:200px;"></textarea>
        <button type="button" id="parse-exam-btn">파싱</button>
        <div id="exam-preview"></div>
      `;
      document.getElementById("parse-exam-btn").addEventListener("click", () => {
        const text = document.getElementById("exam-paste").value;
        const { questions, errors } = parseExamText(text);
        renderPreview(questions, errors);
      });
    }
  }

  function renderPreview(questions, errors) {
    const preview = document.getElementById("exam-preview");
    let html = `<p>${questions.length}개 파싱 성공, ${errors.length}개 실패</p>`;

    questions.forEach((q, i) => {
      html += `<div class="preview-item"><strong>${i + 1}. ${escapeHtml(q.question)}</strong><ul>`;
      q.options.forEach((opt, oi) => {
        html += `<li${oi === q.answer ? ' class="correct"' : ""}>${escapeHtml(opt)}</li>`;
      });
      html += `</ul></div>`;
    });

    errors.forEach((e) => {
      html += `<div class="preview-item error"><strong>파싱 실패</strong><pre>${escapeHtml(e.raw.join("\n"))}</pre><p>${escapeHtml(e.reasons.join(", "))}</p></div>`;
    });

    if (questions.length > 0) {
      html += `<button type="button" id="save-exam-quiz-btn">저장 (${questions.length}문제)</button>`;
    }
    preview.innerHTML = html;

    const saveBtn = document.getElementById("save-exam-quiz-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const title = document.getElementById("quiz-title").value || "기출 문제";
        const saved = await saveQuiz({
          title,
          category_id: categoryId,
          source: "exam",
          questions,
          attempts: [],
          wrong_questions: [],
        });
        onSaved && onSaved(saved);
      });
    }
  }
}

// ---------- 조회/통계 화면 ----------
export function renderQuizViewer(container, quiz, onUpdated) {
  const wrongCount = quiz.wrong_questions?.length || 0;
  container.innerHTML = `
    <h2>${escapeHtml(quiz.title || "")}</h2>
    <p>${quiz.questions.length}문제 · ${quiz.attempts?.length || 0}회 풀이</p>
    <div id="quiz-stats"></div>
    <button type="button" id="solve-all-btn">전체 풀기</button>
    <button type="button" id="solve-wrong-btn" ${wrongCount ? "" : "disabled"}>틀린 문제만 풀기 (${wrongCount})</button>
  `;

  renderStats();

  document.getElementById("solve-all-btn").addEventListener("click", () => {
    startSolve(container, quiz, quiz.questions, onUpdated);
  });
  document.getElementById("solve-wrong-btn").addEventListener("click", () => {
    const wrongIds = new Set(quiz.wrong_questions || []);
    const wrongQs = quiz.questions.filter((q) => wrongIds.has(q.id));
    startSolve(container, quiz, wrongQs, onUpdated);
  });

  function renderStats() {
    const stats = document.getElementById("quiz-stats");
    if (!quiz.attempts?.length) {
      stats.innerHTML = "<p>아직 풀이 기록이 없습니다.</p>";
      return;
    }
    stats.innerHTML = `
      <table class="stats-table">
        <thead><tr><th>회차</th><th>날짜</th><th>점수</th><th>정답률</th></tr></thead>
        <tbody>
          ${quiz.attempts
            .map(
              (a) => `<tr><td>${a.round}</td><td>${new Date(a.date).toLocaleDateString()}</td><td>${a.correct}/${a.total}</td><td>${Math.round((a.correct / a.total) * 100)}%</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }
}

// ---------- 풀이 모드 ----------
function startSolve(container, quiz, questions, onUpdated) {
  if (!questions.length) {
    alert("풀 문제가 없습니다.");
    return;
  }

  let idx = 0;
  const results = [];

  renderQuestion();

  function renderQuestion() {
    const q = questions[idx];
    container.innerHTML = `
      <p>${idx + 1} / ${questions.length}</p>
      <div class="quiz-question">${escapeHtml(q.question)}</div>
      <ul class="quiz-options">
        ${q.options.map((opt, i) => `<li><label><input type="radio" name="opt" value="${i}" /> ${escapeHtml(opt)}</label></li>`).join("")}
      </ul>
      <button type="button" id="submit-answer-btn">${idx === questions.length - 1 ? "제출 및 채점" : "다음"}</button>
    `;
    document.getElementById("submit-answer-btn").addEventListener("click", () => {
      const checked = container.querySelector('input[name="opt"]:checked');
      const selected = checked ? +checked.value : -1;
      results.push({ questionId: q.id, correct: selected === q.answer });
      idx++;
      if (idx < questions.length) {
        renderQuestion();
      } else {
        finishSolve();
      }
    });
  }

  async function finishSolve() {
    const correctCount = results.filter((r) => r.correct).length;
    const total = results.length;

    const wrongSet = new Set(quiz.wrong_questions || []);
    results.forEach((r) => {
      if (r.correct) wrongSet.delete(r.questionId);
      else wrongSet.add(r.questionId);
    });

    const attempts = [...(quiz.attempts || [])];
    attempts.push({
      round: attempts.length + 1,
      date: new Date().toISOString(),
      score: correctCount,
      correct: correctCount,
      total,
    });

    const updated = await saveQuiz({
      id: quiz.id,
      category_id: quiz.category_id,
      title: quiz.title,
      source: quiz.source,
      questions: quiz.questions,
      attempts,
      wrong_questions: [...wrongSet],
    });

    container.innerHTML = `
      <h2>결과</h2>
      <p>${correctCount} / ${total} 정답 (${Math.round((correctCount / total) * 100)}%)</p>
      <button type="button" id="back-to-quiz-btn">돌아가기</button>
    `;
    document.getElementById("back-to-quiz-btn").addEventListener("click", () => {
      renderQuizViewer(container, updated, onUpdated);
    });

    onUpdated && onUpdated(updated);
  }
}
