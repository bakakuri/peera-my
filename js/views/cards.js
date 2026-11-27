import { state } from "../state.js";
import { labels } from "../srs.js";
import { header, icon } from "../ui.js";
import { vm } from "../word.js";
import { esc, speak, highlight, toast } from "../util.js";

let S = null;

function newSession() {
  const q = state.queue();
  S = { queue: q, total: q.length, done: 0, flipped: false, busy: false, xp: 0 };
}

const geFlag = `<svg viewBox="0 0 30 20" width="34" height="23" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><path d="M13 0h4v20h-4zM0 8h30v4H0z" fill="#E8112D"/><g fill="#E8112D"><path d="M4 2h2v4H4zM2 3h6v2H2zM22 2h2v4h-2zM20 3h6v2h-6zM4 14h2v4H4zM2 15h6v2H2zM22 14h2v4h-2zM20 15h6v2h-6z"/></g></svg>`;
const tapIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B3FD8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5a2 2 0 0 1 4 0v6l3.2.8a2 2 0 0 1 1.5 2.1L17 19a2 2 0 0 1-2 1.8H11a2 2 0 0 1-1.6-.8L5.5 14.6a1.6 1.6 0 0 1 2.3-2.2L9 13.6"/></svg>`;

function exampleBlock(v, mode) {
  const ex = v.examples[0];
  if (!ex) return "";
  const phon = ex.phoneticKa ? `<small class="ph">${esc(ex.phoneticKa)}</small>` : "";
  const tr = ex.translation ? `<small class="tr">${esc(ex.translation)}</small>` : "";
  return `<div class="ex-box"><p>${highlight(ex.sentence || "", ex.highlight)}</p>${phon}${mode === "back" ? tr : ""}</div>`;
}

export function frontHtml(v) {
  const chips = v.ka
    .map(
      (k, i) =>
        `<div class="syl${i === v.stress ? " stress" : ""}"><b>${esc(k)}</b>${v.en[i] ? `<small>${esc(v.en[i])}</small>` : ""}</div>`
    )
    .join("");
  return `
  <div class="face front">
    <div class="sheen"></div>
    <button class="flip-hit" data-act="flip" aria-label="ბარათის გადაბრუნება"></button>
    <div class="front-in">
      <div class="front-top">
        <span class="lvl-pill"><b>${esc(v.cefr || "–")}</b>${esc(v.posEn || v.pos)}</span>
        <div class="speak-wrap">
          <i class="ring"></i><i class="ring r2"></i>
          <button class="speak" data-act="speak" aria-label="მოსმენა">${icon.speaker}</button>
        </div>
      </div>
      <div class="front-mid">
        <div class="term">${esc(v.term)}</div>
        <div class="ipa-row"><span class="ipa">${esc(v.ipa)}</span></div>
        <div class="sylbox">
          <div class="lbl">წაიკითხე ქართულად</div>
          <div class="syls">${chips}</div>
        </div>
        ${exampleBlock(v, "front")}
      </div>
      <div class="tap-hint">${tapIcon}<span>შეეხე ბარათს და გადაატრიალე</span></div>
    </div>
  </div>`;
}

