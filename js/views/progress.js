import { state } from "../state.js";
import * as db from "../db.js";
import { header, icon, badgeIcon } from "../ui.js";
import { esc } from "../util.js";

export default {
  render() {
    const s = state.stats;
    const list = state.wordsOf();
    const learned = state.learnedOf();
    const total = list.length;
    const pct = total ? Math.round((learned / total) * 100) : 0;
    const week = state.week();
    const max = Math.max(5, ...week.map((d) => d.value));
    const bars = week
      .map(
        (d, i) => `<div class="wk${d.today ? " today" : ""}"><i class="${d.value ? "has" : ""}" style="height:${d.value ? Math.max(10, Math.round((d.value / max) * 70)) : 6}px;animation-delay:${0.2 + i * 0.07}s"></i><span>${d.label}</span></div>`
      )
      .join("");
    const badges = state
      .achievements()
      .map(
        (a) => `<div class="badge${a.done ? " done" : ""}" title="${esc(a.hint)}">
          <span class="b-ico">${a.done ? badgeIcon(a.id) : icon.lock}</span>
          <b>${esc(a.title)}</b>
          <small>${esc(a.hint)}</small>
        </div>`
      )
      .join("");
    const user = db.getUser();
    const account = db.isCloud()
      ? user
        ? `<div class="account"><span>${esc(user.email || "")}</span><button class="link" data-act="signout">გასვლა</button></div><a class="account admin-link" id="admin-link" href="#/admin" hidden>ადმინ პანელი ${icon.arrow}</a>`
        : `<div class="account"><span>პროგრესი ამ მოწყობილობაზეა</span><a class="link" href="#/auth">შესვლა ან რეგისტრაცია</a></div>`
      : `<div class="account"><span>დემო რეჟიმი — პროგრესი ამ მოწყობილობაზე ინახება</span></div>`;

    return `
    <section class="hero hero-sm hero-progress">
      <div class="deco hd1"></div>
      ${header()}
    </section>

    <section class="hero-card rise">
      <i class="deco hc1"></i><i class="deco hc2"></i>
      <img class="hero-cheer" src="assets/girl-cheer.webp" alt="" width="110" height="150">
      <div class="big">${learned}</div>
      <p>ნასწავლი სიტყვა · ${esc(state.langInfo().name)}</p>
      <small>სულ ${total} სიტყვა</small>
      <div class="lvl"><div class="lvl-bar"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>
    </section>

    <section class="card rise" style="animation-delay:.12s">
      <div class="card-head plain"><h3>ბოლო 7 დღე</h3><small>გამეორებები</small></div>
      <div class="week">${bars}</div>
    </section>

    <section class="tiles2 rise" style="animation-delay:.2s">
      <div class="big-tile coral"><b>${state.retention()}%</b><span>დამახსოვრება</span></div>
      <div class="big-tile mint"><b>${s.streak}</b><span>დღე ზედიზედ</span></div>
      <div class="big-tile blue"><b>${s.xp}</b><span>XP სულ</span></div>
    </section>

    <section class="block rise" style="animation-delay:.28s">
      <div class="card-head plain"><h3>მიღწევები</h3></div>
      <div class="badges">${badges}</div>
    </section>

    <section class="pad-x rise" style="animation-delay:.34s">${account}</section>`;
  },

  mount(root) {
    const onClick = async (e) => {
      if (e.target.closest('[data-act="signout"]')) {
        await db.signOut();
      }
    };
    root.addEventListener("click", onClick);
    const link = root.querySelector("#admin-link");
    if (link) db.isAdmin().then((ok) => { if (ok) link.hidden = false; });
    return () => root.removeEventListener("click", onClick);
  },
};
