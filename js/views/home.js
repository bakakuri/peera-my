import { state, LANGS } from "../state.js";
import { header, flag, icon } from "../ui.js";
import { esc, toast } from "../util.js";

const TILES = [
  { cls: "t1", href: "#/lesson", label: "მოსმენა და გამოთქმა", svg: `<path d="M4 15v-3a8 8 0 0 1 16 0v3" fill="none" stroke="#3D4FD0" stroke-width="2.2" stroke-linecap="round"/><rect x="3" y="13" width="5" height="8" rx="2.5" fill="#5B6CFF"/><rect x="16" y="13" width="5" height="8" rx="2.5" fill="#5B6CFF"/>` },
  { cls: "t2", soon: true, label: "თამაშები და ტესტები", svg: `<rect x="2" y="7" width="20" height="11" rx="5.5" fill="#2F6BFF"/><path d="M7 10v4M5 12h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="11" r="1.2" fill="#FFC83D"/><circle cx="18.5" cy="13.5" r="1.2" fill="#22C55E"/>` },
  { cls: "t3", href: "#/progress", label: "მიღწევები", svg: `<path fill="#FFC21A" stroke="#F5A300" stroke-width="1" stroke-linejoin="round" d="M7 3h10v6a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" stroke="#F5A300" stroke-width="1.6"/><rect x="10.5" y="14" width="3" height="4" fill="#F5A300"/><rect x="8" y="18" width="8" height="3" rx="1" fill="#FFC21A" stroke="#F5A300" stroke-width="1"/>` },
  { cls: "t4", soon: true, label: "გრამატიკა", svg: `<path fill="#4B7BFF" d="M2 5c3-1 7-1 10 1v14c-3-2-7-2-10-1z"/><path fill="#7FA2FF" d="M22 5c-3-1-7-1-10 1v14c3-2 7-2 10-1z"/><path d="M5 9h4M5 12h4M15 9h4M15 12h4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>` },
  { cls: "t5", href: "#/cards", label: "სიტყვების სწავლა", svg: `<path fill="#22C55E" d="M3 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="7" cy="10" r="1.1" fill="#fff"/><circle cx="10.5" cy="10" r="1.1" fill="#fff"/><circle cx="14" cy="10" r="1.1" fill="#fff"/><path fill="#2F9E6B" d="M19 9h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v3l-3-3h-4"/>` },
  { cls: "t6", soon: true, label: "სასწავლო გეგმა", svg: `<rect x="3" y="5" width="18" height="16" rx="3" fill="#fff" stroke="#FF5A7A" stroke-width="1.6"/><path d="M3 9h18V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3z" fill="#FF5A7A"/><path d="M8 3v4M16 3v4" stroke="#C93A5A" stroke-width="1.8" stroke-linecap="round"/><g fill="#FF8FA8"><rect x="6.5" y="12" width="2.4" height="2.4" rx=".6"/><rect x="10.8" y="12" width="2.4" height="2.4" rx=".6"/><rect x="15.1" y="12" width="2.4" height="2.4" rx=".6"/><rect x="6.5" y="16" width="2.4" height="2.4" rx=".6"/><rect x="10.8" y="16" width="2.4" height="2.4" rx=".6"/></g>` },
];

export default {
  render() {
    const lang = state.langInfo();
    const list = state.wordsOf();
    const learned = state.learnedOf();
    const pct = list.length ? Math.round((learned / list.length) * 100) : 0;
    const s = state.stats;
    const ach = state.achievements().filter((a) => a.done).length;
    const due = state.queue().length;

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

    const tiles = TILES.map((t) => {
      const inner = `<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">${t.svg}</svg><span>${t.label}</span>`;
      return t.href
        ? `<a class="tile ${t.cls}" href="${t.href}">${inner}</a>`
        : `<button class="tile ${t.cls}" data-soon="1">${inner}</button>`;
    }).join("");

    return `
    <section class="hero hero-home">
      <div class="deco hd1"></div><div class="deco hd2"></div>
      <img class="hero-girl" src="assets/girl-point.webp" alt="" width="190" height="257">
      ${header()}
      <div class="hero-copy">
        <p class="tag rise" style="animation-delay:.1s">ისწავლე. ისაუბრე. მიაღწიე.</p>
        <h1 class="rise" style="animation-delay:.2s">დაიწყე<br><span>${esc(lang.name)}</span><br>ენის სწავლა!</h1>
        <a class="cta cta-yellow rise" style="animation-delay:.3s" href="#/lesson"><i class="shine"></i>${icon.play}<span>დღევანდელი გაკვეთილი</span>${icon.arrow}</a>
      </div>
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

    <section class="block">
      <div class="card-head plain">
        <h2><svg width="22" height="22" viewBox="0 0 24 24" fill="#4B5BFF" aria-hidden="true"><path d="M2 5c3-1 7-1 10 1v14c-3-2-7-2-10-1zM22 5c-3-1-7-1-10 1v14c3-2 7-2 10-1z"/></svg>კურსები</h2>
      </div>
      <div class="courses">${courses}</div>
      <div class="tiles">${tiles}</div>
    </section>`;
  },

  mount(root) {
    const onClick = (e) => {
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
