import {state} from '../core/state.js';
import {esc,meter,percent,optionsFor,speak} from '../core/utils.js';
import {heading} from '../core/chrome.js';
let activeId='',draft={},result=null;
const steps=['სიტყვები','გრამატიკა','დიალოგი','ტესტი','შედეგი'];
function ensure(id){if(activeId===id)return;activeId=id;draft={stage:0,wordIndex:0,answers:{},...(state.user.draft[id]||{})};result=null;}
function vocab(lesson){const word=state.word(lesson.word_ids[draft.wordIndex]);if(!word)return '<div class="empty">სიტყვა ვერ მოიძებნა</div>';return `<div class="card" style="text-align:center">
 <span class="pill">სიტყვა ${draft.wordIndex+1}/${lesson.word_ids.length}</span><div class="flash-card" style="min-height:290px;margin:16px 0">
 <h2 class="flash-term">${esc(word.term)}</h2><p class="flash-hint">${esc(word.phonetic)}</p><p class="flash-translation">${esc(word.translation)}</p><p class="muted">${esc(word.example)}</p><p class="tiny">${esc(word.example_ge)}</p>
 <button class="btn btn-quiet" data-action="speak" data-id="${word.id}">♫ მოსმენა</button></div>
 <div class="inline" style="justify-content:space-between"><button class="btn btn-outline" data-action="word-prev" ${draft.wordIndex===0?'disabled':''}>← წინა</button><span class="muted tiny">წაიკითხე და მოუსმინე თითოეულ სიტყვას</span><button class="btn btn-primary" data-action="word-next">${draft.wordIndex+1===lesson.word_ids.length?'გრამატიკაზე გადასვლა':'შემდეგი →'}</button></div></div>`;}
function grammar(l){return `<article class="card stack"><span class="pill">გრამატიკის ძირითადი წესი</span><h2>ნაბიჯი 2 — გრამატიკა</h2><p style="font-size:15px;line-height:2;white-space:pre-line">${esc(l.grammar).replaceAll('**','')}</p><div class="notice">შენ შეგიძლია წესს მოგვიანებით გრამატიკის განყოფილებიდანაც დაუბრუნდე.</div><div class="inline" style="justify-content:space-between"><button class="btn btn-outline" data-action="stage-prev">← უკან</button><button class="btn btn-primary" data-action="stage-next">დიალოგზე გადასვლა →</button></div></article>`;}
function dialogue(l){return `<article class="card"><div class="inline" style="justify-content:space-between"><div><span class="pill">საუბარი რეალურ სიტუაციაში</span><h2 style="margin-top:8px">მოკლე დიალოგი</h2></div><button class="btn btn-outline btn-sm" data-action="say-dialogue">♫ მთელი დიალოგი</button></div>
 ${l.dialogue.map((x,i)=>`<div class="dialogue-line ${i%2?'alt':''}"><b>${esc(x.speaker)}</b><p>${esc(x.text)}</p><small>${esc(x.translation)}</small><button class="btn btn-quiet btn-sm" data-action="say-line" data-index="${i}" style="margin-top:8px">♫ მოსმენა</button></div>`).join('')}
 <div class="inline" style="justify-content:space-between;margin-top:20px"><button class="btn btn-outline" data-action="stage-prev">← უკან</button><button class="btn btn-primary" data-action="stage-next">ტესტზე გადასვლა →</button></div></article>`;}
