import * as db from "./db.js";
import { bucketOf, schedule, isDue } from "./srs.js";
import { dayKey, lsGet, lsSet } from "./util.js";

export const LANGS = [
  { code: "de", name: "გერმანული", tts: "de-DE", img: "assets/berlin.png", bg: "linear-gradient(180deg,#1A1F5E 0%,#6A3B7A 55%,#E58A3C 100%)", flag: "de" },
  { code: "en", name: "ინგლისური", tts: "en-US", img: "assets/bigben.png", bg: "linear-gradient(180deg,#0E1238 0%,#2B3590 100%)", flag: "gb" },
  { code: "es", name: "ესპანური", tts: "es-ES", img: "assets/sagrada.png", bg: "linear-gradient(180deg,#7A2C5E 0%,#E5603F 60%,#FFB347 100%)", flag: "es" },
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
    const before = this.todayXp();
    s.reviewsTotal += reviews;
    s.reviewsCorrect += correct;
    s.xp += xp;
    s.lessons += lessons;
    const day = s.activity[today] || { reviews: 0, xp: 0 };
    day.reviews += reviews;
    day.xp += xp;
    s.activity[today] = day;
    if (before < this.goal() && this.todayXp() >= this.goal()) this.goalHit = true;
  },

  // ---------- ყოველდღიური მიზანი ----------
  goalHit: false,
  goal() {
    return Number(this.stats.activity._goal) || 50;
  },
  todayXp() {
    return this.stats.activity[dayKey()]?.xp || 0;
  },
  consumeGoalHit() {
    const v = this.goalHit;
    this.goalHit = false;
    return v;
  },
  async setGoal(n) {
    this.stats.activity._goal = n;
    await db.saveStats(this.stats);
  },
  // ბოლო 7 დღე (ორშაბათიდან კვირამდე მიმდინარე კვირა)
  weekDays() {
    const names = ["ორ", "სა", "ოთ", "ხუ", "პა", "შა", "კვ"];
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const todayK = dayKey();
    return names.map((label, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      const key = dayKey(d);
      const xp = this.stats.activity[key]?.xp || 0;
      return { label, key, xp, hit: xp >= this.goal(), today: key === todayK, future: key > todayK };
    });
  },

  async review(word, grade) {
    const card = schedule(this.cards.get(word.id) || { wordId: word.id }, grade);
    this.cards.set(word.id, card);
    const xp = grade >= 2 ? word.mediaAndSystem?.srsMetadata?.xpValue || 10 : 0;
    this.bump({ reviews: 1, correct: grade >= 1 ? 1 : 0, xp });
    await Promise.all([db.saveCard(card), db.saveStats(this.stats)]);
    return xp;
  },

  // ---------- გაკვეთილები ----------
  lessonsFor(code = this.lang) {
    return this.lessons
      .filter((l) => l.lang === code)
      .sort((a, b) => (a.level === b.level ? a.number - b.number : a.level < b.level ? -1 : 1));
  },
  lessonResults() {
    return this.stats.activity._lessons || {};
  },
  lessonDone(id) {
    return !!this.lessonResults()[id];
  },
  nextLesson(code = this.lang) {
    return this.lessonsFor(code).find((l) => !this.lessonDone(l.id)) || null;
  },
  async finishLesson(lesson, correct, total) {
    const results = { ...this.lessonResults() };
    const prev = results[lesson.id];
    const xp = correct * 5 + 20;
    results[lesson.id] = { best: Math.max(prev?.best || 0, correct), total, at: new Date().toISOString() };
    this.stats.activity._lessons = results;
    this.bump({ xp, lessons: prev ? 0 : 1 });
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

  // ---------- რჩეულები ----------
  isFav(id) {
    return !!this.stats.activity._fav?.[id];
  },
  async toggleFav(id) {
    const f = { ...(this.stats.activity._fav || {}) };
    if (f[id]) delete f[id];
    else f[id] = 1;
    this.stats.activity._fav = f;
    await db.saveStats(this.stats);
    return !!f[id];
  },

  // ყველა მიღწევა პროგრესით (cur / goal)
  allAchievements() {
    const s = this.stats;
    const learned = this.words.filter((w) => (this.cards.get(w.id)?.reps || 0) >= 1).length;
    const res = Object.values(this.lessonResults());
    const perfect = res.filter((r) => r.total && r.best >= r.total).length;
    const goal = this.goal();
    const goalDays = Object.entries(s.activity).filter(([k, v]) => /^\d{4}-/.test(k) && v?.xp >= goal).length;
    const A = (group, id, icon, title, hint, cur, g) => ({ group, id, icon, title, hint, cur: Math.min(cur, g), goal: g, done: cur >= g });
    return [
      A("სიტყვები", "w3", "📚", "3 სიტყვა", "ისწავლე 3 სიტყვა", learned, 3),
      A("სიტყვები", "w10", "📖", "10 სიტყვა", "ისწავლე 10 სიტყვა", learned, 10),
      A("სიტყვები", "w50", "🎓", "50 სიტყვა", "ისწავლე 50 სიტყვა", learned, 50),
      A("სიტყვები", "w100", "🏫", "100 სიტყვა", "ისწავლე 100 სიტყვა", learned, 100),
      A("სიტყვები", "w200", "🧠", "200 სიტყვა", "ისწავლე 200 სიტყვა", learned, 200),
      A("გამეორებები", "r1", "🌱", "პირველი ნაბიჯი", "1 გამეორება", s.reviewsTotal, 1),
      A("გამეორებები", "r25", "🎯", "25 გამეორება", "25 გამეორება სულ", s.reviewsTotal, 25),
      A("გამეორებები", "r100", "💪", "100 გამეორება", "100 გამეორება სულ", s.reviewsTotal, 100),
      A("გამეორებები", "r500", "🚀", "500 გამეორება", "500 გამეორება სულ", s.reviewsTotal, 500),
      A("სერია", "s3", "🔥", "3 დღე ზედიზედ", "სერია 3 დღე", s.bestStreak || 0, 3),
      A("სერია", "s7", "⚡", "კვირა ცეცხლზე", "სერია 7 დღე", s.bestStreak || 0, 7),
      A("სერია", "s30", "🏆", "თვე ცეცხლზე", "სერია 30 დღე", s.bestStreak || 0, 30),
      A("სერია", "g1", "✅", "დღის მიზანი", "შეასრულე დღიური მიზანი", goalDays, 1),
      A("სერია", "g7", "🗓️", "7 მიზანი", "შეასრულე დღიური მიზანი 7 დღე", goalDays, 7),
      A("XP", "x100", "⭐", "100 XP", "დააგროვე 100 XP", s.xp, 100),
      A("XP", "x500", "🌟", "500 XP", "დააგროვე 500 XP", s.xp, 500),
      A("XP", "x1000", "💎", "1000 XP", "დააგროვე 1000 XP", s.xp, 1000),
      A("XP", "x5000", "👑", "5000 XP", "დააგროვე 5000 XP", s.xp, 5000),
      A("გაკვეთილები", "l1", "🎧", "პირველი გაკვეთილი", "დაასრულე გაკვეთილი", s.lessons, 1),
      A("გაკვეთილები", "l5", "🗺️", "5 გაკვეთილი", "დაასრულე 5 გაკვეთილი", s.lessons, 5),
      A("გაკვეთილები", "lp", "💯", "იდეალური", "გაკვეთილი 100%-ით", perfect, 1),
    ];
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
