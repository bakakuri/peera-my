import * as db from "../db.js";
import { state } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, toast } from "../util.js";

let tab = "ach";

function achHtml() {
  const list = state.allAchievements();
  const done = list.filter((a) => a.done).length;
  const groups = [...new Set(list.map((a) => a.group))];
  return `
  <div class="aw-sum rise"><b>${done}</b><span>/ ${list.length} მიღწევა</span><div class="bar"><i style="width:${Math.round((done / list.length) * 100)}%"></i></div></div>
  ${groups
    .map(
      (g) => `
    <h3 class="aw-group">${esc(g)}</h3>
    <div class="aw-list">${list
      .filter((a) => a.group === g)
      .map(
        (a, i) => `
      <div class="aw${a.done ? " done" : ""} rise" style="animation-delay:${i * 0.05}s">
        <span class="aw-ico">${a.done ? a.icon : icon.lock}</span>
        <div class="aw-txt"><b>${esc(a.title)}</b><small>${esc(a.hint)}</small>
          <div class="bar"><i style="width:${Math.round((a.cur / a.goal) * 100)}%"></i></div></div>
        <em>${a.done ? "✓" : `${a.cur}/${a.goal}`}</em>
      </div>`
      )
      .join("")}</div>`
    )
    .join("")}`;
}

const medal = ["🥇", "🥈", "🥉"];

function rankBody() {
  if (!db.isCloud()) return `<p class="muted card">რეიტინგი მუშაობს Supabase-ის მიერთებისას.</p>`;
  if (!db.getUser()) return `<section class="card rise"><p class="muted">რეიტინგში მონაწილეობისთვის შედი ანგარიშში.</p><a class="cta cta-primary" style="margin-top:12px" href="#/auth">შესვლა ${icon.arrow}</a></section>`;
  return `<div id="rank-box"><p class="muted card">იტვირთება…</p></div>`;
}

function rankList(rows, me) {
  const mine = rows.find((r) => r.user_id === me.id);
  const defName = (me.email || "").split("@")[0];
  return `
  <section class="card rise rank-name">
    <label for="rk-name">შენი სახელი რეიტინგში</label>
    <div class="rk-row"><input id="rk-name" maxlength="20" value="${esc(mine?.name || defName)}" autocomplete="off"><button class="cta cta-primary" id="rk-save">შენახვა</button></div>
  </section>
  <div class="rank-list">${rows
    .map((r, i) => {
      const name = r.name || "მოსწავლე #" + String(r.user_id).slice(0, 4);
      return `<div class="rk${r.user_id === me.id ? " me" : ""} rise" style="animation-delay:${Math.min(i, 12) * 0.04}s">
        <span class="rk-n">${medal[i] || i + 1}</span>
        <span class="rk-name">${esc(name)}${r.user_id === me.id ? " <i>(შენ)</i>" : ""}<small>🔥 ${r.streak} დღე</small></span>
        <b>${r.xp} <small>XP</small></b>
      </div>`;
    })
    .join("") || `<p class="muted">ჯერ არავინ არის რეიტინგში. შეასრულე გაკვეთილი და პირველი იქნები!</p>`}</div>`;
}

export default {
  render() {
    return `
    <section class="hero hero-sm"><div class="deco hd1"></div>${header()}
      <div class="hero-title"><h1 class="rise">მიღწევები</h1></div>
    </section>
    <div class="aw-tabs rise"><button data-tab="ach" class="${tab === "ach" ? "on" : ""}">🏅 მიღწევები</button><button data-tab="rank" class="${tab === "rank" ? "on" : ""}">🏆 რეიტინგი</button></div>
    <div class="aw-body" id="aw-body">${tab === "ach" ? achHtml() : rankBody()}</div>`;
  },

  mount(root) {
    let dead = false;
    const body = root.querySelector("#aw-body");

    async function loadRank() {
      const box = root.querySelector("#rank-box");
      if (!box) return;
      try {
        const rows = await db.loadLeaderboard();
        if (!dead) box.innerHTML = rankList(rows, db.getUser());
      } catch (e) {
        if (!dead) box.innerHTML = `<p class="form-msg card">რეიტინგი ვერ ჩაიტვირთა. გაუშვი supabase/profiles.sql (${esc(e.message || e)})</p>`;
      }
    }

    const paint = () => {
      root.querySelectorAll(".aw-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
      body.innerHTML = tab === "ach" ? achHtml() : rankBody();
      if (tab === "rank") loadRank();
    };

    const onClick = async (e) => {
      const t = e.target.closest(".aw-tabs [data-tab]");
      if (t) {
        tab = t.dataset.tab;
        return paint();
      }
      if (e.target.closest("#rk-save")) {
        const name = root.querySelector("#rk-name").value.trim();
        if (!name) return toast("ჩაწერე სახელი");
        try {
          await db.saveMyName(name);
          toast("სახელი შენახულია");
          loadRank();
        } catch (err) {
          toast("ვერ შეინახა: " + (err.message || err));
        }
      }
    };
    root.addEventListener("click", onClick);
    if (tab === "rank") loadRank();
    return () => {
      dead = true;
      root.removeEventListener("click", onClick);
    };
  },
};
