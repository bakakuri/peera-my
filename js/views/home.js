import {state} from '../core/state.js';
import {heading,section,tiles,instruments,cloudNotice} from '../core/chrome.js';
import {esc,meter,percent,flag,dayKey} from '../core/utils.js';
const greeting=()=>{const h=new Date().getHours();return h<12?'დილა მშვიდობისა':h<18?'კარგი დღე':'საღამო მშვიდობისა'};
export default {render(){
 const user=state.user,course=state.course,next=state.nextLesson(),queue=state.queue(),today=state.dailyXp(),complete=state.progress();
 return `${heading(`${greeting()}! 👋`,'აირჩიე ერთი ნაბიჯი და გააგრძელე სწავლა.')}
 <section class="card welcome"><div><span class="pill">${flag(user.language)} ${esc(course?.name||'გერმანული')} · A1</span><h2>${next?'განაგრძე სწავლა იქიდან, სადაც გაჩერდი':'კურსი დასრულებულია! 🎉'}</h2><p>${next?`გაკვეთილი ${next.order}: ${esc(next.title)}`:'აირჩიე სხვა კურსი ან გაიმეორე სიტყვები.'}</p><a class="btn btn-success" href="${next?'#/lesson/'+next.id:'#/courses'}">${next?'▶  გაკვეთილის გაგრძელება':'კურსების ნახვა'} →</a></div><div class="hero-illustration" aria-hidden="true"><span class="hero-ring"></span><span class="hero-book">A</span><span class="hero-bubble">Hallo!</span></div></section>
 <section class="section"><div class="metric-grid">
 ${[[`✦`,`${user.xp} XP`,'სულ ქულა'],['◷',`${user.streak} დღე`,'სწავლის სერია'],['▤',`${state.learned()}`,'ნასწავლი სიტყვა'],['✓',`${complete.done}/${complete.total}`,'გაკვეთილები']].map(([i,n,l])=>`<div class="metric"><span class="ico">${i}</span><span><b>${n}</b><small>${l}</small></span></div>`).join('')}
 </div></section>
 <div class="cols-2 section"><div><div class="section-title"><h2>დღევანდელი გეგმა</h2><a href="#/plan">ჩემი გეგმა →</a></div><div class="card stack">
 <div class="inline"><span class="ico green">✓</span><span class="grow"><b>დღიური მიზანი</b><div class="tiny">${today} / ${user.goal} XP დღეს</div></span><span class="pill ${today>=user.goal?'green':'gray'}">${percent(today,user.goal)}%</span></div>${meter(percent(today,user.goal),'green')}
 <a href="#/cards" class="list-row"><span class="ico blue">◈</span><span class="row-main"><b>სიტყვების გამეორება</b><small>${queue.length} სიტყვა მზად არის სავარჯიშოდ</small></span><span class="row-arrow">›</span></a>
 <a href="#/listening" class="list-row"><span class="ico amber">♫</span><span class="row-main"><b>მოსმენის პრაქტიკა</b><small>მოისმინე ფრაზები და შეამოწმე ცოდნა</small></span><span class="row-arrow">›</span></a>
 </div></div><div><div class="section-title"><h2>შემდეგი გაკვეთილი</h2><a href="#/courses">სასწავლო გზა →</a></div><div class="next-card">
 <div class="micro">${course?.flag||'🇩🇪'} ${course?.name||'გერმანული'} · A1</div><h3>${next?esc(next.title):'ყველა გაკვეთილი დასრულებულია'}</h3><p class="muted">${next?esc(next.summary):'შეინარჩუნე ცოდნა რეგულარული გამეორებით.'}</p>${meter(percent(complete.done,complete.total))}<small class="muted">${complete.done} / ${complete.total} გაკვეთილი</small><a class="btn btn-primary" href="${next?'#/lesson/'+next.id:'#/cards'}">${next?'გაკვეთილის დაწყება':'გამეორება'} →</a></div>
 </div></div>
 <section class="section">${section('სასწავლო ინსტრუმენტები','#/practice','ყველა ინსტრუმენტი')}${tiles(instruments)}</section>
 <section class="section">${section('ჩემი კურსები','#/courses')}
 <div class="cols-even">${state.catalog.courses.map(c=>{const p=state.progress(c.id);return `<a href="#/courses" class="course-card"><span class="course-flag">${c.flag}</span><span class="course-body"><b>${esc(c.name)} · ${esc(c.level)}</b><small>${p.done}/${p.total} გაკვეთილი დასრულებული</small><span class="course-progress">${meter(percent(p.done,p.total))}<strong>${percent(p.done,p.total)}%</strong></span></span></a>`}).join('')}</div></section>
 <div class="section">${cloudNotice()}</div>`;
 }};
