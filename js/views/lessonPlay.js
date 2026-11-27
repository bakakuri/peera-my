import { state } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, highlight, speak, toast } from "../util.js";
import { canListen, listen, score, stopListening } from "../speech.js";

const micIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>`;

let P = null;
const STEP_NAMES = ["სიტყვები", "დიალოგი", "ვარჯიში", "შედეგი"];

const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

// ვარჯიში გაკვეთილის სიტყვებიდან და დიალოგიდან გროვდება
function buildQuiz(l) {
  const own = l.words.map((w) => w.ka);
  const extra = state.wordsOf(l.lang).map((w) => w.semantics?.primaryTranslation).filter(Boolean);
  const qs = [];
  shuffle(l.words)
    .slice(0, 5)
    .forEach((w) => {
      const wrong = shuffle([...new Set([...own, ...extra])].filter((k) => k !== w.ka)).slice(0, 3);
      qs.push({ type: "tr", word: w, answer: w.ka, options: shuffle([w.ka, ...wrong]) });
    });
  const hl = l.lines.filter((x) => x.highlight);
  shuffle(hl)
    .slice(0, 3)
    .forEach((ln) => {
      const i = ln.text.toLowerCase().indexOf(ln.highlight.toLowerCase());
      const answer = ln.text.slice(i, i + ln.highlight.length);
      const wrong = shuffle(
        [...new Set(hl.map((x) => x.highlight))].filter((h) => h.toLowerCase() !== answer.toLowerCase())
      ).slice(0, 3);
      if (wrong.length < 2) return;
      qs.push({ type: "blank", line: ln, text: ln.text.slice(0, i) + "_____" + ln.text.slice(i + answer.length), answer, options: shuffle([answer, ...wrong]) });
    });
  return shuffle(qs);
}

const stepsBar = () =>
  `<div class="lp-steps">${STEP_NAMES.map((n, i) => `<span class="${i < P.step ? "done" : i === P.step ? "now" : ""}"><i></i><em>${n}</em></span>`).join("")}</div>`;

function wordsStep(l) {
  const mic = canListen();
  return `
  <h2 class="lp-title rise">ახალი სიტყვები</h2>
  <p class="lp-sub rise">შეეხე სიტყვას და მოუსმინე${canListen() ? ", მერე 🎤-ით გაიმეორე" : ""}</p>
  <div class="lwords">${l.words
    .map(
      (w, i) => `
    <div class="lw rise" style="animation-delay:${0.08 * i}s">
      <span class="lw-t" data-say="${i}"><b>${esc(w.text)}</b><small>${esc(w.ph || "")}</small></span>
      <span class="lw-k" data-say="${i}">${esc(w.ka)}</span>
      <button class="lw-s" data-say="${i}" aria-label="მოსმენა">${icon.speaker}</button>
      ${mic ? `<button class="lw-m" data-mic="w${i}" aria-label="წარმოთქმა">${micIcon}</button>` : ""}
      <p class="mres" id="mres-w${i}" role="status"></p>
    </div>`
    )
    .join("")}</div>
  <button class="cta cta-primary lp-next" data-next>დიალოგზე გადასვლა ${icon.arrow}</button>`;
}

function dialogueStep(l) {
  const eq = Array.from({ length: 16 }, (_, i) => `<i style="height:${[12, 22, 28, 16, 26, 12, 24, 18, 28, 14, 22, 10, 20, 26, 14, 22][i]}px;animation-delay:${(i * 0.09).toFixed(2)}s"></i>`).join("");
  const lines = l.lines
    .map(
      (ln, i) => `
    <div class="bubble-row ${i % 2 ? "me" : "them"} rise" style="animation-delay:${0.1 + i * 0.1}s" data-line="${i}">
      ${i % 2 ? "" : `<span class="avatar mint">${esc(ln.who)}</span>`}
      <div class="bubble">
        <p>${highlight(ln.text, ln.highlight)}</p>
        ${ln.ph ? `<small class="ph">${esc(ln.ph)}</small>` : ""}
        <small>${esc(ln.ka)}</small>
        ${canListen() ? `<button class="bubble-mic" data-mic="l${i}" aria-label="წარმოთქმა">${micIcon}</button><p class="mres" id="mres-l${i}" role="status"></p>` : ""}
      </div>
      ${i % 2 ? `<span class="avatar coral">${esc(ln.who)}</span>` : ""}
    </div>`
    )
    .join("");
  return `
  <h2 class="lp-title rise">დიალოგი</h2>
  <section class="card player rise" style="margin:0 0 12px">
    <button class="play" data-act="play" aria-label="დაკვრა">${icon.play}</button>
    <div class="eq" aria-hidden="true">${eq}</div>
    <span class="pill soft" id="play-state">მოუსმინე</span>
  </section>
  <div class="chat" style="padding:0">${lines}</div>
  <button class="cta cta-primary lp-next" data-next style="margin-top:18px">მინი-ვარჯიში ${icon.arrow}</button>`;
}

function quizStep() {
  const q = P.quiz[P.q];
  if (!q) return "";
  const head =
    q.type === "tr"
      ? `<p class="qtype">რას ნიშნავს?</p><h3 class="qprompt">${esc(q.word.text)}</h3><p class="qph">${esc(q.word.ph || "")}</p>`
      : `<p class="qtype">შეავსე გამოტოვებული სიტყვა</p><h3 class="qprompt sm">${esc(q.text)}</h3><p class="qph">${esc(q.line.ka)}</p>`;
  return `
  <div class="qhead"><span>${P.q + 1} / ${P.quiz.length}</span><div class="bar"><i style="width:${(P.q / P.quiz.length) * 100}%"></i></div></div>
  <section class="qcard rise">${head}${q.type === "tr" ? `<button class="qspeak" data-qsay aria-label="მოსმენა">${icon.speaker}</button>` : ""}</section>
  <div class="qopts">${q.options.map((o, i) => `<button class="qopt rise" style="animation-delay:${0.06 * i}s" data-opt="${i}">${esc(o)}</button>`).join("")}</div>
  <p class="qfeed" id="qfeed" role="status"></p>
  <button class="cta cta-primary lp-next" data-next disabled>${P.q + 1 === P.quiz.length ? "შედეგი" : "შემდეგი"} ${icon.arrow}</button>`;
}

function resultStep(l) {
  const total = P.quiz.length || 1;
  const ratio = P.correct / total;
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
  const list = state.lessonsFor();
  const idx = list.findIndex((x) => x.id === l.id);
  const next = list[idx + 1];
  const star = (on, i) => `<svg class="rstar${on ? " on" : ""}" style="animation-delay:${0.3 + i * 0.25}s" width="56" height="56" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9z" stroke-linejoin="round"/></svg>`;
  return `
  <div class="result">
    <div class="confetti" id="confetti" aria-hidden="true"></div>
    <img class="rgirl" src="assets/girl-cheer.webp" alt="" width="150" height="205">
    <h2 class="lp-title rise">${stars === 3 ? "შესანიშნავია!" : stars === 2 ? "კარგია!" : "დასრულდა!"}</h2>
    <div class="rstars">${[0, 1, 2].map((i) => star(i < stars, i)).join("")}</div>
    <div class="rscore rise" style="animation-delay:.5s"><b>${P.correct} / ${total}</b><span>სწორი პასუხი</span></div>
    <div class="rxp rise" style="animation-delay:.7s">+<b id="rxp">${P.xp}</b> XP</div>
    <p class="rgoal" id="rgoal" hidden>🎯 დღევანდელი მიზანი შესრულდა!</p>
    ${next ? `<a class="cta cta-primary" href="#/lesson/${esc(next.id)}">შემდეგი გაკვეთილი ${icon.arrow}</a>` : ""}
    <a class="cta rback" href="#/lesson">გაკვეთილების გზა</a>
  </div>`;
}

