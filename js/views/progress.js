import {store} from '../core/store.js';
import {esc,art,icon,img,number,meter,pct} from '../core/utils.js';
import {pageTop,footer} from '../components/chrome.js';
import {dateKey} from '../core/utils.js';
const weekdays=['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ'];
function daysBack(count){return Array.from({length:count},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-count+i+1);
 const key=dateKey(d);return {key,label:weekdays[d.getDay()],xp:store.user.daily[key]||0,day:d.getDate()};});}
function weekly(){const arr=daysBack(7),max=Math.max(1,...arr.map(d=>d.xp));return `<section class="glass chart-box"><h3>ბოლო 7 დღის ქულები</h3>
 <div class="weekly-bars">${arr.map((d,i)=>`<div class="bar-group ${i===6?'today':''}"><b>${d.xp}</b><div class="bar-visual" style="--h:${Math.round(100*d.xp/max)}"></div><small>${d.label}</small></div>`).join('')}</div></section>`;}
function heatmap(){const arr=daysBack(14),goal=Math.max(1,store.profile.dailyGoal);return `<section class="glass activity-box"><h3>აქტივობა ბოლო 14 დღეში</h3>
 <p class="text-small muted">მუქი უჯრა ნიშნავს, რომ მეტი ქულა დააგროვე.</p><div class="activity-grid activity-grid-14">${arr.map(d=>`<span class="activity-cell l${Math.min(4,Math.ceil(4*d.xp/goal))}" title="${d.key}: ${d.xp} XP" aria-label="${d.key}: ${d.xp} XP"></span>`).join('')}</div></section>`;}
export default {render(){const s=store.stats,learned=store.learned(),success=pct(s.correct,s.reviews),all=store.wordsFor().length,completion=pct(learned,all);
 const daily=store.user.daily[dateKey()]||0;
 return `${pageTop('ჩემი პროგრესი','','#/home')}<p class="page-description">აქ ნახავ, რამდენი სიტყვა ისწავლე, რამდენი გაკვეთილი დაასრულე და როგორ მიდის ყოველდღიური სწავლა.</p>
 <div class="metric-grid">${[['star',`${number(s.xp)} XP`,'სულ ქულა'],['flame',`${s.streak} დღე`,'სერია'],['dictionary-3d',number(learned),'ნასწავლი სიტყვა'],['calendar',number(s.lessons),'გაკვეთილი'],['awards-3d',`${success}%`,'სწორი პასუხი']].map(([ico,n,label])=>`<div class="metric">${icon(ico)}<strong>${n}</strong><small>${label}</small></div>`).join('')}</div>
 <div class="section-heading"><h2>სწავლის შედეგები</h2></div><div class="chart-grid"><section class="glass chart-box"><h3>ნასწავლი სიტყვები (${store.lang.toUpperCase()})</h3>
 <div class="ring" style="--pct:${completion}%"><div>${art('cap')}<strong>${completion}%</strong><small>${learned}/${all} სიტყვა</small></div></div></section>${weekly()}</div>
 <div class="section-heading"><h2>ყოველდღიური აქტივობა</h2></div>${heatmap()}
 <div class="section-heading"><h2>კურსების პროგრესი</h2></div>${store.data.courses.map(c=>{const p=store.courseProgress(c.id);return `<a href="#/learn?lang=${c.id}" class="glass course-progress-card"><span class="course-flag">${c.flag}</span><div><strong>${esc(c.name)}</strong><small> · ${p.done}/${p.total} გაკვეთილი</small>${meter(p.percent)}</div><b>${p.percent}%</b></a>`}).join('')}
 <div class="glass daily-success">${icon('calendar')}<div><strong>დღიური მიზანი</strong><p>დღეს: ${daily} / ${store.profile.dailyGoal} XP</p>${meter(pct(daily,store.profile.dailyGoal))}</div></div>
 ${store.profile.demo?`<div class="demo-label">ℹ️ სტუმრის საწყისი XP და სერია დემოა; აქტივობის დიაგრამა უკვე რეალურად დაფიქსირებულ დღიურ ქულებს აჩვენებს.</div>`:``}${footer()}`;}};
