import * as db from "../db.js";
import { state, LANGS } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, toast } from "../util.js";

let pending = null; // { rows, langs, name }

// JSON ფაილი → ბაზის სტრიქონები (ფორმატი: მასივი, {entries:[]}, {words:[]} ან ერთი სიტყვა)
function parse(json) {
  const list = Array.isArray(json) ? json : json.entries || json.words || (json.id && json.core ? [json] : []);
  const rows = [];
  const errors = [];
  const seen = new Set();
  list.forEach((w, i) => {
    const id = w?.id;
    const term = w?.core?.term;
    const code = String(w?.language?.code || "").slice(0, 2).toLowerCase();
    if (!id || !term || !code) {
      errors.push(`#${i + 1}: აკლია id / core.term / language.code`);
      return;
    }
    if (seen.has(id)) {
      errors.push(`#${i + 1}: განმეორებული id ${id}`);
      return;
    }
    seen.add(id);
    rows.push({ id: String(id), language_code: code, position: 10 + i, data: w });
  });
  const langs = {};
  rows.forEach((r) => (langs[r.language_code] = (langs[r.language_code] || 0) + 1));
  return { rows, errors, langs };
}

const langName = (c) => LANGS.find((l) => l.code === c)?.name || c;

export default {
  render() {
    const user = db.getUser();
    const head = `
    <section class="hero hero-sm"><div class="deco hd1"></div>${header()}
      <div class="hero-title"><h1 class="rise">ადმინ პანელი</h1></div>
    </section>`;
    if (!db.isCloud()) {
      return `${head}<section class="card rise"><p class="muted">Supabase მიერთებული არ არის (დემო რეჟიმი). ადმინ პანელი მხოლოდ ბაზასთან მუშაობს.</p></section>`;
    }
    if (!user) {
      return `${head}<section class="card rise"><p class="muted">ადმინ პანელისთვის ჯერ შედი ანგარიშში.</p><a class="cta cta-primary" style="margin-top:12px" href="#/auth">შესვლა ${icon.arrow}</a></section>`;
    }
    return `${head}
    <section class="card rise" id="adm-body"><p class="muted">მოწმდება წვდომა…</p></section>`;
  },

  mount(root) {
    const body = root.querySelector("#adm-body");
    if (!body) return null;
    let dead = false;

    const counts = async () => {
      const c = await db.wordCounts();
      return LANGS.map((l) => `<div class="adm-count"><b>${c[l.code] ?? 0}</b><span>${esc(l.name)}</span></div>`).join("");
    };

    async function paint() {
      const ok = await db.isAdmin();
      if (dead) return;
      if (!ok) {
        body.innerHTML = `<p class="muted">ამ ანგარიშს ადმინის უფლება არ აქვს (${esc(db.getUser()?.email || "")}). გაუშვი <b>supabase/admin.sql</b> Supabase-ში.</p>`;
        return;
      }
      let countsHtml = "";
      try { countsHtml = await counts(); } catch (e) { countsHtml = `<p class="form-msg">${esc(e.message)}</p>`; }
      if (dead) return;
      body.innerHTML = `
        <div class="card-head plain"><h3>ბაზაში სიტყვები</h3></div>
        <div class="adm-counts" id="adm-counts">${countsHtml}</div>

        <div class="adm-sep"></div>
        <div class="card-head plain"><h3>JSON ატვირთვა</h3></div>
        <label class="file-pick">
          <input type="file" id="adm-file" accept=".json,application/json" hidden>
          <span id="adm-file-name">აირჩიე JSON ფაილი</span>
        </label>
        <div class="adm-preview" id="adm-preview"></div>
        <div class="progress-row adm-prog" id="adm-prog" hidden><div class="bar"><i id="adm-bar" style="width:0"></i></div><span id="adm-pct">0%</span></div>
        <button class="cta cta-primary" id="adm-upload" disabled>ბაზაში ჩაწერა ${icon.arrow}</button>

        <div class="adm-sep"></div>
        <div class="card-head plain"><h3>ბაზის გასუფთავება</h3></div>
        <p class="muted">წაიშლება არჩეული ენის ყველა სიტყვა. ამ სიტყვებზე მომხმარებლების პროგრესიც წაიშლება.</p>
        <div class="adm-clear">
          <select id="adm-lang" class="adm-select">${LANGS.map((l) => `<option value="${l.code}"${l.code === state.lang ? " selected" : ""}>${esc(l.name)}</option>`).join("")}</select>
          <button class="cta adm-danger" id="adm-clear">გასუფთავება</button>
        </div>
        <p class="form-msg" id="adm-msg" role="status"></p>`;
    }

    const msg = (t, ok) => {
      const m = root.querySelector("#adm-msg");
      if (m) { m.textContent = t; m.className = "form-msg" + (ok ? " ok" : ""); }
    };

    const onChange = async (e) => {
      if (e.target.id !== "adm-file") return;
      const f = e.target.files[0];
      pending = null;
      root.querySelector("#adm-upload").disabled = true;
      const prev = root.querySelector("#adm-preview");
      if (!f) return;
      root.querySelector("#adm-file-name").textContent = f.name;
      try {
        const text = (await f.text()).replace(/^﻿/, "");
        const res = parse(JSON.parse(text));
        const langs = Object.entries(res.langs).map(([c, n]) => `${esc(langName(c))}: <b>${n}</b>`).join(" · ");
        prev.innerHTML = res.rows.length
          ? `<p class="adm-ok">ნაპოვნია <b>${res.rows.length}</b> სიტყვა (${langs}).</p>${res.errors.length ? `<p class="form-msg">გამოტოვებულია ${res.errors.length}: ${esc(res.errors.slice(0, 3).join("; "))}${res.errors.length > 3 ? "…" : ""}</p>` : ""}`
          : `<p class="form-msg">ფაილში ვალიდური სიტყვა ვერ მოიძებნა. ${esc(res.errors.slice(0, 3).join("; "))}</p>`;
        if (res.rows.length) {
          pending = { rows: res.rows, name: f.name };
          root.querySelector("#adm-upload").disabled = false;
        }
      } catch (err) {
        prev.innerHTML = `<p class="form-msg">JSON ვერ წაიკითხა: ${esc(err.message)}</p>`;
      }
    };

    const onClick = async (e) => {
      const up = e.target.closest("#adm-upload");
      const cl = e.target.closest("#adm-clear");
      if (up && pending) {
        up.disabled = true;
        const prog = root.querySelector("#adm-prog");
        prog.hidden = false;
        try {
          await db.upsertWords(pending.rows, (done, total) => {
            const p = Math.round((done / total) * 100);
            root.querySelector("#adm-bar").style.width = p + "%";
            root.querySelector("#adm-pct").textContent = p + "%";
          });
          msg(`ჩაიწერა ${pending.rows.length} სიტყვა.`, true);
          toast(`ჩაიწერა ${pending.rows.length} სიტყვა`);
          pending = null;
          await state.load();
          root.querySelector("#adm-counts").innerHTML = await counts();
        } catch (err) {
          msg("ვერ ჩაიწერა: " + (err.message || err), false);
          up.disabled = false;
        }
      } else if (cl) {
        const code = root.querySelector("#adm-lang").value;
        const n = (await db.wordCounts([code]))[code];
        if (!n) return msg(`${langName(code)}: ბაზაში სიტყვა არ არის.`, false);
        if (!window.confirm(`წაიშლება ${langName(code)} ენის ${n} სიტყვა და მათზე მომხმარებლების პროგრესი. გაგრძელება?`)) return;
        cl.disabled = true;
        try {
          const removed = await db.clearLanguage(code);
          msg(`წაიშალა ${removed} სიტყვა (${langName(code)}).`, true);
          await state.load();
          root.querySelector("#adm-counts").innerHTML = await counts();
        } catch (err) {
          msg("ვერ წაიშალა: " + (err.message || err), false);
        }
        cl.disabled = false;
      }
    };

    root.addEventListener("change", onChange);
    root.addEventListener("click", onClick);
    paint();
    return () => {
      dead = true;
      root.removeEventListener("change", onChange);
      root.removeEventListener("click", onClick);
    };
  },
};
