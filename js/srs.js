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