function burst(root) {
  const box = root.querySelector("#confetti");
  if (!box) return;
  const colors = ["#FFC83D", "#FF7A59", "#3EDBB0", "#4F6BFF", "#fff"];
  box.innerHTML = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const r = 90 + Math.random() * 120;
    return `<i class="dot" style="background:${colors[i % 5]};--dx:${Math.round(Math.cos(a) * r)}px;--dy:${Math.round(Math.sin(a) * r)}px;animation-delay:${(Math.random() * 0.2).toFixed(2)}s"></i>`;
  }).join("");
}

export default {
  render(id) {
    const l = state.lessons.find((x) => x.id === id);
    if (!l) {
      return `${header()}<div class="finish rise"><h2>გაკვეთილი ვერ მოიძებნა</h2><a class="cta" href="#/lesson">გაკვეთილების გზა</a></div>`;
    }
    P = { lesson: l, step: 0, q: 0, correct: 0, quiz: buildQuiz(l), picked: false, xp: 0, saved: false };
    return `${header()}<div class="lp"><div class="lp-top"><a class="lp-x" href="#/lesson" aria-label="გასვლა"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></a><div id="lp-steps"></div></div><div id="lp-body" class="lp-body"></div></div>`;
  },

  mount(root, id) {
    if (!P || P.lesson.id !== id) return null;
    const l = P.lesson;
    let playing = false;
    let timer = null;

    const stopAudio = () => {
      playing = false;
      clearTimeout(timer);
      try { window.speechSynthesis?.cancel(); } catch {}
      root.querySelector(".player")?.classList.remove("playing");
      root.querySelectorAll(".bubble-row.speaking").forEach((e) => e.classList.remove("speaking"));
      const st = root.querySelector("#play-state");
      if (st) st.textContent = "მოუსმინე";
    };

    function paint() {
      stopAudio();
      root.querySelector("#lp-steps").innerHTML = stepsBar();
      const body = root.querySelector("#lp-body");
      body.innerHTML = [wordsStep, dialogueStep, quizStep, resultStep][P.step](l);
      window.scrollTo(0, 0);
      if (P.step === 2 && P.quiz[P.q]?.type === "tr") speak(P.quiz[P.q].word.text, l.ttsLang, 0.9);
      if (P.step === 3) finish();
    }

    async function finish() {
      if (!P.saved) {
        P.saved = true;
        P.xp = await state.finishLesson(l, P.correct, P.quiz.length || 1);
        const el = root.querySelector("#rxp");
        if (el) el.textContent = P.xp;
        if (state.consumeGoalHit()) root.querySelector("#rgoal")?.removeAttribute("hidden");
      }
      burst(root);
    }

    function playFrom(i) {
      if (!playing || i >= l.lines.length) return stopAudio();
      const rows = [...root.querySelectorAll("[data-line]")];
      rows.forEach((el, k) => el.classList.toggle("speaking", k === i));
      if (!speak(l.lines[i].text, l.ttsLang, 0.9)) {
        toast("ბრაუზერი ხმის გამოცემას ვერ ახერხებს");
        return stopAudio();
      }
      const u = window.speechSynthesis;
      const check = () => {
        if (!playing) return;
        if (u.speaking || u.pending) timer = setTimeout(check, 200);
        else timer = setTimeout(() => playFrom(i + 1), 350);
      };
      timer = setTimeout(check, 300);
    }

    const onClick = (e) => {
      const t = e.target.closest("[data-mic],[data-say],[data-act],[data-line],[data-next],[data-opt],[data-qsay]");
      if (!t) return;
      if (t.dataset.mic !== undefined) {
        const key = t.dataset.mic;
        const target = key[0] === "w" ? l.words[Number(key.slice(1))].text : l.lines[Number(key.slice(1))].text;
        const out = root.querySelector("#mres-" + key);
        stopAudio();
        if (t.classList.contains("rec")) { stopListening(); return; }
        root.querySelectorAll("[data-mic].rec").forEach((b) => b.classList.remove("rec"));
        t.classList.add("rec");
        out.className = "mres";
        out.textContent = "მოგისმენ…";
        listen(l.ttsLang)
          .then((heards) => {
            const r = score(target, heards);
            out.className = "mres " + (r.pct >= 80 ? "ok" : r.pct >= 50 ? "mid" : "bad");
            out.textContent = `${r.pct >= 80 ? "შესანიშნავი" : r.pct >= 50 ? "თითქმის" : "კიდევ სცადე"} · ${r.pct}% · გავიგე: „${r.heard}“`;
          })
          .catch((err) => {
            out.className = "mres bad";
            out.textContent = err.message === "not-allowed" ? "მიკროფონზე წვდომა ჩართე" : "ვერ გავიგე, სცადე ისევ";
          })
          .finally(() => t.classList.remove("rec"));
        return;
      }
      if (t.dataset.say !== undefined) speak(l.words[Number(t.dataset.say)].text, l.ttsLang, 0.85);
      else if (t.dataset.act === "play") {
        if (playing) return stopAudio();
        playing = true;
        root.querySelector(".player").classList.add("playing");
        root.querySelector("#play-state").textContent = "ვუსმენთ…";
        playFrom(0);
      } else if (t.dataset.line !== undefined) {
        stopAudio();
        speak(l.lines[Number(t.dataset.line)].text, l.ttsLang, 0.9);
      } else if (t.dataset.qsay !== undefined) speak(P.quiz[P.q].word.text, l.ttsLang, 0.85);
      else if (t.dataset.opt !== undefined) {
        if (P.picked) return;
        P.picked = true;
        const q = P.quiz[P.q];
        const pick = q.options[Number(t.dataset.opt)];
        const ok = pick === q.answer;
        if (ok) P.correct += 1;
        root.querySelectorAll(".qopt").forEach((b) => {
          b.disabled = true;
          const o = q.options[Number(b.dataset.opt)];
          if (o === q.answer) b.classList.add("right");
          else if (b === t) b.classList.add("wrong");
        });
        const feed = root.querySelector("#qfeed");
        feed.className = "qfeed " + (ok ? "ok" : "bad");
        feed.textContent = ok ? "სწორია! +5 XP" : `სწორი პასუხი: ${q.answer}`;
        root.querySelector("[data-next]").disabled = false;
      } else if (t.dataset.next !== undefined) {
        if (P.step === 2) {
          P.picked = false;
          if (P.q + 1 < P.quiz.length) {
            P.q += 1;
            return paint();
          }
        }
        P.step += 1;
        if (P.step === 2 && !P.quiz.length) P.step = 3;
        paint();
      }
    };
    root.addEventListener("click", onClick);
    paint();
    return () => {
      stopAudio();
      stopListening();
      root.removeEventListener("click", onClick);
    };
  },
};
