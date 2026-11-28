import {store} from '../core/store.js';
import {cloud} from '../core/cloud.js';
import {esc,meter,number,pct} from '../core/utils.js';
import {footer} from '../components/chrome.js';
import {dateKey} from '../core/utils.js';
const task=(href,icon,title,note,tag='გახსნა')=>`<a class="v7-task" href="#/${href}"><span class="v7-task-icon">${icon}</span><span class="v7-task-text"><strong>${title}</strong><small>${note}</small></span><span class="v7-task-end">${tag} →</span></a>`;
export default {render(){const p=store.profile,s=store.stats,lessons=store.lessonsFor(),
 next=lessons.find(l=>!store.user.completed[l.id]&&store.isUnlocked(l)),
 current=store.data.courses.find(c=>c.id===store.lang),due=store.due().length,
 daily=store.user.daily[dateKey()]||0,goal=Math.max(1,p.dailyGoal||50),
 progress=store.courseProgress(store.lang),cards=store.queue(store.lang).length;
 return `<div class="v7-page-title"><div><span class="v7-eyebrow">ჩემი სასწავლო სივრცე</span><h1>გამარჯობა, ${esc(p.name||'მოსწავლე')}! 👋</h1><p>დაიწყე იქიდან, სადაც შეჩერდი. ერთი ნაბიჯი ყოველდღე.</p></div><a class="v7-quiet-link" href="#/profile">ჩემი ანგარიში →</a></div>
 <section class="v7-hero"><div class="v7-hero-copy"><span class="v7-hero-label">${current?.flag||'🌍'} ${esc(current?.name||'სასწავლო კურსი')} · ${esc(next?.level||'A1')}</span>
 <h2>${next?esc(next.title):'გაკვეთილები დასრულებულია!'}</h2>
 <p>${next?`გაკვეთილი ${next.number} · ${next.wordIds?.length||0} სიტყვა · ${next.xp||40} XP`:'გაიმეორე სიტყვები ან აირჩიე სხვა კურსი.'}</p>
 <a class="v7-primary" href="#/${next?'lesson/'+next.id:'practice'}">${next?'▶ გაკვეთილის გაგრძელება':'გამეორების დაწყება'} <span>→</span></a>
 <div class="v7-hero-progress"><span>კურსის პროგრესი</span><b>${progress.done}/${progress.total}</b>${meter(progress.percent)}</div></div>
 <img src="assets/girl-point.png" alt="სწავლის პერსონაჟი" class="v7-hero-girl" loading="lazy"></section>
 <section class="v7-summary"><div><span>⭐ სულ XP</span><strong>${number(s.xp)}</strong></div><div><span>🔥 სერია</span><strong>${s.streak} დღე</strong></div><div><span>📚 ნასწავლი</span><strong>${store.learned()} სიტყვა</strong></div></section>
 <div class="v7-title-row"><h2>დღევანდელი გეგმა</h2><a href="#/plan">სრული გეგმა →</a></div>
 <div class="v7-goal"><div class="v7-goal-top"><div><span class="v7-icon-bubble">🎯</span><strong>დღის მიზანი</strong></div><b>${daily}/${goal} XP</b></div>${meter(pct(daily,goal))}<small>${daily>=goal?'დღევანდელი მიზანი შესრულებულია 🎉':'მეტი პროგრესისთვის გააგრძელე სწავლა ან გამეორება'}</small></div>
 <div class="v7-task-list">${task('cards','🗂️','სიტყვების გამეორება',due?`${due} სიტყვა ელოდება გამეორებას`:`${cards} სიტყვა მზადაა ახალი პრაქტიკისთვის`,'დაწყება')}
 ${task('listening','🎧','მოსმენის პრაქტიკა','მოუსმინე წინადადებებს და უპასუხე კითხვებს')}
 ${task('grammar','📖','გრამატიკის ვარჯიში','წესები, მაგალითები და მოკლე ტესტები')}</div>
 <div class="v7-title-row"><h2>ჩემი კურსები</h2><a href="#/learn">ყველა კურსი →</a></div>
 <div class="v7-course-grid">${store.data.courses.map(c=>{const cp=store.courseProgress(c.id);return `<a href="#/learn?lang=${c.id}" class="v7-course"><div class="v7-course-heading"><span>${c.flag}</span><b>${esc(c.name)}</b></div><p>${esc(c.description)}</p><div class="v7-course-progress"><small>${cp.done}/${cp.total} გაკვეთილი</small><strong>${cp.percent}%</strong></div>${meter(cp.percent)}</a>`}).join('')}</div>
 ${!cloud.user?`<a class="v7-account-hint" href="#/auth"><span>☁️</span><span><strong>შეინახე შენი პროგრესი ყველა მოწყობილობაზე</strong><small>უფასო ანგარიშით სწავლა სინქრონიზდება</small></span><b>→</b></a>`:''}
 ${p.demo?'<p class="demo-label">სტუმრის ძველი საჩვენებელი პროგრესი შენარჩუნებულია. სურვილის შემთხვევაში პროფილში შეგიძლია ნულიდან დაწყება.</p>':''}${footer()}`;
}};
