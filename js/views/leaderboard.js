import {store} from '../core/store.js';
import {cloud} from '../core/cloud.js';
import {esc,number} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
let items=[],loading=false,loaded=false,error='';
async function fetchBoard(){if(!cloud.user){items=[];loaded=true;return;}
 loading=true;error='';try{items=await cloud.readLeaderboard();loaded=true;}catch(e){error=e.message;}finally{loading=false;loaded=true;}}
function table(){if(error)return `<p class="notice">რეიტინგი ვერ ჩაიტვირთა: ${esc(error)} <button class="btn btn-light" data-action="rank-retry">ხელახლა ცდა</button></p>`;
 if(loading&&!loaded)return '<p class="notice">რეიტინგი იტვირთება…</p>';
 if(!items.length)return '<div class="glass panel-pad"><h3>რეიტინგში ჯერ მონაწილეები არ არიან</h3><p class="page-description">დაასრულე გაკვეთილები და ჩართე საჯარო მონაწილეობა. გამოგონილი მომხმარებლები არ გამოჩნდებიან.</p></div>';
 return `<div class="glass panel-pad v7-board">${items.map((x,i)=>`<div class="v7-board-row"><span class="v7-board-pos">${i+1}</span><span class="v7-board-avatar">${esc(x.name?.[0]||'მ')}</span><div><strong>${esc(x.name||'მოსწავლე')}</strong><small>${x.lessons} დადასტურებული გაკვეთილი</small></div><b>${number(x.xp)} XP</b></div>`).join('')}</div>`;}
export default {render(){if(!loaded&&!loading)queueMicrotask(()=>{fetchBoard().then(()=>window.dispatchEvent(new Event('peera:board')))});
 const intro=`${pageTop('რეიტინგი','','#/results')}<p class="page-description">რეალური მონაწილეები და მხოლოდ სერვერის მიერ დადასტურებული გაკვეთილების ქულები.</p>`;
 if(!cloud.user)return intro+'<div class="glass panel-pad"><h2>ანგარიში აუცილებელია</h2><p class="page-description">რეიტინგში ჩასართავად შედი შენი ანგარიშით. სტუმრის დემო მონაცემები რეიტინგში არ ხვდება.</p><a href="#/auth" class="btn btn-purple">შესვლა / რეგისტრაცია →</a></div>';
 const opted=!!store.user.preferences?.rankOptIn;
 return intro+`<div class="glass panel-pad"><h3>შენი მონაწილეობა</h3><p class="page-description">${opted?'✅ რეიტინგში მონაწილეობა ჩართულია':'მონაწილეობა სურვილისამებრია და გამორთულია'}</p><button class="btn btn-purple" data-action="rank-opt">${opted?'მონაწილეობის გამორთვა':'რეიტინგში ჩართვა'}</button></div>`+table();
 },async handle(action,el,refresh){if(action==='rank-opt'){const next=!store.user.preferences?.rankOptIn;await cloud.setLeaderboardProfile(store.profile.name,next);store.user.preferences.rankOptIn=next;await store.save();await fetchBoard();refresh();return true;}
 if(action==='rank-retry'){await fetchBoard();refresh();return true;}return false;},
 refreshBoard(){loaded=false;items=[];error='';}};
