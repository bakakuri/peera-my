import * as db from "../db.js";
import { state, LANGS } from "../state.js";
import { header, icon } from "../ui.js";
import { esc, toast } from "../util.js";

const options = { sound: true, motion: true, dark: false };
const switchHtml = (name, label, enabled) => `<button class="setting-switch ${enabled ? "on" : ""}" type="button" data-setting="${name}" aria-label="${label}" aria-pressed="${enabled}"><span></span></button>`;

export default {
  render() {
    const user = db.getUser();
    const name = user?.email?.split("@")[0] || "სტუმარი";
    const s = state.stats;
    const learned = state.learnedOf();
    const awards = state.achievements().filter(a => a.done).length;
    return `
      <section class="hero hero-sm profile-hero"><div class="deco hd1"></div>${header()}
        <div class="hero-title"><h1>ჩემი პროფილი</h1><p class="page-sub">სწავლის შენი პერსონალური სივრცე</p></div>
      </section>
      <section class="profile-wrap">
        <article class="profile-card">
          <div class="profile-person"><img class="profile-character" src="assets/girl-dict.png" alt="მოსწავლის 3D პერსონაჟი">
            <div class="profile-person-text"><span class="pill white">${user ? "მოსწავლე" : "დემო რეჟიმი"}</span>
              <h2>${esc(name)}</h2>
              <p>${user ? esc(user.email) : "შედი ანგარიშში პროგრესის სინქრონიზაციისთვის"}</p>
              ${user ? '<a class="profile-pill-link" href="#/auth">ანგარიშის ნახვა →</a>' : '<a class="profile-pill-link" href="#/auth">შესვლა / რეგისტრაცია →</a>'}
            </div>
          </div>
          <div class="profile-stats">
            <a href="#/progress"><img src="assets/icons/star.png" alt=""><b>${s.xp}</b><small>სულ XP</small></a>
            <a href="#/progress"><img src="assets/icons/flame.png" alt=""><b>${s.streak}</b><small>დღის სერია</small></a>
            <a href="#/dictionary"><img src="assets/icons/dictionary.png" alt=""><b>${learned}</b><small>ნასწავლი სიტყვა</small></a>
            <a href="#/awards"><img src="assets/icons/awards.png" alt=""><b>${awards}</b><small>მიღწევა</small></a>
          </div>
        </article>
        <div class="profile-sections">
          <section class="settings-panel">
            <h3><img src="assets/icons/lessons-3d.png" alt=""> სწავლა და ენა</h3>
            <div class="settings-row"><div><b>სასწავლო ენა</b><small>აირჩიე, რომელი ენის სწავლას აგრძელებ</small></div>
              <select id="profile-lang" aria-label="სასწავლო ენა">${LANGS.filter(l => state.wordsOf(l.code).length).map(l=>`<option value="${l.code}" ${l.code === state.lang ? "selected" : ""}>${esc(l.name)}</option>`).join("")}</select>
            </div>
            <a class="settings-row" href="#/lesson"><div><b>გაკვეთილების გზა</b><small>კურსების დონეები და გაკვეთილები</small></div><span class="setting-arrow">›</span></a>
            <a class="settings-row" href="#/dictionary"><div><b>ლექსიკონი</b><small>სიტყვები, ფონეტიკა და თარგმანები</small></div><span class="setting-arrow">›</span></a>
          </section>
          <section class="settings-panel">
            <h3><img src="assets/icons/settings.png" alt=""> ვიზუალი და ხმა</h3>
            <div class="settings-row"><div><b>მუქი თემა</b><small>მხოლოდ ამ სესიისთვის</small></div>${switchHtml("dark","მუქი თემა",options.dark)}</div>
            <div class="settings-row"><div><b>ანიმაციები</b><small>მოძრაობები და გარდასვლები</small></div>${switchHtml("motion","ანიმაციები",options.motion)}</div>
            <div class="settings-row"><div><b>სიტყვების მოსმენა</b><small>Web Speech ხმის ჩართვა ან გამორთვა</small></div>${switchHtml("sound","სიტყვების მოსმენა",options.sound)}</div>
          </section>
          <section class="settings-panel">
            <h3><img src="assets/icons/lock.png" alt=""> ანგარიში და მხარდაჭერა</h3>
            <a class="settings-row" href="#/progress"><div><b>პროგრესის სტატისტიკა</b><small>ქულები, სერია და გამეორებები</small></div><span class="setting-arrow">›</span></a>
            <a class="settings-row" href="#/awards"><div><b>მიღწევები და რეიტინგი</b><small>მიღებული მედლები და ადგილი რეიტინგში</small></div><span class="setting-arrow">›</span></a>
            <a class="settings-row" href="#/admin" id="profile-admin" hidden><div><b>ადმინ პანელი</b><small>სასწავლო მასალების მართვა</small></div><span class="setting-arrow">›</span></a>
          </section>
        </div>
        ${user ? '<button type="button" class="profile-logout" id="profile-signout">ანგარიშიდან გამოსვლა</button>' : '<a class="cta cta-primary profile-login" href="#/auth">შესვლა / რეგისტრაცია</a>'}
      </section>`;
  },
  mount(root) {
    const admin = root.querySelector("#profile-admin");
    if (admin) db.isAdmin().then(ok=>{if(ok && admin.isConnected)admin.hidden=false;}).catch(()=>{});
    const change = async e => {
      const sw=e.target.closest("[data-setting]");
      if(sw){
        const name=sw.dataset.setting;
        options[name]=!options[name];
        sw.classList.toggle("on",options[name]);
        sw.setAttribute("aria-pressed",String(options[name]));
        document.body.classList.toggle("peera-dark",options.dark);
        document.body.classList.toggle("peera-reduced-motion",!options.motion);
        window.peeraSoundEnabled=options.sound;
      }
      if(e.target.closest("#profile-signout")){
        await db.signOut();
        location.hash="#/auth";
      }
    };
    const langChange = e => {
      state.setLang(e.target.value);
      toast("სასწავლო ენა შეიცვალა");
      window.dispatchEvent(new Event("hashchange"));
    };
    root.addEventListener("click",change);
    root.querySelector("#profile-lang")?.addEventListener("change",langChange);
    return ()=>{root.removeEventListener("click",change);root.querySelector("#profile-lang")?.removeEventListener("change",langChange);};
  },
};
