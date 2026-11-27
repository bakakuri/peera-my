import * as db from "./db.js";
import { bucketOf, schedule, isDue } from "./srs.js";
import { dayKey, lsGet, lsSet } from "./util.js";

export const LANGS = [
  { code: "de", name: "გერმანული", tts: "de-DE", img: "assets/berlin.webp", bg: "linear-gradient(180deg,#1A1F5E 0%,#6A3B7A 55%,#E58A3C 100%)", flag: "de" },
  { code: "en", name: "ინგლისური", tts: "en-US", img: "assets/bigben.webp", bg: "linear-gradient(180deg,#0E1238 0%,#2B3590 100%)", flag: "gb" },
  { code: "es", name: "ესპანური", tts: "es-ES", img: "assets/sagrada.webp", bg: "linear-gradient(180deg,#7A2C5E 0%,#E5603F 60%,#FFB347 100%)", flag: "es" },
];

const defaultStats = () => ({
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  reviewsTotal: 0,
  reviewsCorrect: 0,
  lessons: 0,
  activity: {},
});

export const langOf = (word) => String(word.language?.code || "").slice(0, 2).toLowerCase();

export const state = {
  words: [],
  lessons: [],
  lang: "de",
  cards: new Map(),
  stats: defaultStats(),

  async load() {
    const [words, lessons, progress] = await Promise.all([db.loadWords(), db.loadLessons(), db.loadProgress()]);
    this.words = words;
    this.lessons = lessons;
    this.cards = new Map(progress.cards.map((c) => [c.wordId, c]));
    this.stats = { ...defaultStats(), ...(progress.stats || {}) };
    const saved = lsGet("peera:lang", this.lang);
    this.lang = this.wordsOf(saved).length ? saved : this.firstLangWithWords();
  },

  firstLangWithWords() {
    return LANGS.find((l) => this.wordsOf(l.code).length)?.code || "en";
  },

  setLang(code) {
    this.lang = code;
    lsSet("peera:lang", code);
  },

  langInfo(code = this.lang) {
    return LANGS.find((l) => l.code === code) || LANGS[0];
  },

  wordsOf(code = this.lang) {
    return this.words.filter((w) => langOf(w) === code);
  },

  bucketOfWord(id) {
    return bucketOf(this.cards.get(id));
  },

  learnedOf(code = this.lang) {
    return this.wordsOf(code).filter((w) => (this.cards.get(w.id)?.reps || 0) >= 1).length;
  },

  // დღევანდელი რიგი: ჯერ დაგვიანებული გამეორებები, მერე ახალი სიტყვები
  queue(code = this.lang, newLimit = 10) {
    const now = new Date();
    const list = this.wordsOf(code);
    const due = list
      .filter((w) => this.cards.has(w.id) && isDue(this.cards.get(w.id), now))
      .sort((a, b) => new Date(this.cards.get(a.id).dueAt) - new Date(this.cards.get(b.id).dueAt));
    const fresh = list.filter((w) => !this.cards.has(w.id)).slice(0, newLimit);
    return [...due, ...fresh];
  },

  bump({ reviews = 0, correct = 0, xp = 0, lessons = 0 }) {
    const s = this.stats;
    const today = dayKey();
    if (s.lastActive !== today) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      s.streak = s.lastActive === dayKey(y) ? s.streak + 1 : 1;
      s.bestStreak = Math.max(s.bestStreak || 0, s.streak);
      s.lastActive = today;
    }
    s.reviewsTotal += reviews;
    s.reviewsCorrect += correct;
    s.xp += xp;
    s.lessons += lessons;
    const day = s.activity[today] || { reviews: 0, xp: 0 };
    day.reviews += reviews;
    day.xp += xp;
    s.activity[today] = day;
  },

  async review(word, grade) {
    const card = schedule(this.cards.get(word.id) || { wordId: word.id }, grade);
    this.cards.set(word.id, card);
    const xp = grade >= 2 ? word.mediaAndSystem?.srsMetadata?.xpValue || 10 : 0;
    this.bump({ reviews: 1, correct: grade >= 1 ? 1 : 0, xp });
    await Promise.all([db.saveCard(card), db.saveStats(this.stats)]);
    return xp;
  },

  async completeLesson(xp = 30) {
    this.bump({ xp, lessons: 1 });
    await db.saveStats(this.stats);
    return xp;
  },

  retention() {
    const s = this.stats;
    return s.reviewsTotal ? Math.round((s.reviewsCorrect / s.reviewsTotal) * 100) : 0;
  },

  week() {
    const names = ["კვ", "ორ", "სა", "ოთ", "ხუ", "პა", "შა"];
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ label: names[d.getDay()], value: this.stats.activity[dayKey(d)]?.reviews || 0, today: i === 0 });
    }
    return out;
  },

  achievements() {
    const s = this.stats;
    const learned = this.words.filter((w) => (this.cards.get(w.id)?.reps || 0) >= 1).length;
    return [
      { id: "first", icon: "🌱", title: "პირველი ნაბიჯი", hint: "1 გამეორება", done: s.reviewsTotal >= 1 },
      { id: "words3", icon: "📚", title: "3 სიტყვა", hint: "ისწავლე 3 სიტყვა", done: learned >= 3 },
      { id: "streak3", icon: "🔥", title: "3 დღე ზედიზედ", hint: "სერია 3 დღე", done: s.bestStreak >= 3 },
      { id: "xp100", icon: "⭐", title: "100 XP", hint: "დააგროვე 100 XP", done: s.xp >= 100 },
      { id: "rev25", icon: "🎯", title: "25 გამეორება", hint: "25 გამეორება სულ", done: s.reviewsTotal >= 25 },
      { id: "lesson", icon: "🎧", title: "პირველი გაკვეთილი", hint: "დაასრულე გაკვეთილი", done: s.lessons >= 1 },
    ];
  },
};