export function backHtml(v) {
  const desc = v.defNative || v.defTarget;
  return `
  <div class="face back" data-act="flip">
    <div class="sheen"></div>
    <div class="back-in">
      <div class="back-head">
        <span class="flag-mini" aria-hidden="true">${geFlag}</span>
        <div class="back-term">${esc(v.term)}</div>
        <span class="pill dark">+${v.xp} XP</span>
      </div>
      <div class="primary">${esc(v.primary)}</div>
      <div class="chips">${v.alts.map((a) => `<span class="chip alt">${esc(a)}</span>`).join("")}</div>
      ${desc ? `<p class="desc">${esc(desc)}</p>` : ""}
      ${exampleBlock(v, "back")}
      ${v.grammar ? `<div class="gram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B87800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="#FFD24D"/></svg><p>${esc(v.grammar)}</p></div>` : ""}
      <div class="tap-hint">${tapIcon}<span>შეეხე და დაბრუნდი</span></div>
    </div>
  </div>`;
}

function stageHtml(w, enter = true) {
  const v = vm(w);
  return `<div class="cardwrap${enter ? " enter" : ""}"><div class="flipper${S.flipped ? " flipped" : ""}">${frontHtml(v)}${backHtml(v)}</div></div>`;
}

// ღილაკები = ლექსიკონის ჩანართები: ისევ→საზეპირო, რთული→სასწავლი, კარგი→გასამეორებელი, ადვილი→ნასწავლი
function srsHtml(w) {
  const l = labels(state.cards.get(w.id) || {});
  const v = vm(w);
  const pill = (grade, img, name, when) =>
    `<button class="srsp" data-grade="${grade}" aria-label="${name}"><img src="assets/tab-${img}.png" alt="" draggable="false"><b class="cnt">${when}</b></button>`;
  return `
  ${pill(0, "memorize", "საზეპირო", l.again)}
  ${pill(1, "study", "სასწავლი", l.hard)}
  ${pill(2, "review", "გასამეორებელი", l.good)}
  ${pill(3, "learned", "ნასწავლი", l.easy)}
  <span class="visually-hidden">+${v.xp} XP</span>`;
}

function finishHtml() {
  const s = state.stats;
  const next = state.wordsOf().length - state.learnedOf();
  return `
  <div class="hero hero-sm">
    ${header()}
    <div class="deco hd1"></div>
  </div>
  <div class="finish rise">
    <img src="assets/girl-cheer.png" alt="" width="190" height="260">
    <h2>${S && S.total ? "სესია დასრულდა!" : "დღეისთვის ბარათები არ არის"}</h2>
    <p>${S && S.total ? `გამეორდა ${S.total} სიტყვა${S.xp ? ` · +${S.xp} XP` : ""}` : "ყველა გამეორება შესრულებულია. დაბრუნდი მოგვიანებით."}</p>
    <div class="row gap10 center wrap">
      <span class="pill yellow">სერია ${s.streak} დღე</span>
      <span class="pill blue">${s.xp} XP</span>
      <span class="pill mint">დარჩა ${Math.max(0, next)} ახალი</span>
    </div>
    <a class="cta" href="#/progress">ჩემი პროგრესი ${icon.arrow}</a>
  </div>`;
}

function pageHtml() {
  if (!S.queue.length) return finishHtml();
  const w = S.queue[0];
  const pct = S.total ? Math.round((S.done / S.total) * 100) : 0;
  return `
  <div class="cards-top">${header()}
    <h1 class="cards-page-title">სიტყვების სწავლა</h1>
    <div class="cards-session-label">დღევანდელი გამეორება</div>
    <div class="progress-row">
      <div class="bar"><i id="cbar" style="width:${pct}%"></i></div>
      <span id="ccount">${S.done} / ${S.total}</span>
    </div>
  </div>
  <div class="stage" id="stage">${stageHtml(w)}</div>
  <div id="xp-layer" class="xp-layer" aria-hidden="true"></div>
  <div class="srs-row${S.flipped ? " ready" : ""}" id="srs">${srsHtml(w)}</div>`;
}

function popXp(root, xp) {
  const layer = root.querySelector("#xp-layer");
  if (!layer) return;
  const colors = ["#FFC83D", "#FF7A59", "#3EDBB0", "#FFFFFF", "#FF5A7A", "#4F6BFF", "#FFC83D", "#3EDBB0"];
  const dirs = [[-120, -110], [110, -120], [-150, 20], [150, 10], [-70, -170], [80, -180], [-110, 110], [120, 120]];
  layer.innerHTML =
    dirs.map((d, i) => `<i class="dot" style="--dx:${d[0]}px;--dy:${d[1]}px;background:${colors[i]};animation-delay:${i * 0.02}s"></i>`).join("") +
    `<div class="xp-pop">${icon.star}<span>+${xp} XP</span></div>`;
  setTimeout(() => (layer.innerHTML = ""), 1200);
}

export default {
  render() {
    newSession();
    return `<div class="cards-page l-${state.lang}">${pageHtml()}</div>`;
  },

  mount(root) {
    const page = () => root.querySelector(".cards-page");
    const cur = () => S.queue[0];

    async function answer(grade) {
      if (S.busy || !S.flipped || !cur()) return;
      S.busy = true;
      const w = cur();
      const wrap = root.querySelector(".cardwrap");
      wrap.classList.remove("enter");
      wrap.classList.add(grade === 0 ? "leave-left" : "leave-right");
      const xp = await state.review(w, grade);
      if (xp) {
        S.xp += xp;
        popXp(root, xp);
      }
      if (state.consumeGoalHit()) toast("🎯 დღევანდელი მიზანი შესრულდა!");
      setTimeout(() => {
        S.queue.shift();
        if (grade === 0) S.queue.push(w);
        else S.done += 1;
        S.flipped = false;
        S.busy = false;
        if (!S.queue.length) {
          page().innerHTML = finishHtml();
          return;
        }
        const bar = root.querySelector("#cbar");
        const count = root.querySelector("#ccount");
        if (bar) bar.style.width = Math.round((S.done / S.total) * 100) + "%";
        if (count) count.textContent = `${S.done} / ${S.total}`;
        root.querySelector("#stage").innerHTML = stageHtml(cur(), true);
        const srs = root.querySelector("#srs");
        srs.classList.remove("ready");
        srs.innerHTML = srsHtml(cur());
      }, 480);
    }

    const onClick = (e) => {
      if (!cur()) return;
      const t = e.target.closest("[data-act],[data-grade]");
      if (!t) return;
      if (t.dataset.act === "flip") {
        if (S.busy) return;
        S.flipped = !S.flipped;
        const wrap = root.querySelector(".cardwrap");
        wrap.classList.add("flipping");
        setTimeout(() => wrap.classList.remove("flipping"), 760);
        root.querySelector(".flipper").classList.toggle("flipped", S.flipped);
        root.querySelector("#srs").classList.toggle("ready", S.flipped);
      } else if (t.dataset.act === "speak") {
        e.stopPropagation();
        const v = vm(cur());
        speak(v.term, v.ttsLang, v.rate);
      } else if (t.dataset.grade !== undefined) {
        answer(Number(t.dataset.grade));
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  },
};
