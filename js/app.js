import {state} from './core/state.js';
import {frame} from './core/chrome.js';
import {esc} from './core/utils.js';
import home from './views/home.js';
import courses from './views/courses.js';
import lesson from './views/lesson.js';
import practice from './views/practice.js';
import cards from './views/cards.js';
import dictionary from './views/dictionary.js';
import results from './views/results.js';
import profile from './views/profile.js';
import auth from './views/auth.js';
import extras from './views/extras.js';
import {cloud} from './core/cloud.js';
const views={home,courses,lesson,practice,cards,dictionary,results,profile,auth,word:dictionary,grammar:extras,listening:extras,games:extras,plan:extras,achievements:extras,leaderboard:extras,feedback:extras};
const app=document.getElementById('app');
const route=()=>{const seg=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('?')[0]||'home').split('/');return {name:seg[0]||'home',id:seg[1]||''}};
let lastRoute='';let toastTimer;
export function toast(message){
 const old=document.querySelector('.toast');old?.remove();clearTimeout(toastTimer);
 const el=document.createElement('div');el.className='toast';el.role='status';el.textContent=message;document.body.append(el);toastTimer=setTimeout(()=>el.remove(),3200);
}
function render(keepFocus=false){
 const r=route(),view=views[r.name]||home;
 const input=keepFocus?document.activeElement?.dataset?.input:null;const caret=keepFocus&&input?document.activeElement.selectionStart:null;
 try{app.innerHTML=frame(view.render(r),r.name)}catch(e){console.error(e);app.innerHTML=frame(`<div class="empty"><b>გვერდის ჩატვირთვა ვერ მოხერხდა</b><p>${esc(e.message)}</p><a href="#/home" class="btn btn-primary">მთავარზე დაბრუნება</a></div>`,r.name)}
 if(input){const field=app.querySelector(`[data-input="${input}"]`);field?.focus();if(field&&caret!=null)try{field.setSelectionRange(caret,caret)}catch{}}
 if(lastRoute!==r.name+':'+r.id){lastRoute=r.name+':'+r.id;scrollTo({top:0,behavior:'instant'})}
}
function listen(){
 app.addEventListener('click',async e=>{
  const el=e.target.closest('[data-action]');if(!el)return;
  e.preventDefault();const r=route(),view=views[r.name];
  if(el.disabled)return;
  try{const handled=await view?.action?.(el.dataset.action,el,r,render,toast);if(!handled)console.warn('Unhandled action',r.name,el.dataset.action)}catch(err){console.error(err);toast('შეცდომა: '+err.message)}
 });
 app.addEventListener('submit',async e=>{const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();const r=route();try{await views[r.name]?.submit?.(f,r,render,toast)}catch(err){console.error(err);toast('შეცდომა: '+err.message)}});
 app.addEventListener('input',e=>{const el=e.target;if(!el.dataset.input)return;const r=route();views[r.name]?.input?.(el.dataset.input,el.value,r,()=>render(true))});
 addEventListener('hashchange',()=>render());
 addEventListener('peera:auth',async()=>{if(!state.ready)return;try{await state.loadUser();render();toast(cloud.user?'ანგარიში დაკავშირებულია':'სტუმრის რეჟიმი ჩართულია')}catch(e){toast(e.message)}});
}
(async()=>{listen();try{await state.init();if(!location.hash||location.hash==='#/'){location.hash='#/home'}render()}catch(e){console.error(e);app.innerHTML=`<div class="boot"><b>Peera.My ვერ ჩაიტვირთა</b><p>${esc(e.message)}</p><p>გაუშვი HTTP სერვერი: python -m http.server 8080</p></div>`}})();
