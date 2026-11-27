import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import { lsGet, lsSet } from "./util.js";

const KEYS = { cards: "peera:cards:v1", stats: "peera:stats:v1" };
const SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";

let sb = null;
let user = null;
let noGradeCol = false;

export const isCloud = () => !!sb;
export const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const getUser = () => user;

function loadSdk() {
  if (window.supabase) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Supabase SDK ვერ ჩაიტვირთა"));
    document.head.appendChild(s);
  });
}

export async function init() {
  if (!configured()) return;
  try {
    await loadSdk();
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await sb.auth.getSession();
    user = data.session?.user || null;
    sb.auth.onAuthStateChange((_event, session) => {
      const next = session?.user || null;
      if ((next?.id || null) !== (user?.id || null)) {
        user = next;
        window.dispatchEvent(new Event("peera:auth"));
      }
    });
  } catch (err) {
    console.warn("Supabase გამორთულია:", err);
    sb = null;
  }
}

/* ---------- ავტორიზაცია ---------- */
export async function signUp(email, password) {
  if (!sb) throw new Error("Supabase არ არის მიერთებული");
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
export async function signIn(email, password) {
  if (!sb) throw new Error("Supabase არ არის მიერთებული");
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
export async function signOut() {
  if (sb) await sb.auth.signOut();
}

/* ---------- სიტყვები ---------- */
export async function loadWords() {
  if (sb) {
    const { data, error } = await sb
      .from("words")
      .select("id,data")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (!error && data && data.length) return data.map((r) => ({ ...r.data, id: r.id }));
    if (error) console.warn("words:", error.message);
  }
  const res = await fetch("data/words.json");
  return res.json();
}

export async function loadLessons() {
  if (sb) {
    const { data, error } = await sb.from("lessons").select("id,data").order("position", { ascending: true });
    if (!error && data && data.length) return data.map((r) => ({ ...r.data, id: r.id }));
  }
  try {
    const res = await fetch("data/lessons.json");
    return await res.json();
  } catch {
    return [];
  }
}

/* ---------- პროგრესი ---------- */
const cardFromRow = (r) => ({
  wordId: r.word_id,
  intervalDays: r.interval_days,
  ease: Number(r.ease),
  reps: r.reps,
  lapses: r.lapses,
  dueAt: r.due_at,
  updatedAt: r.updated_at,
  lastGrade: r.last_grade ?? undefined,
});
const cardToRow = (c, uid) => ({
  user_id: uid,
  word_id: c.wordId,
  interval_days: c.intervalDays,
  ease: c.ease,
  reps: c.reps,
  lapses: c.lapses,
  due_at: c.dueAt,
  updated_at: c.updatedAt,
  last_grade: c.lastGrade ?? null,
});
const statsFromRow = (r) => ({
  xp: r.xp,
  streak: r.streak,
  bestStreak: r.best_streak,
  lastActive: r.last_active,
  reviewsTotal: r.reviews_total,
  reviewsCorrect: r.reviews_correct,
  lessons: r.lessons,
  activity: r.activity || {},
});
const statsToRow = (s, uid) => ({
  user_id: uid,
  xp: s.xp,
  streak: s.streak,
  best_streak: s.bestStreak,
  last_active: s.lastActive,
  reviews_total: s.reviewsTotal,
  reviews_correct: s.reviewsCorrect,
  lessons: s.lessons,
  activity: s.activity,
  updated_at: new Date().toISOString(),
});

export async function loadProgress() {
  if (sb && user) {
    const [cards, stats] = await Promise.all([
      sb.from("user_cards").select("*").eq("user_id", user.id),
      sb.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    return {
      cards: (cards.data || []).map(cardFromRow),
      stats: stats.data ? statsFromRow(stats.data) : null,
    };
  }
  return { cards: Object.values(lsGet(KEYS.cards, {})), stats: lsGet(KEYS.stats, null) };
}

export async function saveCard(card) {
  if (sb && user) {
    const row = cardToRow(card, user.id);
    if (noGradeCol) delete row.last_grade;
    let { error } = await sb.from("user_cards").upsert(row, { onConflict: "user_id,word_id" });
    if (error && /last_grade/.test(error.message)) {
      // ბაზაში ახალი სვეტი ჯერ არ არის (dictionary.sql არ გაშვებულა): ვინახავთ მის გარეშე
      noGradeCol = true;
      delete row.last_grade;
      ({ error } = await sb.from("user_cards").upsert(row, { onConflict: "user_id,word_id" }));
    }
    if (error) console.warn("saveCard:", error.message);
    return;
  }
  const all = lsGet(KEYS.cards, {});
  all[card.wordId] = card;
  lsSet(KEYS.cards, all);
}

export async function saveStats(stats) {
  if (sb && user) {
    const { error } = await sb.from("user_stats").upsert(statsToRow(stats, user.id), { onConflict: "user_id" });
    if (error) console.warn("saveStats:", error.message);
    return;
  }
  lsSet(KEYS.stats, stats);
}

/* ---------- ადმინი ---------- */
export async function isAdmin() {
  if (!sb || !user) return false;
  const { data, error } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return !error && !!data;
}

export async function wordCounts(codes = ["de", "en", "es"]) {
  const out = {};
  for (const code of codes) {
    const { count, error } = await sb.from("words").select("id", { count: "exact", head: true }).eq("language_code", code);
    if (error) throw error;
    out[code] = count || 0;
  }
  return out;
}

export async function upsertWords(rows, onProgress, size = 25) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await sb.from("words").upsert(chunk, { onConflict: "id" });
    if (error) throw error;
    onProgress?.(Math.min(i + size, rows.length), rows.length);
  }
}

export async function clearLanguage(code) {
  const { error, count } = await sb.from("words").delete({ count: "exact" }).eq("language_code", code);
  if (error) throw error;
  return count || 0;
}

export async function lessonCounts(codes = ["de", "en", "es"]) {
  const out = {};
  for (const code of codes) {
    const { count, error } = await sb.from("lessons").select("id", { count: "exact", head: true }).eq("language_code", code);
    if (error) throw error;
    out[code] = count || 0;
  }
  return out;
}

export async function upsertLessons(rows) {
  const { error } = await sb.from("lessons").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

export async function clearLessons(code) {
  const { error, count } = await sb.from("lessons").delete({ count: "exact" }).eq("language_code", code);
  if (error) throw error;
  return count || 0;
}
