import { state, LANGS } from "../state.js";
import { header, flag, icon } from "../ui.js";
import { esc, toast } from "../util.js";

const TILES = [
  { img: "home-listen", href: "#/lesson", label: "მოსმენა და გამოთქმა" },
  { img: "home-games", soon: true, label: "თამაშები და ტესტები" },
  { img: "home-awards", href: "#/awards", label: "მიღწევები" },
  { img: "home-grammar", soon: true, label: "გრამატიკა" },
  { img: "home-words", href: "#/cards", label: "სიტყვების სწავლა" },
  { img: "home-plan", soon: true, label: "სასწავლო გეგმა" },
  { img: "az-book", href: "#/dictionary", label: "ლექსიკონი" },
];

function goalCard() {
  const goal = state.goal();
  const xp = state.todayXp();
  const pct = Math.min(100, Math.round((xp / goal) * 100));
  const done = xp >= goal;
  const week = state.weekDays()
    .map((d) => `<div class="wd${d.hit ? " hit" : ""}${d.today ? " now" : ""}${d.future ? " future" : ""}"><i>${d.hit ? "✓" : ""}</i><span>${d.label}</span></div>`)
    .join("");
  return `
    <section class="card goal-card rise" style="animation-delay:.4s">
      <div class="goal-top">
        <div class="goal-ring">
          <svg width="74" height="74" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="31" fill="none" stroke="#E4E6F5" stroke-width="9"/><circle cx="38" cy="38" r="31" fill="none" stroke="${done ? "#22C55E" : "#FFAE1A"}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(pct * 1.948).toFixed(1)} 195" transform="rotate(-90 38 38)"/></svg>
          <b>${pct}%</b>
        </div>
        <div class="goal-txt">
          <h3>${done ? "დღის მიზანი შესრულდა! 🎉" : "დღევანდელი მიზანი"}</h3>
          <p><b>${xp}</b> / ${goal} XP</p>
          <button class="goal-set" data-goal>შეცვალე მიზანი</button>
        </div>
      </div>
      <div class="gweek">${week}</div>
    </section>`;
}

