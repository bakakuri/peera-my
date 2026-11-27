import { state, LANGS } from "../state.js";
import { BUCKETS } from "../srs.js";
import { header, icon } from "../ui.js";
import { vm } from "../word.js";
import { esc, speak, toast } from "../util.js";
import { canListen, listen } from "../speech.js";
import { frontHtml, backHtml } from "./cards.js";

let tab = "all";
let limit = 200;
let query = "";

const TABS = [{ id: "all", title: "ყველა", color: "#4f6bff" }, ...BUCKETS];
const hint = {
  all: "ბაზის ყველა სიტყვა ანბანის რიგით.",
  learned: "ბარათზე „ადვილი“-ს არჩევისას სიტყვა აქ გადმოდის.",
  review: "ბარათზე „კარგი“-ს არჩევისას სიტყვა აქ გადმოდის.",
  study: "ბარათზე „რთული“-ს არჩევისას სიტყვა აქ გადმოდის.",
  memorize: "ბარათზე „ისევ“-ის არჩევისას სიტყვა აქ გადმოდის.",
};

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss");
const ph = (w) => w.core?.phonetic?.georgian?.transcription || (w.core?.phonetic?.georgian?.syllables || []).join("") || "";
const colorOf = (id) => BUCKETS.find((b) => b.id === id)?.color || "#cfd3ea";
const titleOf = (id) => BUCKETS.find((b) => b.id === id)?.title;

function listFor() {
  const q = norm(query.trim());
  return state
    .wordsOf()
    .filter((w) => q || tab === "all" || state.bucketOfWord(w.id) === tab)
    .filter((w) => !q || norm(w.core?.term).includes(q) || norm(w.core?.lemma).includes(q) || norm(ph(w)).includes(q) || norm(JSON.stringify(w.semantics || {})).includes(q));
}

function countOf(id) {
  const words = state.wordsOf();
  return id === "all" ? words.length : words.filter((w) => state.bucketOfWord(w.id) === id).length;
}

const heart = (on) => `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.3 5c1.9 0 3.6 1 4.7 2.6h2C14.1 6 15.8 5 17.7 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" fill="${on ? "#ff3b4e" : "none"}" stroke="${on ? "#ff3b4e" : "#a3a8c8"}" stroke-width="2" stroke-linejoin="round"/></svg>`;
const spk = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function rows(list) {
  if (!list.length) {
    return `<p class="dict-empty">${query ? "ვერაფერი მოიძებნა." : "აქ ჯერ სიტყვა არ არის. " + esc(hint[tab])}</p>`;
  }
  const shown = list.slice(0, limit);
  return (
    shown
      .map(
        (w, i) => `
    <div class="drow" data-id="${esc(w.id)}">
      <span class="n">${i + 1}</span>
      <button class="dsay" data-say="${esc(w.id)}" aria-label="მოსმენა">${spk}</button>
      <span class="w"><b>${esc(w.core?.term)}</b></span>
      <span class="p">${esc(ph(w))}</span>
      <span class="t">${esc(w.semantics?.primaryTranslation)}</span>
      <button class="dheart" data-fav="${esc(w.id)}" aria-label="რჩეული">${heart(state.isFav(w.id))}</button>
    </div>`
      )
      .join("") + (list.length > limit ? `<button class="cta dmore" data-more>კიდევ ${Math.min(200, list.length - limit)} სიტყვა</button>` : "")
  );
}

const PILLS = ["learned", "review", "study", "memorize"];
function tabsHtml() {
  const all = `<button class="dpill dall${tab === "all" ? " on" : ""}${tab !== "all" ? " dim" : ""}" data-tab="all" aria-pressed="${tab === "all"}"><span class="all-t">ყველა</span><b class="cnt">${countOf("all")}</b></button>`;
  return all + PILLS.map(
    (id) =>
      `<button class="dpill${tab === id ? " on" : ""}${tab !== "all" && tab !== id ? " dim" : ""}" data-tab="${id}" aria-pressed="${tab === id}" aria-label="${esc(titleOf(id))}"><img src="assets/tab-${id}.webp" alt="" draggable="false"><b class="cnt">${countOf(id)}</b></button>`
  ).join("");
}

const mic = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>`;
const mag = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7b80b4" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>`;

function langsHtml() {
  return LANGS.filter((l) => state.wordsOf(l.code).length)
    .map((l) => `<button class="dlang${l.code === state.lang ? " on" : ""}" data-lang="${l.code}">${esc(l.name)}</button>`)
    .join("");
}

