import * as db from "./db.js";
import { state } from "./state.js";
import { navHtml } from "./ui.js";
import home from "./views/home.js";
import cards from "./views/cards.js";
import lesson from "./views/lesson.js";
import lessonPlay from "./views/lessonPlay.js";
import progress from "./views/progress.js";
import auth from "./views/auth.js";
import admin from "./views/admin.js";
import dictionary from "./views/dictionary.js";
import awards from "./views/awards.js";

const routes = {
  "/": { view: home, nav: "home" },
  "/cards": { view: cards, nav: "cards" },
  "/lesson": { view: lesson, nav: "lesson" },
  "/lesson/:id": { view: lessonPlay, nav: "lesson" },
  "/progress": { view: progress, nav: "progress" },
  "/auth": { view: auth, nav: "progress" },
  "/admin": { view: admin, nav: "progress" },
  "/dictionary": { view: dictionary, nav: "dict" },
  "/awards": { view: awards, nav: "progress" },
};

const app = document.getElementById("app");
app.innerHTML = `
  <div class="bgimg" aria-hidden="true"></div>
  <main id="view" class="view"><div class="splash"><img src="assets/logo.webp" alt="Peera.My" width="180"></div></main>
  <nav id="nav" class="nav" aria-label="ძირითადი ნავიგაცია"></nav>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>`;

const viewEl = document.getElementById("view");
const navEl = document.getElementById("nav");
let ready = false;
let cleanup = null;

function go() {
  if (!ready) return;
  const path = (location.hash.slice(1) || "/").split("?")[0];
  const lm = path.match(/^\/lesson\/([^/]+)$/);
  const param = lm ? decodeURIComponent(lm[1]) : null;
  const route = (lm ? routes["/lesson/:id"] : routes[path]) || routes["/"];
  if (cleanup) {
    try { cleanup(); } catch {}
    cleanup = null;
  }
  viewEl.innerHTML = route.view.render(param);
  viewEl.className = "view";
  app.dataset.lang = state.lang;
  app.dataset.route = lm ? "lesson-play" : path in routes ? path.slice(1) || "home" : "home";
  navEl.innerHTML = navHtml(route.nav);
  cleanup = route.view.mount?.(viewEl, param) || null;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", go);
window.addEventListener("peera:auth", async () => {
  await state.load();
  go();
});

(async function boot() {
  try {
    await db.init();
    await state.load();
  } catch (err) {
    console.error(err);
    viewEl.innerHTML = `<div class="splash"><p>ჩატვირთვა ვერ მოხერხდა. განაახლე გვერდი.</p></div>`;
    return;
  }
  ready = true;
  go();
})();
