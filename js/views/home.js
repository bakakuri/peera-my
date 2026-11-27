import {store} from '../core/store.js';
import {esc,img,icon,art,meter,number,pct} from '../core/utils.js';
import {footer} from '../components/chrome.js';
const tiles=[['სასწავლო','learn','cap','mint'],['სიტყვების სწავლა','cards','bubbles','lime'],['გრამატიკა','grammar','book','sun'],['მოსმენა და გამოთქმა','listening','headphones','purple'],['სასწავლო გეგმა','plan','calendar','pink'],['თამაშები და ტესტები','games','gamepad','aqua']];
function course(c){const progress=store.courseProgress(c.id);return `<a class="course-card ${c.id==='en'?'en':c.id==='es'?'es':''}" href="#/learn?lang=${c.id}"><div class="course-title"><span class="flag">${c.flag}</span><span>${esc(c.name)}</span></div><div><small class="text-small">დონე ${esc(c.level)} · ${progress.done}/${progress.total} გაკვეთილი</small><div class="course-bottom">${meter(progress.percent,c.id==='en'?'blue':'')}<strong>${progress.percent}% ›</strong></div></div></a>`}
export default {
 render(){const p=store.profile,s=store.stats;
  return `<section class="hero-home shine" aria-label="სწავლის დაწყება">
    ${img('berlin.png','landmark-a')}${img('bigben.png','landmark-b')}${img('girl-dict.png','girl')}
    <div class="hero-copy"><h1>განაგრძე სწავლა,<br>Peera.My-თან!</h1><p>ისწავლე ენები მარტივად, საინტერესოდ და შედეგიანად!</p><a class="btn btn-green" href="#/learn">▶ სწავლის გაგრძელება ❯</a></div>
  </section>
  <div class="section-heading"><h2>📚 ჩემი კურსები</h2><a href="#/learn">ყველა კურსი ❯</a></div>
  <div class="courses-grid">${store.data.courses.slice(0,2).map(course).join('')}</div>
  <section class="glass summary-strip" aria-label="სტატისტიკა">
    <div class="summary-unit">${icon('star')}<div><strong>${number(s.xp)} XP</strong><small>გამოცდილება</small></div></div>
    <div class="summary-unit">${art('book')}<div><strong>${number(store.learned())}</strong><small>ნასწავლი სიტყვა</small></div></div>
    <div class="summary-unit">${icon('calendar')}<div><strong>${p.dailyGoal} XP</strong><small>დღიური მიზანი</small></div></div>
  </section>
  <div class="section-heading"><h2>⚡ სწრაფი წვდომა</h2></div>
  <div class="features-grid">${tiles.map(([text,route,ico,tone])=>`<a class="feature-card ${tone}" href="#/${route}">${art(ico)}<span>${text} ›</span></a>`).join('')}</div>
  <a class="awards-promo shine" href="#/achievements">${icon('trophy','award-art')}<div><strong>მიღწევები</strong><p>თვალი ადევნე შენს პროგრესს,<br>მოიპოვე მედლები და ჯილდოები!</p></div><span class="icon-btn">❯</span></a>
  ${footer()}`;
 }
}
