import { state, LANGS } from "../state.js";
import { BUCKETS } from "../srs.js";
import { header, icon } from "../ui.js";
import { vm } from "../word.js";
import { esc, speak } from "../util.js";
import { frontHtml, backHtml } from "./cards.js";

let tab = "all";
let query = "";

const TABS = [{ id: "all", title: "ყველა", color: "#4f6bff" }, ...BUCKETS];
const hint = {
  all: "ბაზის ყველა სიტყვა ანბანის რიგით.",
  learned: "ბარათზე „ადვილი“-ს არჩევისას სიტყვა აქ გადმოდის.",
  review: "ბარათზე „კარგი“-ს არჩევისას სიტყვა აქ გადმოდის.",
  study: "ბარათზე „რთული“-ს არჩევისას სიტყვა აქ გადმოდის.",
  memorize: "ბარათზე „ისევ“-ის არჩევისას სიტყვა აქ გადმოდის.",
};

const norm = (s) => String(s || "").toLowerCase();
const ph = (w) => w.core?.phonetic?.georgian?.transcription || (w.core?.phonetic?.georgian?.syllables || []).join("") || "";
const colorOf = (id) => BUCKETS.find((b) => b.id === id)?.color || "#cfd3ea";
const titleOf = (id) => BUCKETS.find((b) => b.id === id)?.title;

function listFor() {
  const q = norm(query.trim());
  return state
    .wordsOf()
    .filter((w) => tab === "all" || state.bucketOfWord(w.id) === tab)
    .filter((w) => !q || norm(w.core?.term).includes(q) || norm(w.semantics?.primaryTranslation).includes(q) || norm(ph(w)).includes(q));
}

function countOf(id) {
  const words = state.wordsOf();
  return id === "all" ? words.length : words.filter((w) => state.bucketOfWord(w.id) === id).length;
}

function rows(list) {
  if (!list.length) {
    return `<p class="dict-empty">${query ? "ვერაფერი მოიძებნა." : "აქ ჯერ სიტყვა არ არის. " + esc(hint[tab])}</p>`;
  }
  return list
    .map(
      (w, i) => `
    <button class="dict-row" data-id="${esc(w.id)}">
      <span class="n">${i + 1}</span>
      <span class="w"><i class="dot" style="background:${colorOf(state.bucketOfWord(w.id))}"></i><b>${esc(w.core?.term)}</b></span>
      <span class="p">${esc(ph(w))}</span>
      <span class="t">${esc(w.semantics?.primaryTranslation)}</span>
    </button>`
    )
    .join("");
}

function tabsHtml() {
  return TABS.map(
    (t) => `<button class="dtab${t.id === tab ? " on" : ""}" data-tab="${t.id}" style="--c:${t.color}">${t.title}<em>${countOf(t.id)}</em></button>`
  ).join("");
}

function langsHtml() {
  return LANGS.filter((l) => state.wordsOf(l.code).length)
    .map((l) => `<button class="dlang${l.code === state.lang ? " on" : ""}" data-lang="${l.code}">${esc(l.name)}</button>`)
    .join("");
}

export default {
  render() {
    return `
    <section class="hero hero-sm"><div class="deco hd1"></div>${header()}
      <div class="hero-title"><h1 class="rise">ლექსიკონი</h1></div>
    </section>
    <section class="card dict-card rise">
      <div class="dlangs" id="dict-langs">${langsHtml()}</div>
      <input class="dict-search" id="dict-search" type="search" placeholder="ძებნა…" value="${esc(query)}" autocomplete="off">
      <div class="dtabs" id="dict-tabs">${tabsHtml()}</div>
      <p class="dict-hint" id="dict-hint">${esc(hint[tab])}</p>
      <div class="dict-head"><span>#</span><span>სიტყვა</span><span>ფონეტიკა</span><span>თარგმანი</span></div>
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

    const onClick = (e) => {
      const row = e.target.closest(".dict-row");
      const t = e.target.closest("[data-tab]");
      const l = e.target.closest("[data-lang]");
      if (row) open(row.dataset.id);
      else if (t) {
        tab = t.dataset.tab;
        repaint();
      } else if (l) {
        state.setLang(l.dataset.lang);
        window.dispatchEvent(new Event("hashchange"));
      }
    };
    const onInput = (e) => {
      if (e.target.id === "dict-search") {
        query = e.target.value;
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
