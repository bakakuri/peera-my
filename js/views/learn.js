import {store} from '../core/store.js';
import {esc,icon,img,pill,meter,number} from '../core/utils.js';
import {pageTop,footer} from '../components/chrome.js';
let chosen=null;
const title='გაკვეთილები';
function levelBlock(level,lessons){return `<div class="level-mark"><div class="level-island ${level.toLowerCase()}"><span class="level-flag">${level}</span></div><span class="level-caption">${level} საფეხური</span></div>${Array.from({length:Math.ceil(lessons.length/2)},(_,idx)=>{
 const pair=lessons.slice(idx*2,idx*2+2);
 return `<div class="roadmap-row">${pair.map(l=>{const done=store.user.completed[l.id],locked=!store.isUnlocked(l),current=!done&&!locked;return `<a class="lesson-node ${done?'complete':current?'current':'locked'}" href="${locked?'#/learn':'#/lesson/'+l.id}" data-locked="${locked?'true':'false'}"><span class="node-icon">${done?'✓':locked?'🔒':'▶'}</span><span class="node-copy"><b>გაკვეთილი ${l.number}<br>${esc(l.title)}</b><small>📚 +${l.xp} XP</small><span class="node-stars">${done?'★★★':current?'★★☆':'☆☆☆'}</span></span></a>`}).join('')}</div>`
 }).join('')}`}
export default {
 render(){const code=chosen||store.lang;const course=store.data.courses.find(c=>c.id===code)||store.data.courses[0], lessons=store.lessonsFor(code),prog=store.courseProgress(code),next=lessons.find(l=>!store.user.completed[l.id]);
 return `${pageTop(title,'📚','#/home')}
 <div class="tab-row">${store.data.courses.map(c=>`<button class="tab ${code===c.id?'active':''}" data-action="choose-course" data-id="${c.id}">${c.flag} ${esc(c.name)}</button>`).join('')}</div>
 <div class="glass course-hero">${img('girl-dict.png','girl')}<div class="course-hero-info">${pill(`${course.flag} ${course.level} · ეტაპი 1`,'purple')}<h2>${esc(course.name)}ს დასაწყისი</h2><p>${esc(course.description)}</p><a class="btn btn-green" href="${next?'#/lesson/'+next.id:'#/cards'}">▶ ${next?'გაგრძელება':'გამეორება'}</a></div></div>
 <div class="glass goal-card">${icon('star')}<div><strong>კვირის მიზანი</strong><p>დაასრულე 5 გაკვეთილი</p>${meter(Math.min(100,Math.round(100*prog.done/5)))}</div><span>${prog.done}/5</span></div>
 <section class="roadmap">${['A1','A2','B1'].map(level=>{const arr=lessons.filter(l=>l.level===level);return arr.length?levelBlock(level,arr):''}).join('')}</section>
 <div class="notice">🔒 გაკვეთილები იხსნება თანმიმდევრობით. პროგრესი ინახება მხოლოდ ამ ბრაუზერში, IndexedDB-ში.</div>
 ${footer()}`},
 handle(action,el,refresh){if(action==='choose-course'){chosen=el.dataset.id;refresh();return true;}return false;},
 setCourse(code){chosen=code}
};
