import { state } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, highlight, speak, toast } from "../util.js";

let playing = false;
let timer = null;

function current() {
  const list = state.lessons.filter((l) => l.lang === state.lang);
  return list[0] || null;
}

export default {
  render() {
    const l = current();
    const lang = state.langInfo();
    if (!l) {
      return `
      <section class="hero hero-sm">${header()}<div class="deco hd1"></div></section>
      <div class="finish rise">
        <img src="assets/girl-cheer.webp" alt="" width="170" height="233">
        <h2>${esc(lang.name)} გაკვეთილები მალე</h2>
        <p>ამ ენაზე გაკვეთილები ჯერ არ არის. ჯერჯერობით სცადე ბარათები.</p>
        <a class="cta" href="#/cards">ბარათებზე გადასვლა ${icon.arrow}</a>
      </div>`;
    }
    const lines = l.lines
      .map(
        (ln, i) => `
      <div class="bubble-row ${i % 2 ? "me" : "them"} rise" style="animation-delay:${0.25 + i * 0.12}s" data-line="${i}">
        ${i % 2 ? "" : `<span class="avatar mint">${esc(ln.who)}</span>`}
        <div class="bubble">
          <p>${highlight(ln.text, ln.highlight)}</p>
          <small>${esc(ln.ka)}</small>
        </div>
        ${i % 2 ? `<span class="avatar coral">${esc(ln.who)}</span>` : ""}
      </div>`
      )
      .join("");
    const words = l.words.map((w) => `<div class="word-chip"><b>${esc(w.text)}</b><span>${esc(w.ka)}</span></div>`).join("");
    return `
    <section class="hero hero-sm">
      <div class="deco hd1"></div><div class="deco hd2"></div>
      ${header()}
      <div class="hero-title">
        <span class="pill yellow rise">გაკვეთილი ${l.number} · ${esc(l.level)}</span>
        <h1 class="rise" style="animation-delay:.1s">${esc(l.title)}</h1>
      </div>
    </section>

    <section class="card player rise" style="animation-delay:.2s">
      <button class="play" data-act="play" aria-label="დაკვრა">${icon.play}</button>
      <div class="eq" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="height:${[12, 22, 28, 16, 26, 12, 24, 18, 28, 14, 22, 10, 20, 26, 14, 22][i]}px;animation-delay:${(i * 0.09).toFixed(2)}s"></i>`).join("")}</div>
      <span class="pill soft" id="play-state">მოუსმინე</span>
    </section>

    <section class="chat" id="chat">${lines}</section>

    <section class="words-box rise" style="animation-delay:.6s">
      <h4>საკვანძო სიტყვები</h4>
      <div class="word-chips">${words}</div>
    </section>

    <div class="pad-x">
      <button class="cta cta-primary" data-act="done">გაგრძელება ${icon.arrow}</button>
    </div>`;
  },

  mount(root) {
    const l = current();
    if (!l) return null;
    const lines = [...root.querySelectorAll("[data-line]")];

    function stop() {
      playing = false;
      clearTimeout(timer);
      try { window.speechSynthesis?.cancel(); } catch {}
      root.querySelector(".player")?.classList.remove("playing");
      lines.forEach((el) => el.classList.remove("speaking"));
      const st = root.querySelector("#play-state");
      if (st) st.textContent = "მოუსმინე";
    }

    function playFrom(i) {
      if (!playing || i >= l.lines.length) return stop();
      lines.forEach((el, k) => el.classList.toggle("speaking", k === i));
      const ok = speak(l.lines[i].text, l.ttsLang, 0.9);
      if (!ok) {
        toast("ხმის გამოსაცემად ბრაუზერი ვერ იყენებს TTS-ს");
        return stop();
      }
      const u = window.speechSynthesis;
      const check = () => {
        if (!playing) return;
        if (u.speaking || u.pending) timer = setTimeout(check, 200);
        else timer = setTimeout(() => playFrom(i + 1), 350);
      };
      timer = setTimeout(check, 300);
    }

    const onClick = async (e) => {
      const t = e.target.closest("[data-act],[data-line]");
      if (!t) return;
      if (t.dataset.act === "play") {
        if (playing) return stop();
        playing = true;
        root.querySelector(".player").classList.add("playing");
        root.querySelector("#play-state").textContent = "ვუსმენთ…";
        playFrom(0);
      } else if (t.dataset.act === "done") {
        stop();
        const xp = await state.completeLesson(30);
        toast(`გაკვეთილი დასრულდა · +${xp} XP`);
        location.hash = "#/progress";
      } else if (t.dataset.line !== undefined) {
        stop();
        const ln = l.lines[Number(t.dataset.line)];
        speak(ln.text, l.ttsLang, 0.9);
      }
    };
    root.addEventListener("click", onClick);
    return () => {
      stop();
      root.removeEventListener("click", onClick);
    };
  },
};
