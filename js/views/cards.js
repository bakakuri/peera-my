import {state} from '../core/state.js';
import {heading} from '../core/chrome.js';
import {esc,meter,percent,speak} from '../core/utils.js';
let queue=null,flipped=false,done=0,sessionXp=0;
function start(){if(!queue){queue=state.queue().map(w=>w.id);flipped=false;done=0;sessionXp=0}}
export default {render(){start();const word=state.word(queue[0]),total=queue.length+done;return `${heading('სასწავლო ბარათები','გადააბრუნე ბარათი და შეაფასე, რამდენად კარგად გახსოვდა სიტყვა.')}
 <div class="study-panel"><div class="cols-3" style="margin-bottom:18px">${[[state.due().length,'გასამეორებელი'],[state.learned(),'ნასწავლი სიტყვა'],[percent(state.user.correct,state.user.reviews)+'%','სწორი პასუხები']].map(([v,l])=>`<div class="metric"><div><b>${v}</b><small>${l}</small></div></div>`).join('')}</div>
 <div class="card" style="margin-bottom:16px"><div class="inline"><b class="grow">დღევანდელი სესია</b><small>${done}/${total}</small></div><div style="margin-top:11px">${meter(percent(done,total))}</div></div>
 ${word?`<button class="flash-card" style="width:100%;cursor:pointer" data-action="flip" aria-label="ბარათის გადაბრუნება"><span class="pill">${esc(state.course.name)} · A1</span>${flipped?`<h2 class="flash-translation">${esc(word.translation)}</h2><p class="muted">${esc(word.term)}</p><p>${esc(word.example)}</p><p class="tiny">${esc(word.example_ge)}</p>`:`<h2 class="flash-term">${esc(word.term)}</h2><p class="flash-hint">${esc(word.phonetic)}</p><p class="muted">შეხება — თარგმანის ნახვა</p>`}<span class="pill gray">↻ გადააბრუნე</span></button>
 <div class="inline" style="justify-content:center;margin:14px 0"><button class="btn btn-quiet" data-action="audio">♫ გამოთქმა</button><button class="btn btn-outline" data-action="flip">${flipped?'სიტყვის ნახვა':'თარგმანის ნახვა'}</button></div>
 <div class="grading">${[['↻','ისევ','1 წთ','bad'],['◷','რთული','1 დღე','hard'],['✓','კარგი','3 დღე','good'],['★','ადვილი','7 დღე','easy']].map(([ico,label,time,cls],i)=>`<button class="grade-btn ${cls}" data-action="grade" data-grade="${i}" ${!flipped?'disabled':''}><span style="font-size:19px">${ico}</span><b>${label}</b><small>${time}</small></button>`).join('')}</div>`:
 `<div class="card" style="text-align:center;padding:40px"><div style="font-size:48px">🎉</div><h2>დღევანდელი სესია დასრულებულია!</h2><p class="muted" style="margin:10px 0 18px">${done} სიტყვა · +${sessionXp} XP</p><div class="inline" style="justify-content:center"><a href="#/results" class="btn btn-outline">ჩემი პროგრესი</a><button class="btn btn-primary" data-action="again">კიდევ ერთხელ</button></div></div>`}</div>`;},
 async action(a,el,r,render,toast){start();const w=state.word(queue[0]);if(a==='again'){queue=null;render();return true}
 if(!w)return false;if(a==='audio'){if(!speak(w.term,w.course_id))toast('აუდიო ბრაუზერში მიუწვდომელია');return true}
 if(a==='flip'){flipped=!flipped;render();return true}if(a==='grade'){if(!flipped)return true;const xp=await state.review(w,Number(el.dataset.grade));sessionXp+=xp;queue.shift();done++;flipped=false;render();if(xp)toast('✦ +'+xp+' XP');return true}return false;
 }};
