import { state, LANGS } from "../state.js";
import { header, flag, icon } from "../ui.js";
import { esc, toast } from "../util.js";

const FEATURES = [
  { icon: "v3-icons/cap", label: "სასწავლო", href: "#/lesson", tone: "mint" },
  { icon: "v3-icons/bubbles", label: "სიტყვების სწავლა", href: "#/cards", tone: "lime" },
  { icon: "v3-icons/book", label: "გრამატიკა", soon: true, tone: "honey" },
  { icon: "v3-icons/headphones", label: "მოსმენა და გამოთქმა", href: "#/lesson", tone: "violet" },
  { icon: "v3-icons/calendar", label: "სასწავლო გეგმა", soon: true, tone: "pink" },
  { icon: "v3-icons/gamepad", label: "თამაშები და ტესტები", soon: true, tone: "aqua" }
];

function courseCard(lang) {
  const words = state.wordsOf(lang.code).length;
  const learned = state.learnedOf(lang.code);
  const pct = words ? Math.round(100 * learned / words) : 0;
  const active = lang.code === state.lang;
  const short = lang.code === "de" ? "გერმანული ენა" : lang.code === "en" ? "ინგლისური ენა" : "ესპანური ენა";
  return `<button class="v3-course v3-course-${lang.code}${active ? " selected" : ""}" ${words ? `data-lang="${lang.code}"` : "data-soon"} aria-pressed="${active}">
    <span class="v3-course-sky"></span><img class="v3-course-landmark" src="${lang.img}" alt="">
    <span class="v3-course-top">${flag(lang.flag)}<b>${esc(short)}</b></span>
    <span class="v3-course-bottom"><small>${words ? `${words.toLocaleString("en-US")} სიტყვა` : "მალე"}</small><strong>${pct}%</strong></span>
    <span class="v3-course-progress"><i style="width:${pct}%"></i></span>
    <span class="v3-course-arrow">›</span>
  </button>`;
}

function featureCard(feature) {
  const content = `<img src="assets/${feature.icon}.png" alt=""><b>${feature.label}</b><span aria-hidden="true">›</span>`;
  return feature.soon
    ? `<button class="v3-feature ${feature.tone}" data-soon aria-label="${feature.label}">${content}</button>`
    : `<a class="v3-feature ${feature.tone}" href="${feature.href}">${content}</a>`;
}

function days() {
  return state.weekDays().map(day => `<span class="v3-week-day${day.hit ? " hit" : ""}${day.today ? " today" : ""}"><i>${day.hit ? "✓" : ""}</i><small>${day.label}</small></span>`).join("");
}

export default {
  render() {
    const s = state.stats;
    const learned = state.learnedOf();
    const due = state.queue().length;
    const goal = state.goal();
    const today = state.todayXp();
    const percent = Math.min(100, Math.round(100 * today / goal));
    const course = state.nextLesson();
    const nextHref = course ? `#/lesson/${encodeURIComponent(course.id)}` : "#/lesson";
    const achieved = state.allAchievements().filter(x => x.done).length;
    return `<div class="v3-home">
      <section class="v3-top">${header()}</section>
      <div class="v3-content">
        <section class="v3-hero-card">
          <img class="v3-hero-city v3-city-left" src="assets/berlin.png" alt="">
          <img class="v3-hero-city v3-city-right" src="assets/bigben.png" alt="">
          <img class="v3-hero-student" src="assets/girl-dict.png" alt="მოსწავლე ყვითელ ჰუდიში">
          <div class="v3-hero-message"><h1>განაგრძე სწავლა,<br><em>Peera.My-თან!</em></h1>
            <p>ისწავლე ენები მარტივად, საინტერესოდ და შედეგიანად!</p>
            <a class="v3-green-button" href="${nextHref}"><img src="assets/icons/play.png" alt=""> სწავლის გაგრძელება <span>›</span></a>
          </div>
        </section>
        <section class="v3-section">
          <div class="v3-section-heading"><h2><img src="assets/icons/lessons-3d.png" alt=""> ჩემი კურსები</h2><a href="#/lesson">ყველა კურსი ›</a></div>
          <div class="v3-courses">${LANGS.filter(l => state.wordsOf(l.code).length).map(courseCard).join("")}</div>
        </section>
        <div class="v3-stats-strip">
          <a href="#/progress"><img src="assets/icons/star.png" alt=""><span><b>${s.xp.toLocaleString("en-US")} XP</b><small>გამოცდილება</small></span></a>
          <a href="#/dictionary"><img src="assets/icons/dictionary-3d.png" alt=""><span><b>${learned.toLocaleString("en-US")}</b><small>ნასწავლი სიტყვა</small></span></a>
          <a href="#/cards"><img src="assets/icons/awards-3d.png" alt=""><span><b>${today} / ${goal}</b><small>დღიური მიზანი</small></span></a>
        </div>
        <section class="v3-section v3-quick-section"><div class="v3-section-heading"><h2><img src="assets/icons/flame.png" alt=""> სწრაფი წვდომა</h2></div>
          <div class="v3-feature-grid">${FEATURES.map(featureCard).join("")}</div>
        </section>
        <a href="#/awards" class="v3-achievement-banner"><img src="assets/icons/awards-3d.png" alt=""><span><b>მიღწევები</b><small>მოიპოვე მედლები და ჯილდოები! უკვე გახსნილია ${achieved}.</small></span><i>›</i></a>
        <section class="v3-goal-panel"><div class="v3-goal-top"><img src="assets/icons/calendar.png" alt=""><div><h3>${percent === 100 ? "დღის მიზანი შესრულებულია!" : "დღევანდელი მიზანი"}</h3><p>${today} / ${goal} XP · ${due} სიტყვა გელოდება</p></div><button data-goal aria-label="დღიური მიზნის შეცვლა">შეცვლა</button></div>
          <div class="v3-goal-track"><i style="width:${percent}%"></i></div><div class="v3-week">${days()}</div>
        </section>
      </div>
    </div>`;
  },
  mount(root) {
    const onClick = async e => {
      if (e.target.closest("[data-goal]")) {
        const options = [30,50,100,150];
        const goal = options[(options.indexOf(state.goal()) + 1) % options.length];
        await state.setGoal(goal); window.dispatchEvent(new Event("hashchange"));
        toast(`დღიური მიზანი: ${goal} XP`);
      }
      const lang = e.target.closest("[data-lang]");
      if (lang) { state.setLang(lang.dataset.lang); window.dispatchEvent(new Event("hashchange")); }
      if (e.target.closest("[data-soon]")) toast("ეს განყოფილება მალე დაემატება");
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }
};
