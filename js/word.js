import { esc, highlight } from "./util.js";

const colls = (list) =>
  (list || []).map((c) => (typeof c === "string" ? { text: c, ka: "" } : { text: c.text || c.en || "", ka: c.ka || "" }));

// JSON სიტყვა → ბარათისთვის მოსახერხებელი ობიექტი (ყველა ველი არასავალდებულოა)
export function vm(w) {
  const c = w.core || {};
  const p = c.phonetic || {};
  const g = p.georgian || {};
  const sem = w.semantics || {};
  const mor = w.morphology || {};
  const us = w.usage || {};
  const lx = w.lexicalRelations || {};
  const ex = w.exercises || {};
  const ka = g.syllables || (g.transcription ? [g.transcription] : p.georgianTranscription ? [p.georgianTranscription] : []);
  const en = g.syllables ? p.syllables || [] : [];
  return {
    id: w.id,
    ttsLang: w.language?.code || "en-US",
    rate: w.mediaAndSystem?.audio?.speechRate || 0.9,
    term: c.term || "",
    ipa: p.ipa || "",
    ka,
    en,
    stress: g.stressIndex ?? p.stressIndex ?? -1,
    pos: c.partOfSpeech?.labelKa || "",
    gender: c.partOfSpeech?.gender || null,
    cefr: c.level?.cefr || "",
    xp: w.mediaAndSystem?.srsMetadata?.xpValue || 10,
    primary: sem.primaryTranslation || "",
    alts: sem.alternativeTranslations || [],
    defTarget: sem.definition?.targetLang || "",
    defNative: sem.definition?.nativeLang || "",
    nuance: sem.nuance || "",
    cats: sem.categories || [],
    family: mor.wordFamily || [],
    etym: mor.etymology || "",
    colls: colls(us.collocations),
    examples: us.examples || [],
    grammar: us.grammarTip || "",
    mistakes: us.commonMistakes || [],
    syns: lx.synonyms || [],
    ants: lx.antonyms || [],
    conf: lx.confusables || [],
    blank: ex.fillInTheBlank || null,
  };
}

const sec = (cls, title, body) =>
  body ? `<section class="sec ${cls}"><h4>${esc(title)}</h4>${body}</section>` : "";

export function bodyMeaning(v) {
  const def =
    v.defTarget || v.defNative
      ? sec("", "განმარტება", `<p class="it">${esc(v.defTarget)}</p><p>${esc(v.defNative)}</p>`)
      : "";
  const nuance = v.nuance
    ? `<section class="sec yellow row"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B87800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="#FFD24D"/></svg><p>${esc(v.nuance)}</p></section>`
    : "";
  const cats = v.cats.length
    ? `<div class="chips">${v.cats.map((t, i) => `<span class="chip c${i % 3}">${esc(t)}</span>`).join("")}</div>`
    : "";
  const syns = v.syns.length
    ? sec("", "სინონიმები", v.syns.map((s) => `<div class="kv"><b>${esc(s.term)}</b><span>${esc(s.nuance)}</span></div>`).join(""))
    : "";
  const conf = v.conf.length
    ? sec("pink", `არ აგერიოს: ${v.conf[0].term}`, `<p>${esc(v.conf[0].difference)}</p>`)
    : "";
  return def + nuance + cats + syns + conf;
}

export function bodyExamples(v) {
  const ex = v.examples
    .map(
      (e) => `<section class="sec">
        ${e.context ? `<span class="tag">${esc(e.context)}</span>` : ""}
        <p class="sent">${highlight(e.sentence, e.highlight)}</p>
        <p class="muted">${esc(e.translation)}</p>
      </section>`
    )
    .join("");
  const col = v.colls.length
    ? sec("violet", "გამოთქმები", v.colls.map((c) => `<p class="coll"><b>${esc(c.text)}</b> ${esc(c.ka)}</p>`).join(""))
    : "";
  return ex + col;
}

export function bodyForms(v) {
  const fam = v.family.length
    ? sec(
        "",
        "სიტყვათა ოჯახი",
        v.family
          .map((f) => `<div class="fam"><b>${esc(f.term)}</b><i>${esc(f.pos)}</i><span>${esc(f.translation)}</span></div>`)
          .join("")
      )
    : "";
  const ants = v.ants.length
    ? sec(
        "rose",
        "საპირისპირო",
        v.ants.map((a) => `<div class="fam"><b class="red">${esc(a.term)}</b><span>${esc(a.translation)}</span></div>`).join("")
      )
    : "";
  const et = v.etym ? sec("violet", "ეტიმოლოგია", `<p>${esc(v.etym)}</p>`) : "";
  return fam + ants + et;
}

export function bodyNotes(v) {
  const gr = v.grammar ? sec("blue", "გრამატიკა", `<p>${esc(v.grammar)}</p>`) : "";
  const mis = v.mistakes.length
    ? sec(
        "",
        "გავრცელებული შეცდომა",
        v.mistakes
          .map(
            (m) =>
              `<p class="wrong">${esc(m.wrong)}</p><p class="right">${esc(m.correct)}</p><p class="muted">${esc(m.reason)}</p>`
          )
          .join("")
      )
    : "";
  const bl = v.blank
    ? sec("yellow", "შეავსე გამოტოვებული", `<p class="sent">${esc(v.blank.prompt)}</p><p class="muted">${esc(v.blank.hint || "")}</p>`)
    : "";
  return gr + mis + bl;
}

export const TABS = [
  { id: "meaning", label: "მნიშვნელობა", body: bodyMeaning },
  { id: "examples", label: "მაგალითები", body: bodyExamples },
  { id: "forms", label: "ფორმები", body: bodyForms },
  { id: "notes", label: "შენიშვნა", body: bodyNotes },
];
