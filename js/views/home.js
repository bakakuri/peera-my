import {store} from '../core/store.js';
import {cloud} from '../core/cloud.js';
import {esc,number,meter} from '../core/utils.js';
import {footer} from '../components/chrome.js';

const tools=[
  ['cards','↻','სიტყვების გამეორება','გაიმეორე ნასწავლი სიტყვები და დაიმახსოვრე უკეთ'],
  ['dictionary','⌕','ლექსიკონი','მოძებნე სიტყვა, თარგმანი და გამოთქმა'],
  ['grammar','Aa','გრამატიკა','ისწავლე წესები მოკლე მაგალითებით'],
  ['listening','♫','მოსმენა','ივარჯიშე გამოთქმასა და გაგებაში']
];
function courseCard(c){const p=store.courseProgress(c.id);return `<a class="course-item" href="#/learn?lang=${c.id}">
  <span class="course-flag" aria-hidden="true">${c.flag}</span><span class="course-info"><strong>${esc(c.name)}</strong>
  <small>${p.done} / ${p.total} გაკვეთილი · ${esc(c.level)}</small>
  <span class="course-meter">${meter(p.percent)}</span></span>
  <span class="course-percentage">${p.percent}% <b>›</b></span></a>`;}
export default {render(){
 const p=store.profile,s=store.stats,lessons=store.lessonsFor(),next=lessons.find(l=>!store.user.completed[l.id]&&store.isUnlocked(l));
 const current=store.data.courses.find(c=>c.id===store.lang);
 const due=store.due().length,doneToday=store.user.daily[new Date().toISOString().slice(0,10)]||0;
 const goalPercent=Math.min(100,Math.round(100*doneToday/Math.max(1,p.dailyGoal)));
 return `<div class="welcome-heading"><div><div class="eyebrow">შენი სასწავლო სივრცე</div><h1>გამარჯობა! 👋</h1><p>${esc(p.name||'მოსწავლე')}, აირჩიე შემდეგი სასწავლო ნაბიჯი.</p></div></div>
 <section class="start-panel" aria-label="სწავლის გაგრძელება">
  <div class="start-copy"><span class="tiny-kicker">${current?.flag||'📚'} ${esc(current?.name||'ენა')} · ${esc(next?.level||current?.level||'A1')}</span>
    <h2>${next?'განაგრძე სწავლა':'დაიწყე ახალი გაკვეთილი'}</h2>
    <p>${next?`შემდეგია: ${esc(next.title)} · გაკვეთილი ${next.number}`:'ახალი გაკვეთილები ან სიტყვების გამეორება შენს განკარგულებაშია.'}</p>
    <a class="action-primary" href="${next?'#/lesson/'+next.id:'#/learn'}">${next?'გაგრძელება':'გაკვეთილების ნახვა'} <span>→</span></a></div>
  <img class="start-illustration" src="assets/girl-point.png" alt="მოსწავლე" loading="lazy" />
 </section>
 <div class="today-grid"><a href="#/plan" class="today-card"><span class="today-icon">◎</span><div><small>დღიური მიზანი</small><strong>${doneToday} / ${p.dailyGoal} XP</strong>${meter(goalPercent)}</div><span class="text-link">›</span></a>
 <a href="#/cards" class="today-card"><span class="today-icon orange">↻</span><div><small>გასამეორებელი</small><strong>${due} სიტყვა</strong><span class="tiny-description">გადასვლა ბარათებზე</span></div><span class="text-link">›</span></a></div>
 <div class="section-heading"><h2>რას გააკეთებ დღეს?</h2><a href="#/plan">სასწავლო გეგმა →</a></div>
 <div class="quick-grid">${tools.map(([route,sign,title,description])=>`<a href="#/${route}" class="quick-card"><span class="quick-icon">${sign}</span><strong>${title}</strong><p>${description}</p><span class="quick-arrow">→</span></a>`).join('')}</div>
 <div class="section-heading"><h2>ჩემი კურსები</h2><a href="#/learn">ყველა გაკვეთილი →</a></div>
 <div class="course-list">${store.data.courses.map(courseCard).join('')}</div>
 ${!cloud.user?`<a class="sync-notice" href="#/auth"><span class="sync-icon">☁</span><span><strong>შეინახე პროგრესი ყველა მოწყობილობაზე</strong><small>შედი ანგარიშში ან დარეგისტრირდი უფასოდ</small></span><b>→</b></a>`:``}
 <div class="home-bottom-links"><a href="#/progress">◷ ჩემი პროგრესი <span>→</span></a><a href="#/achievements">✦ მიღწევები <span>→</span></a><a href="#/leaderboard">★ რეიტინგი <span>→</span></a><a href="#/profile">⚙ პარამეტრები <span>→</span></a></div>
 ${p.demo?`<div class="demo-label">ℹ️ სტუმრის რეჟიმში მოცემული საწყისი პროგრესი საჩვენებელია. ახალი მოქმედებები ამ მოწყობილობაზე ინახება.</div>`:``}${footer()}`;
}};
