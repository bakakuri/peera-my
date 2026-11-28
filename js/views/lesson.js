import {store} from '../core/store.js';
import {esc,img,meter} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
import {speak} from '../core/audio.js';
let currentId='',step=0,wordIndex=0,answers={},saved=false,earnedXp=0;
const stages=['სიტყვები','დიალოგი','ტესტი','შედეგი'];
const pool=l=>l.wordIds.slice(0,4).map(id=>store.word(id)).filter(Boolean);
const total=l=>pool(l).length;
const scoreOf=l=>pool(l).filter((w,i)=>answers[i]===w.translation).length;
const passed=l=>scoreOf(l)>=Math.ceil(total(l)*.75);
async function persist(){if(!saved)await store.draftLesson(currentId,{step,wordIndex,answers});}
function wordBlock(l){const w=store.word(l.wordIds[wordIndex]);if(!w)return '<p class="notice">სიტყვა ვერ მოიძებნა.</p>';
 const ex=w.examples?.[0];return `<div class="glass lesson-banner"><div class="copy"><span class="pill purple">${w.language.toUpperCase()} · სიტყვა ${wordIndex+1}/${l.wordIds.length}</span><h2>${esc(w.term)}</h2><p class="trans">${esc(w.translation)}</p><p class="word-phonetic">${esc(w.phonetic)}</p><button class="btn btn-purple" data-action="speak" data-id="${esc(w.id)}">🔊 მოსმენა</button><div class="lesson-ex">${esc(ex?.sentence||'')}<br>${esc(ex?.translation||'')}</div></div>${img('girl-point.png','girl')}</div>
 <div class="lesson-actions"><button class="btn btn-light" data-action="prev-word" ${!wordIndex?'disabled':''}>← წინა სიტყვა</button><button class="btn btn-purple" data-action="next-word" ${wordIndex>=l.wordIds.length-1?'disabled':''}>შემდეგი სიტყვა →</button></div>`;}
function dialogueBlock(l){return `<section class="glass dialogue-panel"><h2>💬 საუბრის პრაქტიკა</h2><p class="page-description">მოუსმინე ტექსტს და გაიმეორე თითოეული წინადადება.</p>${(l.dialogue||[]).map((d,i)=>`<div class="bubble ${i%2?'alt':''}"><b>${esc(d.speaker)}:</b> ${esc(d.text)}<button class="icon-btn" data-action="say-line" data-index="${i}" aria-label="ფრაზის მოსმენა">🔊</button><p>${esc(d.translation)}</p></div>`).join('')}</section>`;}
function quizBlock(l){return `<section class="glass quiz-panel"><h2>✅ ცოდნის შემოწმება</h2><p class="page-description">უპასუხე ყველა კითხვას. შემდეგ ეტაპზე გადასასვლელად საჭიროა მინიმუმ 75%.</p>
 ${pool(l).map((w,i)=>{const wrong=[...new Set(store.wordsFor(w.language).filter(x=>x.id!==w.id&&x.translation!==w.translation).map(x=>x.translation))].slice(i+2,i+5);const options=[...wrong,w.translation].sort((a,b)=>a.localeCompare(b,'ka'));
 return `<div class="v7-question"><h3>${i+1}. რას ნიშნავს „${esc(w.term)}“?</h3><div class="quiz-grid">${options.map(op=>`<button class="answer ${answers[i]===op?'picked':''}" data-action="answer" data-index="${i}" data-answer="${esc(op)}" aria-pressed="${answers[i]===op}">${esc(op)}</button>`).join('')}</div></div>`}).join('')}</section>`;}
