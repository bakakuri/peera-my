import { state } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, toast } from "../util.js";

const lockIcon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
const checkIcon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
function pathHtml(list, nextId) {
  if (!list.length) return "";
  return `<div class="v3-lesson-map">${list.map((l,i) => {
    const done = state.lessonDone(l.id);
    const unlocked = i === 0 || state.lessonDone(list[i - 1].id) || done;
    const current = l.id === nextId;
    const res = state.lessonResults()[l.id];
    const cls = done ? "done" : current ? "current" : unlocked ? "open" : "locked";
    return `<button type="button" class="v3-lesson-tile ${cls}" data-lesson="${esc(l.id)}" data-locked="${unlocked ? "" : "1"}" aria-label="${esc(l.title)}">
      <span class="v3-lesson-node">${done ? checkIcon : unlocked ? `<b>${l.number}</b>` : lockIcon}</span>
      <span class="v3-lesson-info"><small>გაკვეთილი ${l.number} ${current ? "· დაიწყე" : done ? "· დასრულებულია" : ""}</small><b>${esc(l.title)}</b><em>${esc(l.sub || "")}</em><span class="v3-lesson-stars">${done ? "⭐⭐⭐" : "☆☆☆"} <i>+${l.level === "A1" ? 50 : 100} XP</i></span></span>
      <span class="v3-lesson-status">${done ? "✓" : current ? "▶" : unlocked ? "›" : "🔒"}</span>
    </button>`;
  }).join("")}</div>`;
}

export default {
  render() {
    const lang = state.langInfo();
    const list = state.lessonsFor();
    const done = list.filter((l) => state.lessonDone(l.id)).length;
    const next = state.nextLesson();
    const levels = [...new Set(list.map((l) => l.level))];

    const head = `
    <section class="hero hero-sm"><div class="deco hd1"></div><div class="deco hd2"></div>${header()}
      <div class="hero-title">
        <span class="pill yellow rise">${esc(lang.name)} · ${done} / ${list.length}</span>
        <h1 class="rise" style="animation-delay:.1s">გაკვეთილები</h1>
      </div>
    </section>`;

    if (!list.length) {
      return `${head}
      <div class="finish rise">
        <img src="assets/girl-cheer.png" alt="" width="170" height="233">
        <h2>${esc(lang.name)} გაკვეთილები მალე</h2>
        <p>ამ ენაზე გაკვეთილები ჯერ არ არის. ჯერჯერობით სცადე ბარათები.</p>
        <a class="cta" href="#/cards">ბარათებზე გადასვლა ${icon.arrow}</a>
      </div>`;
    }

    const today = next
      ? `<section class="card today rise" style="animation-delay:.2s">
          <span class="pill dark">დღევანდელი გაკვეთილი</span>
          <h2>${esc(next.title)}</h2>
          <p>${esc(next.sub || "")}</p>
          <div class="today-meta"><span>${esc(next.level)}</span><span>${next.words.length} სიტყვა</span><span>დიალოგი</span><span>ვარჯიში</span></div>
          <a class="cta cta-primary" href="#/lesson/${esc(next.id)}">დაიწყე გაკვეთილი ${icon.arrow}</a>
        </section>`
      : `<section class="card today rise" style="animation-delay:.2s">
          <span class="pill mint">ყველა დასრულებულია</span>
          <h2>მოლოცვა!</h2>
          <p>ამ ენის ყველა გაკვეთილი გაიარე. ნებისმიერი შეგიძლია თავიდან გაიმეორო.</p>
        </section>`;

    const sections = levels
      .map((lv) => `<div class="level-head"><span class="pill blue">${esc(lv)}</span></div>${pathHtml(list.filter((l) => l.level === lv), next?.id)}`)
      .join("");

    return `${head}${today}<section class="lpath-wrap">${sections}</section>`;
  },

  mount(root) {
    const onClick = (e) => {
      const n = e.target.closest("[data-lesson]");
      if (!n) return;
      if (n.dataset.locked) return toast("ჯერ წინა გაკვეთილი დაასრულე");
      location.hash = "#/lesson/" + n.dataset.lesson;
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  },
};
