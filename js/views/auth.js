import * as db from "../db.js";
import { header, icon } from "../ui.js";
import { esc } from "../util.js";

let mode = "in";

function form() {
  const signup = mode === "up";
  return `
  <form id="auth-form" class="auth-form" novalidate>
    <label>ელფოსტა
      <input type="email" name="email" autocomplete="email" inputmode="email" required placeholder="name@example.com">
    </label>
    <label>პაროლი
      <input type="password" name="password" autocomplete="${signup ? "new-password" : "current-password"}" minlength="6" required placeholder="მინიმუმ 6 სიმბოლო">
    </label>
    <p class="form-msg" id="auth-msg" role="alert"></p>
    <button class="cta cta-primary" type="submit">${signup ? "რეგისტრაცია" : "შესვლა"} ${icon.arrow}</button>
    <button class="link center-link" type="button" data-act="switch">${signup ? "უკვე გაქვს ანგარიში? შესვლა" : "ახალი ხარ? რეგისტრაცია"}</button>
  </form>`;
}

export default {
  render() {
    const user = db.getUser();
    let body;
    if (!db.configured() || !db.isCloud()) {
      body = `<p class="muted pad-x">Supabase ჯერ მიერთებული არ არის. ჩაწერე URL და anon key ფაილში <b>js/config.js</b> — მერე აქ რეგისტრაცია ჩაირთვება.</p>`;
    } else if (user) {
      body = `<p class="pad-x">შესული ხარ: <b>${esc(user.email || "")}</b></p><div class="pad-x"><a class="cta cta-primary" href="#/progress">პროგრესზე გადასვლა ${icon.arrow}</a></div>`;
    } else {
      body = form();
    }
    return `
    <section class="hero hero-sm"><div class="deco hd1"></div>${header()}
      <div class="hero-title"><h1 class="rise">ანგარიში</h1></div>
    </section>
    <section class="card auth-card rise">${body}</section>`;
  },

  mount(root) {
    const formEl = root.querySelector("#auth-form");
    if (!formEl) return null;
    const msg = root.querySelector("#auth-msg");

    const onSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
      msg.className = "form-msg";
      if (!email || password.length < 6) {
        msg.textContent = "შეიყვანე ელფოსტა და პაროლი (მინიმუმ 6 სიმბოლო).";
        return;
      }
      msg.textContent = "მიმდინარეობს…";
      try {
        if (mode === "up") {
          const res = await db.signUp(email, password);
          if (!res.session) {
            msg.className = "form-msg ok";
            msg.textContent = "რეგისტრაცია დასრულდა. შეამოწმე ელფოსტა დასადასტურებლად.";
            return;
          }
        } else {
          await db.signIn(email, password);
        }
        location.hash = "#/progress";
      } catch (err) {
        msg.textContent = err.message || "შეცდომა";
      }
    };
    const onClick = (e) => {
      if (e.target.closest('[data-act="switch"]')) {
        mode = mode === "in" ? "up" : "in";
        window.dispatchEvent(new Event("hashchange"));
      }
    };
    formEl.addEventListener("submit", onSubmit);
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  },
};