export default {
  render() {
    return `
    <section class="hero hero-sm dict-hero"><div class="deco hd1"></div>${header()}
      <img class="dh-book" src="assets/az-book.webp" alt="" width="190">
      <img class="dh-girl" src="assets/girl-dict.webp" alt="" width="190">
    </section>
    <section class="dict-sheet rise">
      <div class="dlangs" id="dict-langs">${langsHtml()}</div>
      <div class="dsearch">${mag}<input id="dict-search" type="search" placeholder="ძებნა..." value="${esc(query)}" autocomplete="off"><button class="dmic" id="dict-mic" aria-label="ხმოვანი ძებნა">${mic}</button></div>
      <div class="dpills" id="dict-tabs">${tabsHtml()}</div>
      <p class="dict-hint" id="dict-hint">${esc(hint[tab])}</p>
      <div class="dict-head"><span>#</span><span></span><span>სიტყვა</span><span>ფონეტიკა</span><span>თარგმანი</span><span></span></div>
      <div class="dict-list" id="dict-list">${rows(listFor())}</div>
    </section>`;
  },

  mount(root) {
    const $ = (s) => root.querySelector(s);
    let modal = null;
    const repaint = () => {
      $("#dict-tabs").innerHTML = tabsHtml();
      $("#dict-hint").textContent = hint[tab];
      $("#dict-list").innerHTML = rows(listFor());
    };

    function close() {
      modal?.remove();
      modal = null;
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    function open(id) {
      const w = state.words.find((x) => x.id === id);
      if (!w) return;
      close();
      const v = vm(w);
      const b = state.bucketOfWord(id);
      modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-backdrop" data-close></div>
        <div class="modal-body">
          <button class="modal-x" data-close aria-label="დახურვა"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <div class="modal-card"><div class="cardwrap enter"><div class="flipper">${frontHtml(v)}${backHtml(v)}</div></div></div>
          <div class="modal-status"><i class="dot" style="background:${colorOf(b)}"></i>${b ? esc(titleOf(b)) : "ჯერ არ ისწავლება"}</div>
        </div>`;
      modal.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]")) return close();
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "flip") {
          const wrap = modal.querySelector(".cardwrap");
          wrap.classList.add("flipping");
          setTimeout(() => wrap.classList.remove("flipping"), 760);
          modal.querySelector(".flipper").classList.toggle("flipped");
        } else if (act === "speak") {
          speak(v.term, v.ttsLang, v.rate);
        }
      });
      document.body.appendChild(modal);
      document.addEventListener("keydown", onKey);
    }

    const onClick = async (e) => {
      const say = e.target.closest("[data-say]");
      const fav = e.target.closest("[data-fav]");
      const row = e.target.closest(".drow");
      const t = e.target.closest("[data-tab]");
      const l = e.target.closest("[data-lang]");
      if (say) {
        const w = state.words.find((x) => x.id === say.dataset.say);
        if (w) speak(w.core?.term, state.langInfo().tts, 0.9);
      } else if (fav) {
        const on = await state.toggleFav(fav.dataset.fav);
        fav.innerHTML = heart(on);
      } else if (e.target.closest("[data-more]")) {
        limit += 200;
        $("#dict-list").innerHTML = rows(listFor());
      } else if (e.target.closest("#dict-mic")) {
        if (!canListen()) return toast("ხმოვანი ძებნა ამ ბრაუზერში არ მუშაობს");
        const m = $("#dict-mic");
        m.classList.add("rec");
        try {
          const heards = await listen(state.langInfo().tts);
          query = heards[0];
          $("#dict-search").value = query;
          limit = 200;
          tab = "all";
          $("#dict-tabs").innerHTML = tabsHtml();
          $("#dict-hint").textContent = hint.all;
          $("#dict-list").innerHTML = rows(listFor());
        } catch {
          toast("ვერ გავიგე, სცადე ისევ");
        }
        m.classList.remove("rec");
      } else if (row) open(row.dataset.id);
      else if (t) {
        tab = tab === t.dataset.tab ? "all" : t.dataset.tab;
        limit = 200;
        repaint();
      } else if (l) {
        state.setLang(l.dataset.lang);
        window.dispatchEvent(new Event("hashchange"));
      }
    };
    const onInput = (e) => {
      if (e.target.id === "dict-search") {
        query = e.target.value;
        limit = 200;
        if (query.trim() && tab !== "all") {
          tab = "all";
          $("#dict-tabs").innerHTML = tabsHtml();
          $("#dict-hint").textContent = hint.all;
        }
        $("#dict-list").innerHTML = rows(listFor());
      }
    };
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    return () => {
      close();
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onInput);
    };
  },
};
