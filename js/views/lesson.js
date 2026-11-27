import {store} from '../core/store.js';
import {esc,img,icon,pill,meter,number} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
import {speak} from '../core/audio.js';
let currentId='',step=0,wordIndex=0,answers={},saved=false,earnedXp=0;
const stages=['სიტყვები','დიალოგი','ტესტი','შედეგი'];
function wordBlock(lesson){const word=store.word(lesson.wordIds[wordIndex])||store.words[0],example=word.examples[0];return `<div class="lesson-banner glass"><div class="copy">${pill(`🇩🇪 სიტყვა ${wordIndex+1}/${lesson.wordIds.length}`,'purple')}<h2>${esc(word.term)}</h2><p class="trans">${esc(word.translation)}</p><button class="btn btn-purple" data-action="speak" data-id="${word.id}">🔊 ${esc(word.phonetic)}</button><div class="lesson-ex"><b>${esc(example.sentence)}</b><br>${esc(example.translation)}</div></div>${img('girl-point.png','girl')}</div><div class="lesson-actions"><button class="btn btn-light" data-action="prev-word">‹ წინა</button><button class="btn btn-purple" data-action="next-word">შემდეგი სიტყვა ›</button></div>`}
function dialogueBlock(lesson){return `<section class="glass dialogue-panel"><h2>💬 მინი დიალოგი</h2><p class="muted text-small">მოუსმინე დიალოგის თითოეულ ნაწილს</p>${lesson.dialogue.map((d,i)=>`<div class="bubble ${i?'alt':''}"><b>${esc(d.speaker)}:</b> ${esc(d.text)}<button class="icon-btn" style="width:29px;height:29px;float:right" data-action="say-line" data-index="${i}" aria-label="მოსმენა">🔊</button><p>${esc(d.translation)}</p></div>`).join('')}</section>`}
function quizBlock(lesson){const pool=lesson.wordIds.slice(0,4).map(id=>store.word(id)).filter(Boolean);return `<section class="glass quiz-panel"><h2>🎮 სასწავლო ტესტი</h2><p class="muted text-small">თითოეულ სიტყვას შეარჩიე სწორი თარგმანი</p>${pool.map((w,idx)=>{const wrong=store.wordsFor(w.language).filter(x=>x.id!==w.id).slice(idx+8,idx+11).map(x=>x.translation),options=[...wrong.slice(0,3),w.translation].sort((a,b)=>a.localeCompare(b,'ka'));return `<div style="margin-top:17px"><b style="font-size:.8rem">${idx+1}. რას ნიშნავს „${esc(w.term)}“?</b><div class="quiz-grid">${options.map(op=>`<button class="answer ${answers[idx]===op?'picked':''}" data-action="answer" data-index="${idx}" data-answer="${esc(op)}" aria-pressed="${answers[idx]===op}">${esc(op)}</button>`).join('')}</div></div>`}).join('')}</section>`}
function scoreOf(lesson){const pool=lesson.wordIds.slice(0,4).map(id=>store.word(id));return pool.filter((w,i)=>answers[i]===w?.translation).length}
function resultBlock(lesson){const score=scoreOf(lesson),total=Math.min(4,lesson.wordIds.length);return `<section class="glass done-banner">${img('girl-cheer.png')}<h2>გაკვეთილი დასრულდა! 🎉</h2><p style="margin:10px 0">სწორი პასუხები: <b>${score}/${total}</b></p>${meter(Math.round(100*score/total))}<p style="margin:12px 0">+${saved?earnedXp:score*5+(store.user.completed[lesson.id]?0:20)} XP</p>${pill(saved?'შედეგი შენახულია':'მზადაა შესანახად',saved?'green':'gold')}</section>`}
export default {
 render(route){const id=route.split('/')[1]||'de-01',lesson=store.lesson(id);if(!lesson)return `<div class="empty-state"><h3>გაკვეთილი ვერ მოიძებნა</h3><a href="#/learn" class="btn btn-purple">კურსებში დაბრუნება</a></div>`;
 if(currentId!==id){currentId=id;step=route.startsWith('quiz/')?2:0;wordIndex=0;answers={};saved=false;earnedXp=0;}
 const unlocked=store.isUnlocked(lesson);if(!unlocked)return `<div class="empty-state"><h3>🔒 ეს გაკვეთილი ჯერ ჩაკეტილია</h3><a href="#/learn" class="btn btn-purple">გაკვეთილების გზა</a></div>`;
 const content=step===0?wordBlock(lesson):step===1?dialogueBlock(lesson):step===2?quizBlock(lesson):resultBlock(lesson);
 return `${pageTop(`გაკვეთილი ${lesson.number}`,'📖','#/learn')}<div class="lesson-stepper">${stages.map((s,i)=>`<button class="step ${i===step?'active':''}" data-action="stage" data-index="${i}" ${i>2||i>step&&!saved?'':' '}><span class="icon-btn">${['📖','💬','🎮','🏆'][i]}</span><span>${s}</span></button>`).join('')}</div><div class="lesson-progress">${meter(((step+1)/4)*100)}</div><div class="lesson-stage">${content}</div><div class="lesson-actions">${step>0?`<button class="btn btn-light" data-action="prev-stage">← უკან</button>`:''}<button class="btn btn-green btn-large" data-action="next-stage">${step===3?'მზადაა ✓':step===2?'შედეგის ნახვა':'შემდეგი ❯'}</button></div>`;
 },
 async handle(action,el,refresh){const lesson=store.lesson(currentId);if(!lesson)return false;
 if(action==='speak'){const w=store.word(el.dataset.id);speak(w.term,w.language);return true;}
 if(action==='say-line'){speak(lesson.dialogue[Number(el.dataset.index)].text,lesson.language);return true;}
 if(action==='next-word'){wordIndex=Math.min(lesson.wordIds.length-1,wordIndex+1);refresh();return true;}
 if(action==='prev-word'){wordIndex=Math.max(0,wordIndex-1);refresh();return true;}
 if(action==='answer'){answers[el.dataset.index]=el.dataset.answer;refresh();return true;}
 if(action==='stage'){const i=Number(el.dataset.index);if(i<=2||i===3&&saved){step=i;refresh();}return true;}
 if(action==='prev-stage'){step=Math.max(0,step-1);refresh();return true;}
 if(action==='next-stage'){
   if(step===2&&Object.keys(answers).length<4){window.peeraToast('უპასუხე ოთხივე კითხვას');return true;}
   if(step===2&&!saved){earnedXp=await store.completeLesson(lesson,scoreOf(lesson),4);saved=true;}
   if(step===3){location.hash='#/learn';return true;}
   step++;refresh();return true;
 }
 return false;
 }
};