export default {
  render() {
    const lang = state.langInfo();
    const list = state.wordsOf();
    const learned = state.learnedOf();
    const pct = list.length ? Math.round((learned / list.length) * 100) : 0;
    const s = state.stats;
    const ach = state.achievements().filter((a) => a.done).length;
    const due = state.queue().length;
    const nextL = state.nextLesson();

    const courses = LANGS.map((l, i) => {
      const n = state.wordsOf(l.code).length;
      const p = n ? Math.round((state.learnedOf(l.code) / n) * 100) : 0;
      const active = l.code === state.lang;
      return `
      <button class="course rise${active ? " active" : ""}" style="animation-delay:${0.45 + i * 0.1}s" ${n ? `data-lang="${l.code}"` : 'data-soon="1"'} aria-pressed="${active}">
        <span class="course-img" style="background:${l.bg}">
          <img src="${l.img}" alt="" loading="lazy">
          ${flag(l.flag)}
          ${n ? "" : '<em class="soon-badge">მალე</em>'}
        </span>
        <span class="course-info">
          <b>${l.name}</b>
          <small>${n ? `${n} სიტყვა` : "მალე დაემატება"}</small>
          <span class="mini"><i style="width:${p}%"></i></span>
          <strong>${p}%</strong>
        </span>
      </button>`;
    }).join("");

    const tiles = TILES.map((t, i) => {
      const inner = t.img === "az-book" ? `<span class="quick-dictionary"><img src="assets/az-book.png" alt="" loading="lazy"><b>ლექსიკონი</b></span>` : `<img src="assets/${t.img}.png" alt="${esc(t.label)}" draggable="false" loading="lazy">`;
      const st = `style="animation-delay:${0.5 + i * 0.06}s"`;
      return t.href
        ? `<a class="timg rise" ${st} href="${t.href}" aria-label="${esc(t.label)}">${inner}</a>`
        : `<button class="timg rise" ${st} data-soon="1" aria-label="${esc(t.label)}">${inner}</button>`;
    }).join("");

    return `
    <section class="hero hero-home">
      <div class="deco hd1"></div><div class="deco hd2"></div>
      <img class="hero-girl" src="assets/girl-point.png" alt="" width="190" height="257">
      ${header()}
      <div class="hero-copy">
        <p class="tag rise" style="animation-delay:.1s">✦ შენი ყოველდღიური სასწავლო თავგადასავალი</p>
        <h1 class="rise" style="animation-delay:.2s">განაგრძე სწავლა,<br><span>Peera.My-თან!</span></h1>
        <p class="hero-desc rise">ისწავლე ${esc(lang.name)} მარტივად, საინტერესო დავალებებით და ყოველდღიური წინსვლით.</p>
        <a class="cta cta-yellow rise" style="animation-delay:.3s" href="${nextL ? `#/lesson/${esc(nextL.id)}` : "#/lesson"}"><i class="shine"></i>${icon.play}<span>სწავლის გაგრძელება</span>${icon.arrow}</a>
      </div>
    </section>

    <section class="block">
      <div class="card-head plain">
        <h2><svg width="22" height="22" viewBox="0 0 24 24" fill="#4B5BFF" aria-hidden="true"><path d="M2 5c3-1 7-1 10 1v14c-3-2-7-2-10-1zM22 5c-3-1-7-1-10 1v14c3-2 7-2 10-1z"/></svg>ჩემი კურსები</h2>
      </div>
      <div class="courses">${courses}</div>
    </section>

    <section class="card progress-card rise" style="animation-delay:.35s">
      <div class="card-head">
        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="#4B5BFF" aria-hidden="true"><rect x="3" y="13" width="5" height="8" rx="1.5"/><rect x="10" y="8" width="5" height="13" rx="1.5"/><rect x="17" y="3" width="5" height="18" rx="1.5"/></svg>თქვენი პროგრესი</h2>
        <a href="#/progress">ნახვა მეტი ${icon.arrow}</a>
      </div>
      <div class="stats">
        <div class="ring-stat">
          <svg width="70" height="70" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="31" fill="none" stroke="#E4E6F5" stroke-width="9"/><circle cx="38" cy="38" r="31" fill="none" stroke="#22C55E" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(pct * 1.948).toFixed(1)} 195" transform="rotate(-90 38 38)"/></svg>
          <b>${pct}%</b>
        </div>
        <div class="stat">${icon.flame}<b>${s.streak} დღე</b><small>სერია</small></div>
        <div class="stat">${icon.star}<b>${s.xp}</b><small>ქულა</small></div>
        <div class="stat">${icon.trophy}<b>${ach}</b><small>მიღწევა</small></div>
      </div>
      ${due ? `<a class="due" href="#/cards"><b>${due}</b> ბარათი გელოდება ${icon.arrow}</a>` : ""}
    </section>


    <section class="block home-tools-block">
      <div class="card-head plain quick-heading"><h2><img src="assets/icons/star.png" alt=""> სწრაფი წვდომა</h2></div>
      <div class="tiles-img">${tiles}</div>
      <a class="home-ach-link" href="#/awards"><img src="assets/home-awards.png" alt="მიღწევები" loading="lazy"><span>მოიპოვე ახალი ჯილდოები</span></a>
    </section>

    ${goalCard()}`;
  },

  mount(root) {
    const onClick = async (e) => {
      if (e.target.closest("[data-goal]")) {
        const opts = [30, 50, 100, 150];
        const next = opts[(opts.indexOf(state.goal()) + 1) % opts.length];
        await state.setGoal(next);
        window.dispatchEvent(new Event("hashchange"));
        toast(`დღიური მიზანი: ${next} XP`);
        return;
      }
      const lang = e.target.closest("[data-lang]");
      if (lang) {
        state.setLang(lang.dataset.lang);
        window.dispatchEvent(new Event("hashchange"));
        return;
      }
      if (e.target.closest("[data-soon]")) toast("ეს განყოფილება მალე დაემატება");
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  },
};
