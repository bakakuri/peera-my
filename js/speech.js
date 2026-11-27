// წარმოთქმის შემოწმება: Web Speech API (Chrome/Android/Safari). Firefox-ში არ მუშაობს.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = () => !!SR;

let cur = null;
export function stopListening() {
  try { cur?.abort(); } catch {}
  cur = null;
}

export function listen(lang) {
  return new Promise((resolve, reject) => {
    if (!SR) return reject(new Error("unsupported"));
    stopListening();
    const r = new SR();
    cur = r;
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 3;
    let got = null;
    r.onresult = (e) => {
      got = [...e.results[0]].map((a) => a.transcript);
    };
    r.onerror = (e) => reject(new Error(e.error || "error"));
    r.onend = () => {
      cur = null;
      got ? resolve(got) : reject(new Error("no-speech"));
    };
    try { r.start(); } catch (err) { reject(err); }
  });
}

const norm = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();

function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

// საუკეთერესო ალტერნატივა → { pct, heard }
export function score(target, heards) {
  const t = norm(target);
  let best = { pct: 0, heard: heards[0] || "" };
  for (const h of heards) {
    const x = norm(h);
    const pct = Math.round((1 - lev(t, x) / Math.max(t.length, x.length, 1)) * 100);
    if (pct > best.pct) best = { pct, heard: h };
  }
  return best;
}