function resultBlock(l){const score=scoreOf(l),ok=passed(l),errors=pool(l).map((w,i)=>({w,answer:answers[i]})).filter(x=>x.answer!==x.w.translation);
 return `<section class="glass done-banner">${img(ok?'girl-cheer.png':'girl-dict.png')}<h2>${ok?'გაკვეთილი წარმატებით დასრულდა! 🎉':'მოდი, კიდევ ერთხელ ვცადოთ'}</h2>
 <p>სწორი პასუხები: <strong>${score}/${total(l)}</strong></p>${meter(Math.round(100*score/Math.max(1,total(l))))}
 <p>${ok?`დაგერიცხა +${earnedXp} XP`:'გადასასვლელად საჭიროა მინიმუმ 75% სწორი პასუხი.'}</p>
 ${errors.length?`<div class="v7-errors"><h3>სწორი პასუხები</h3>${errors.map(x=>`<p><b>${esc(x.w.term)}</b> — ${esc(x.w.translation)}</p>`).join('')}</div>`:''}
 ${!ok?'<button data-action="retry" class="btn btn-purple">ტესტის ხელახლა გავლა →</button>':''}</section>`;}
export default {render(route){const id=route.split('/')[1]||'de-01',l=store.lesson(id);
 if(!l)return '<div class="glass panel-pad">გაკვეთილი ვერ მოიძებნა. <a href="#/learn">კურსები →</a></div>';
 if(currentId!==id){currentId=id;const d=store.user.drafts?.[id];step=Math.max(0,Math.min(2,d?.step||0));wordIndex=Math.min(l.wordIds.length-1,d?.wordIndex||0);answers=d?.answers||{};saved=false;earnedXp=0;}
 if(!store.isUnlocked(l))return '<div class="glass panel-pad">🔒 ჯერ დაასრულე წინა გაკვეთილი. <a href="#/learn">გაკვეთილების სია →</a></div>';
 const content=[wordBlock,dialogueBlock,quizBlock,resultBlock][step](l);
 return `${pageTop(`გაკვეთილი ${l.number}: ${l.title}`,'','#/learn')}<p class="page-description">${esc(l.level)} · ${l.wordIds.length} სიტყვა · ${l.xp||40} XP</p>
 <div class="lesson-stepper">${stages.map((name,i)=>`<button class="step ${step===i?'active':''}" data-action="stage" data-index="${i}" ${i>step?'disabled':''}><span class="icon-btn">${['📖','💬','✅','🏆'][i]}</span><span>${name}</span></button>`).join('')}</div>
 <div class="lesson-progress">${meter(Math.round(100*(step+1)/4))}</div><div class="lesson-stage">${content}</div>
 <div class="lesson-actions">${step>0&&step<3?'<button class="btn btn-light" data-action="prev-stage">← უკან</button>':''}
 <button class="btn btn-green btn-large" data-action="next-stage">${step===3?'გაკვეთილების სია →':step===2?'შედეგის ნახვა →':'შემდეგი ეტაპი →'}</button></div>`;
 },
 async handle(action,el,refresh){const l=store.lesson(currentId);if(!l)return false;
 if(action==='speak'){const w=store.word(el.dataset.id);if(w)speak(w.term,w.language);return true;}
 if(action==='say-line'){const d=l.dialogue?.[+el.dataset.index];if(d)speak(d.text,l.language);return true;}
 if(action==='prev-word'||action==='next-word'){wordIndex=Math.max(0,Math.min(l.wordIds.length-1,wordIndex+(action==='next-word'?1:-1)));await persist();refresh();return true;}
 if(action==='answer'){answers[el.dataset.index]=el.dataset.answer;await persist();refresh();return true;}
 if(action==='stage'){const to=Number(el.dataset.index);if(to<=step&&!saved){step=to;await persist();refresh();}return true;}
 if(action==='prev-stage'){step=Math.max(0,step-1);await persist();refresh();return true;}
 if(action==='retry'){step=2;answers={};await persist();refresh();return true;}
 if(action==='next-stage'){
  if(step===0&&wordIndex<l.wordIds.length-1){window.peeraToast('ჯერ ნახე ყველა სიტყვა');return true;}
  if(step===2){if(Object.keys(answers).length<total(l)){window.peeraToast('უპასუხე ყველა კითხვას');return true;}
   if(passed(l)&&!saved){earnedXp=await store.completeLesson(l,scoreOf(l),total(l),answers);saved=true;delete store.user.drafts?.[currentId];await store.save();}}
  if(step===3){location.hash='#/learn';return true;}
  step+=1;await persist();refresh();return true;
 }
 return false;}
};
