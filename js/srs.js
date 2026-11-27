// გამეორების ინტერვალები (SM-2-ის გამარტივებული ვარიანტი)
// grade: 0 = ისევ, 1 = რთული, 2 = კარგი, 3 = ადვილი

export const GRADES = { again: 0, hard: 1, good: 2, easy: 3 };
const DAY = 86400000;

export function schedule(card, grade, now = new Date()) {
  let { intervalDays = 0, ease = 2.5, reps = 0, lapses = 0 } = card || {};
  let minutes = 0;

  if (grade === 0) {
    lapses += 1;
    reps = 0;
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
    minutes = 1;
  } else {
    if (reps === 0) {
      intervalDays = [0, 1, 3, 7][grade];
    } else {
      const mult = grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3;
      intervalDays = Math.max(1, Math.round(intervalDays * mult));
      if (grade === 1) ease = Math.max(1.3, ease - 0.15);
      if (grade === 3) ease += 0.15;
    }
    reps += 1;
  }

  const due = new Date(now.getTime() + (minutes ? minutes * 60000 : intervalDays * DAY));
  return {
    ...(card || {}),
    intervalDays,
    ease: Math.round(ease * 100) / 100,
    reps,
    lapses,
    dueAt: due.toISOString(),
    updatedAt: now.toISOString(),
    lastGrade: grade,
  };
}

export function label(card, grade, now = new Date()) {
  if (grade === 0) return "1 წთ";
  const next = schedule(card, grade, now);
  const d = next.intervalDays;
  if (d >= 30) return Math.round(d / 30) + " თვე";
  return d + " დღე";
}

export function labels(card) {
  return {
    again: label(card, 0),
    hard: label(card, 1),
    good: label(card, 2),
    easy: label(card, 3),
  };
}

export const isDue = (card, now = new Date()) => !!card && new Date(card.dueAt) <= now;

// ლექსიკონის განყოფილება ბოლო შეფასებით: ადვილი → ნასწავლი, კარგი → გასამეორებელი,
// რთული → სასწავლი, ისევ → საზეპირო
export const BUCKETS = [
  { id: "learned", grade: 3, title: "ნასწავლი", btn: "ადვილი", color: "#22c55e" },
  { id: "review", grade: 2, title: "გასამეორებელი", btn: "კარგი", color: "#4f6bff" },
  { id: "study", grade: 1, title: "სასწავლი", btn: "რთული", color: "#ff9a3d" },
  { id: "memorize", grade: 0, title: "საზეპირო", btn: "ისევ", color: "#ff5a7a" },
];

export function bucketOf(card) {
  if (!card) return null;
  let g = card.lastGrade;
  if (g == null) {
    // ძველი ჩანაწერი, სადაც ბოლო შეფასება არ ინახებოდა
    g = !card.reps ? 0 : card.intervalDays <= 1 ? 1 : card.intervalDays <= 3 ? 2 : 3;
  }
  return BUCKETS.find((b) => b.grade === g)?.id || null;
}
