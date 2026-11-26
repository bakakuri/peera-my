import { state } from "../state.js";
import { labels } from "../srs.js";
import { header, icon } from "../ui.js";
import { vm, TABS } from "../word.js";
import { esc, speak } from "../util.js";

let S = null;

function newSession() {
  const q = state.queue();
  S = { queue: q, total: q.length, done: 0, flipped: false, tab: "meaning", busy: false, xp: 0 };
}

const tabsHtml = (tab) =>
  TABS.map(
    (t) => `<button class="tabbtn${t.id === tab ? " on" : ""}" data-tab="${t.id}">${t.label}</button>`
  ).join("");

const bodyHtml = (v, tab) => (TABS.find((t) => t.id === tab) || TABS[0]).body(v);

function frontHtml(v) {
  const chips = v.ka
    .map(
      (k, i) =>
        `<div class="syl${i === v.stress ? " stress" : ""}"><b>${esc(k)}</b>${v.en[i] ? `<small>${esc(v.en[i])}</small>` : ""}</div>`
    )
    .join("");
  return `
  <div class="face front">
    <div class="deco d1"></div><div class="deco d2"></div><div class="sheen"></div>
    <svg class="spark s1" width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>
    <svg class="spark s2" width="14" height="14" viewBox="0 0 24 24" fill="#FFC83D" aria-hidden="true"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>
    <button class="flip-hit" data-act="flip" aria-label="ბარათის გადაბრუნება"></button>
    <div class="front-in">
      <div class="row gap8 rise" style="animation-delay:.1s">
        <span class="pill glass">${esc(v.pos)}</span>
        <span class="pill white">${esc(v.cefr)}</span>
      </div>
      <div class="front-mid">
        <div class="term rise" style="animation-delay:.2s">${esc(v.term)}</div>
        <div class="ipa rise" style="animation-delay:.3s">${esc(v.ipa)}</div>
        <div class="speak-wrap rise" style="animation-delay:.4s">
          <i class="ring"></i><i class="ring r2"></i>
          <button class="speak" data-act="speak" aria-label="მოსმენა">${icon.speaker}</button>
        </div>
        <div class="sylbox rise" style="animation-delay:.5s">
          <div class="lbl">წაიკითხე ქართულად</div>
          <div class="syls">${chips}</div>
        </div>
      </div>
      <div class="front-foot">
        <img class="girl" src="assets/girl-point.webp" alt="" width="132" height="176">
        <div class="hint">${icon.flip}<span>შეეხე და გადაატრიალე</span></div>
      </div>
    </div>
  </div>`;
}

function backHtml(v, tab) {
  return `
  <div class="face back">
    <div class="back-top">
      <div class="deco d3"></div>
      <div class="row gap10 rel">
        <button class="roundbtn" data-act="flip" aria-label="უკან გადაბრუნება">${icon.back}</button>
        <div class="back-term">${esc(v.term)}</div>
        <span class="pill dark">+${v.xp} XP</span>
      </div>
      <div class="lbl dark rel">თარგმანი</div>
      <div class="primary rel">${esc(v.primary)}</div>
      <div class="chips rel">${v.alts.map((a) => `<span class="chip alt">${esc(a)}</span>`).join("")}</div>
    </div>
    <div class="tabs">${tabsHtml(tab)}</div>
    <div class="back-body">${bodyHtml(v, tab)}</div>
  </div>`;
}

function stageHtml(w, enter = true) {
  const v = vm(w);
  return `<div class="cardwrap${enter ? " enter" : ""}"><div class="flipper${S.flipped ? " flipped" : ""}">${frontHtml(v)}${backHtml(v, S.tab)}</div></div>`;
}

function srsHtml(w) {
  const l = labels(state.cards.get(w.id) || {});
  const v = vm(w);
  return `
  <button class="srs again" data-grade="0"><b>ისევ</b><small>${l.again}</small></button>
  <button class="srs hard" data-grade="1"><b>რთული</b><small>${l.hard}</small></button>
  <button class="srs good" data-grade="2"><b>კარგი</b><small>${l.good}</small></button>
  <button class="srs easy" data-grade="3"><b>ადვილი</b><small>${l.easy}</small></button>
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
    <img src="assets/girl-cheer.webp" alt="" width="190" height="260">
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
  <div class="cards-bg"></div>
  <div class="cards-top">${header()}
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
    return `<div class="cards-page">${pageHtml()}</div>`;
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
      setTimeout(() => {
        S.queue.shift();
        if (grade === 0) S.queue.push(w);
        else S.done += 1;
        S.flipped = false;
        S.tab = "meaning";
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
      const t = e.target.closest("[data-act],[data-tab],[data-grade]");
      if (!t || !cur()) return;
      if (t.dataset.act === "flip") {
        if (S.busy) return;
        S.flipped = !S.flipped;
        root.querySelector(".flipper").classList.toggle("flipped", S.flipped);
        root.querySelector("#srs").classList.toggle("ready", S.flipped);
      } else if (t.dataset.act === "speak") {
        e.stopPropagation();
        const v = vm(cur());
        speak(v.term, v.ttsLang, v.rate);
      } else if (t.dataset.tab) {
        S.tab = t.dataset.tab;
        root.querySelectorAll(".tabbtn").forEach((b) => b.classList.toggle("on", b.dataset.tab === S.tab));
        const body = root.querySelector(".back-body");
        body.innerHTML = bodyHtml(vm(cur()), S.tab);
        body.scrollTop = 0;
      } else if (t.dataset.grade !== undefined) {
        answer(Number(t.dataset.grade));
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  },
};
