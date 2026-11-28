import {store} from '../core/store.js';
import {esc,meter} from '../core/utils.js';
import {pageTop,footer} from '../components/chrome.js';
let chosen=null;
function lessonRow(l){const done=!!store.user.completed[l.id];const locked=!store.isUnlocked(l);
 const status=done?'დასრულებულია':locked?'ჩაკეტილია':'დასაწყებია';const icon=done?'✓':locked?'🔒':'▶';
 const inner=`<span class="lesson-index">${icon}</span><span class="lesson-text"><strong>${esc(l.title)}</strong>
 <small>გაკვეთილი ${l.number} · ${l.wordIds?.length||0} სიტყვა · ${l.xp} XP</small></span><span class="lesson-status ${done?'is-done':locked?'is-locked':'is-ready'}">${status}</span><span class="lesson-arrow">${locked?'':'→'}</span>`;
 return locked?`<div class="lesson-list-item locked" aria-label="${esc(l.title)} — ჩაკეტილია">${inner}</div>`:
 `<a href="#/lesson/${l.id}" class="lesson-list-item ${done?'done':'ready'}">${inner}</a>`;
}
export default {
 render(){const code=chosen||store.lang;const c=store.data.courses.find(x=>x.id===code)||store.data.courses[0];
 const lessons=store.lessonsFor(code),p=store.courseProgress(code),next=lessons.find(l=>!store.user.completed[l.id]&&store.isUnlocked(l));
 return `${pageTop('გაკვეთილები','','#/home')}<p class="page-description">აირჩიე ენა და მიჰყევი გაკვეთილებს თანმიმდევრობით.</p>
 <div class="course-selector" aria-label="სასწავლო ენა">${store.data.courses.map(x=>`<button class="course-choice ${code===x.id?'active':''}" data-action="choose-course" data-id="${x.id}" aria-pressed="${code===x.id}">${x.flag} ${esc(x.name)}</button>`).join('')}</div>
 <section class="course-overview"><div class="course-overview-body"><span class="tiny-kicker">${c.flag} ${esc(c.name)} · ${esc(c.level)}</span>
 <h2>${esc(c.name)} — შენი კურსი</h2><p>${esc(c.description)}</p>
 <div class="overview-progress"><span>${p.done} / ${p.total} გაკვეთილი დასრულდა</span><strong>${p.percent}%</strong></div>${meter(p.percent)}
 <a class="action-primary" href="${next?'#/lesson/'+next.id:'#/cards'}">${next?'შემდეგი გაკვეთილი':'სიტყვების გამეორება'} <span>→</span></a></div>
 <img src="${code==='en'?'assets/bigben.png':code==='es'?'assets/sagrada.png':'assets/berlin.png'}" alt="" loading="lazy"></section>
 <div class="section-heading"><h2>გაკვეთილების სია</h2><span class="helper-text">${lessons.length} გაკვეთილი</span></div>
 ${['A1','A2','B1','B2','C1','C2'].map(level=>{const arr=lessons.filter(l=>l.level===level);return !arr.length?'':`<section class="lesson-group"><div class="lesson-group-head"><span class="level-chip">${level}</span><div><h3>${level} დონე</h3><p>${arr.filter(l=>store.user.completed[l.id]).length}/${arr.length} დასრულებული</p></div></div><div class="lesson-list">${arr.map(lessonRow).join('')}</div></section>`}).join('')}
 <p class="explanation">🔒 ჩაკეტილი გაკვეთილი გაიხსნება წინა გაკვეთილის დასრულების შემდეგ.</p>${footer()}`;
 },handle(action,el,refresh){if(action==='choose-course'){chosen=el.dataset.id;refresh();return true;}return false;},setCourse(code){chosen=code}
};
