import {store} from './core/store.js';
import {header,nav,drawer,sidebar} from './components/chrome.js';
import home from './views/home.js';
import learn from './views/learn.js';
import lesson from './views/lesson.js';
import cards from './views/cards.js';
import dictionary from './views/dictionary.js';
import progress from './views/progress.js';
import achievements from './views/achievements.js';
import leaderboard from './views/leaderboard.js';
import profile from './views/profile.js';
import grammar from './views/grammar.js';
import listening from './views/listening.js';
import plan from './views/plan.js';
import games from './views/games.js';
import notfound from './views/notfound.js';
import practice from './views/practice.js';
import results from './views/results.js';
import support from './views/support.js';
import auth from './views/auth.js';
import {esc} from './core/utils.js';
const views={home,learn,lesson,cards,dictionary,progress,achievements,leaderboard,profile,grammar,listening,plan,games,auth,practice,results,support};
let isDrawer=false;let toastTimer;let lastRoute='';
const root=document.getElementById('app');
const routeOf=()=>location.hash.replace(/^#\//,'').split('?')[0]||'home';
function activeView(route){if(route.startsWith('lesson/')||route.startsWith('lesson-play/')||route.startsWith('quiz/'))return lesson;return views[route]||notfound;}
function currentNav(route){return route.startsWith('lesson')||route.startsWith('quiz')?'learn':route;}
function render(keepFocus=false){
 const route=routeOf();const v=activeView(route);const active=document.activeElement;
 const name=keepFocus?active?.dataset?.input:null;const sel=keepFocus&&name&&active.selectionStart!=null?active.selectionStart:null;
 window.peeraSoundEnabled=store.profile.sound;
 document.body.classList.toggle('reduce-motion',!store.profile.motion);
 root.innerHTML=`<div class="shell">${sidebar(currentNav(route))}<div class="main-column">${header()}<main class="page page--${esc(route.split('/')[0])}" id="page-content">${v.render(route)}</main></div></div>${nav(currentNav(route))}${isDrawer?drawer():''}`;
 document.body.classList.toggle('no-scroll',isDrawer);
 if(name){const next=root.querySelector(`[data-input="${name}"]`);if(next){next.focus();try{next.setSelectionRange(sel,sel)}catch{}}}
 if(lastRoute!==route){window.scrollTo({top:0,behavior:'instant'});lastRoute=route;}
}
function refresh(keepFocus=false){render(keepFocus)}
window.peeraToast=message=>{
 const old=document.querySelector('.toast');if(old)old.remove();clearTimeout(toastTimer);
 const el=document.createElement('div');el.className='toast';el.role='status';el.textContent=message;document.body.appendChild(el);
 toastTimer=setTimeout(()=>el.remove(),3500);
};
root.addEventListener('click',async e=>{
 if(e.target.closest('.drawer-item')){isDrawer=false;setTimeout(()=>render(),0);return;}
 const el=e.target.closest('[data-action]');if(!el)return;
 if(el.dataset.action==='cancel-edit'&&e.target.closest('[data-stop]')&&!e.target.closest('button'))return;
 e.preventDefault();const action=el.dataset.action;
 if(action==='drawer'){isDrawer=!isDrawer;render();return;}
 if(action==='notifications'){window.peeraToast('🔔 ეს არის JSON დემო. რეალური შეტყობინებები ჯერ არ იგზავნება.');return;}
 const route=routeOf(),v=activeView(route);
 try{await v.handle?.(action,el,refresh)}catch(err){console.error(err);window.peeraToast('შეცდომა: '+err.message)}
});
root.addEventListener('submit',e=>{if(['cloud-auth-form','support-form'].includes(e.target.id)){e.preventDefault();const kind=e.target.id==='support-form'?'support-send':'auth-submit';e.target.querySelector(`[data-action="${kind}"]`)?.click()}});
root.addEventListener('input',e=>{const target=e.target;if(target.dataset.input){activeView(routeOf()).input?.(target.dataset.input,target.value,refresh)}});
root.addEventListener('change',async e=>{const t=e.target;if(t.dataset.change)await activeView(routeOf()).input?.(t.dataset.change,t.value,refresh)});
root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('[data-action="flip-card"]')){e.preventDefault();e.target.click()}if(e.key==='Escape'&&isDrawer){isDrawer=false;render()}});
window.addEventListener('peera:auth',async()=>{if(!store.ready)return;try{await store.reloadAuth();render()}catch(error){console.error(error);window.peeraToast('სინქრონიზაცია ვერ მოხერხდა')}});
window.addEventListener('peera:board',()=>{if(routeOf()==='leaderboard')render()});
window.addEventListener('hashchange',()=>{
 const query=location.hash.split('?')[1];if(routeOf()==='learn'&&query){const params=new URLSearchParams(query);const lang=params.get('lang');if(lang)learn.setCourse(lang)}
 isDrawer=false;render();
});
(async()=>{try{await store.init();if(!location.hash||location.hash==='#/'){try{history.replaceState(null,'','#/home')}catch{location.hash='#/home'}}render()}catch(err){console.error(err);root.innerHTML=`<div style="padding:50px;text-align:center;color:white"><h2>საიტი ვერ ჩაიტვირთა</h2><p>${esc(err.message)}</p><p>გაუშვი ლოკალური HTTP სერვერი: <code>python -m http.server 8080</code></p></div>`}})();