function quiz(l){
 const questions=l.word_ids.slice(0,5).map(id=>state.word(id));const n=questions.length;
 const answered=questions.filter(w=>draft.answers[w.id]).length;
 if(answered===n && draft.questionIndex===undefined)return `<article class="card"><span class="pill">ყველა პასუხი არჩეულია</span><h2 style="margin:13px 0">გადაამოწმე შენი პასუხები</h2><p class="muted">შეგიძლია დაბრუნდე ნებისმიერ კითხვაზე და შეცვალო პასუხი.</p><div style="margin:16px 0">${questions.map((w,i)=>`<div class="list-row"><span class="ico">${i+1}</span><div class="row-main"><b>${esc(w.term)}</b><small>შენი პასუხი: ${esc(draft.answers[w.id])}</small></div><button class="btn btn-outline btn-sm" data-action="quiz-edit" data-index="${i}">შეცვლა</button></div>`).join('')}</div><div class="inline" style="justify-content:space-between"><button class="btn btn-outline" data-action="stage-prev">← უკან</button><button class="btn btn-primary" data-action="stage-next">შედეგის ნახვა →</button></div></article>`;
 const q=questions[draft.questionIndex??Math.max(0,questions.findIndex(w=>!draft.answers[w.id]))]||questions.at(-1);
 const index=questions.indexOf(q),selected=draft.answers[q.id];
 return `<article class="card"><div class="inline" style="justify-content:space-between"><span class="pill">ცოდნის შემოწმება</span><span class="muted tiny">${answered}/${n} პასუხი</span></div><h2 style="margin-top:14px">რას ნიშნავს „${esc(q.term)}“?</h2><p class="muted">აირჩიე ერთი სწორი ქართული თარგმანი</p>
 <div class="quiz-options">${optionsFor(q,questions,index).map(op=>`<button class="quiz-opt ${selected===op?'selected':''}" data-action="choose" data-id="${q.id}" data-value="${esc(op)}">${esc(op)}</button>`).join('')}</div><div class="inline" style="justify-content:space-between"><button class="btn btn-outline" data-action="stage-prev">← დიალოგი</button><button class="btn btn-primary" data-action="stage-next">${answered>=n?'პასუხების გადამოწმება':'შემდეგი კითხვა'} →</button></div></article>`;
}
function score(l){return l.word_ids.slice(0,5).filter(id=>draft.answers[id]===state.word(id).translation).length;}
function outcome(l){const total=Math.min(5,l.word_ids.length),correct=result?.score??score(l),pct=percent(correct,total);return `<article class="card stack" style="text-align:center;max-width:640px;margin:auto"><div style="font-size:52px">${pct>=80?'🎉':'📘'}</div><h2>${pct>=80?'გაკვეთილი შესრულებულია!':'გაკვეთილი დასრულდა'}</h2><p class="muted">სწორი პასუხები: ${correct}/${total}</p>${meter(pct,'green')}<div class="pill amber" style="align-self:center">✦ +${result?.xp??0} XP</div><div class="stack" style="text-align:left;margin-top:14px">${l.word_ids.slice(0,5).map(id=>{const w=state.word(id),ok=draft.answers[id]===w.translation;return `<div class="list-row"><span class="ico ${ok?'green':'amber'}">${ok?'✓':'!'}</span><span class="row-main"><b>${esc(w.term)} → ${esc(w.translation)}</b><small>${ok?'სწორი პასუხი':`შენი პასუხი: ${esc(draft.answers[id]||'არ უპასუხია')}`}</small></span></div>`}).join('')}</div><div class="cols-even"><a href="#/courses" class="btn btn-primary">ყველა გაკვეთილი</a><a href="#/cards" class="btn btn-success">სიტყვების გამეორება</a></div></article>`;}
export default {render(r){const l=state.lesson(r.id);if(!l)return `<div class="empty"><b>გაკვეთილი ვერ მოიძებნა</b><a class="btn btn-primary" href="#/courses">კურსებში დაბრუნება</a></div>`;
 ensure(l.id);const prev=state.lessons(l.course_id)[l.order-2];if(prev&&!state.user.completed[prev.id]&&!state.user.completed[l.id])return `<div class="empty"><b>🔒 ეს გაკვეთილი ჯერ ჩაკეტილია</b><p>ჯერ დაასრულე წინა გაკვეთილი.</p><a href="#/courses" class="btn btn-primary">სასწავლო გზა</a></div>`;
 return `<div class="study-panel">${heading(`${l.order}. ${l.title}`,l.summary,`<a class="btn btn-outline btn-sm" href="#/courses">← კურსები</a>`)}<div class="inline" style="margin-bottom:8px;justify-content:space-between"><span class="tiny">გაკვეთილის ეტაპები</span><span class="tiny">${draft.stage+1} / 5</span></div><div class="lesson-stage">${steps.map((s,i)=>`<div title="${s}" class="stage-segment ${i<=draft.stage?'done':''}"></div>`).join('')}</div>
 <div style="margin-bottom:20px" class="tabs">${steps.map((s,i)=>`<button class="tab ${i===draft.stage?'active':''}" data-action="stage-jump" data-index="${i}" ${i>draft.stage?'disabled':''}>${s}</button>`).join('')}</div>
 ${[()=>vocab(l),()=>grammar(l),()=>dialogue(l),()=>quiz(l),()=>outcome(l)][draft.stage]()}<p class="muted tiny" style="text-align:center;margin-top:16px">შენი ადგილი ავტომატურად ინახება ყოველი ნაბიჯის შემდეგ.</p></div>`;},
 async action(a,el,r,render,toast){const l=state.lesson(r.id);ensure(l.id);const save=async()=>{await state.saveDraft(l.id,draft);render()};
 if(a==='speak'){const w=state.word(el.dataset.id);if(!speak(w.term,l.course_id))toast('აუდიო მიუწვდომელია');return true}
 if(a==='say-line'){if(!speak(l.dialogue[Number(el.dataset.index)]?.text,l.course_id))toast('აუდიო მიუწვდომელია');return true}
 if(a==='say-dialogue'){if(!speak(l.dialogue.map(x=>x.text).join(' '),l.course_id))toast('აუდიო მიუწვდომელია');return true}
 if(a==='word-prev'){draft.wordIndex=Math.max(0,draft.wordIndex-1);await save();return true}
 if(a==='word-next'){if(draft.wordIndex+1>=l.word_ids.length){draft.stage=1}else draft.wordIndex++;await save();return true}
 if(a==='choose'){draft.answers[el.dataset.id]=el.dataset.value;draft.questionIndex=undefined;await save();return true}
 if(a==='quiz-edit'){draft.questionIndex=Number(el.dataset.index);await save();return true}
 if(a==='stage-jump'){draft.stage=Math.min(draft.stage,Number(el.dataset.index));await save();return true}
 if(a==='stage-prev'){draft.stage=Math.max(0,draft.stage-1);await save();return true}
 if(a==='stage-next'){
  if(draft.stage===3){if(draft.questionIndex!==undefined){draft.questionIndex=undefined;await save();return true}const answers=draft.answers;if(Object.keys(answers).length<Math.min(5,l.word_ids.length)){toast('უპასუხე ყველა კითხვას');return true}
   result=await state.complete(l,answers,score(l),Math.min(5,l.word_ids.length));draft.stage=4;render();toast(`გაკვეთილი შენახულია · +${result.xp} XP`);return true;}
  draft.stage=Math.min(4,draft.stage+1);await save();return true;
 }return false}
};
