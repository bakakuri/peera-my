import { state } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, toast } from "../util.js";

const lockIcon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
const checkIcon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const ROW = 118;

function pathHtml(list, nextId) {
  if (!list.length) return "";
  const xs = list.map((_, i) => Math.round(Math.sin(i * 1.15) * 28)); // % ცენტრიდან
  const pts = xs.map((x, i) => [50 + x, ROW * i + ROW / 2]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` C ${px} ${py + ROW * 0.55}, ${x} ${y - ROW * 0.55}, ${x} ${y}`;
  }
  const nodes = list
    .map((l, i) => {
      const done = state.lessonDone(l.id);
      const unlocked = i === 0 || state.lessonDone(list[i - 1].id) || done;
      const cur = l.id === nextId;
      const cls = done ? "done" : cur ? "current" : unlocked ? "open" : "locked";
      const inner = done ? checkIcon : unlocked ? `<b>${l.number}</b>` : lockIcon;
      const res = state.lessonResults()[l.id];
      return `
      <button class="lnode ${cls} rise" style="left:${pts[i][0]}%;top:${pts[i][1]}px;animation-delay:${0.15 + i * 0.07}s" data-lesson="${esc(l.id)}" data-locked="${unlocked ? "" : "1"}" aria-label="${esc(l.title)}">
        ${cur ? '<i class="lring"></i><em class="lstart">დაიწყე</em>' : ""}
        <span class="lcircle">${inner}</span>
        <span class="lname"><b>${esc(l.title)}</b><small>${res ? `${res.best} / ${res.total} სწორი` : esc(l.sub || "")}</small></span>
      </button>`;
    })
    .join("");
  return `
    <div class="lpath" style="height:${ROW * list.length}px">
      <svg class="lpath-line" viewBox="0 0 100 ${ROW * list.length}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" vector-effect="non-scaling-stroke"/></svg>
      ${nodes}
    </div>`;
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
        <img src="assets/girl-cheer.webp" alt="" width="170" height="233">
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
