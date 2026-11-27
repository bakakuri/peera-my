import {store} from '../core/store.js';
import {esc,icon,number,pill,img} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
let term='week';
function showUsers(){const factor=term==='week'?7:term==='month'?3:1;const list=store.data.leaderboard.map(u=>({...u,xp:Math.round(u.xp/factor)}));list.push({id:'me',name:store.profile.name,avatar:store.profile.avatar||'👩🏻‍🎓',xp:Math.round(store.stats.xp/factor),streak:store.stats.streak});list.sort((a,b)=>b.xp-a.xp);return list;}
export default {render(){const list=showUsers(),podium=[list[1],list[0],list[2]].filter(Boolean);return `${pageTop('რეიტინგი','🏆')}
 <p class="center text-small" style="color:#fff;margin:-6px 0 15px">საუკეთესო მოსწავლეები • საჩვენებელი მონაცემები</p>
 <div class="tab-row">${[['week','კვირეული'],['month','თვიური'],['all','ყველა დროის']].map(([id,t])=>`<button data-action="term" data-id="${id}" class="tab ${term===id?'active':''}">${t}</button>`).join('')}</div>
 <div class="leader-podium">${podium.map((u,i)=>`<div class="leader-person ${i===1?'first':i===2?'third':''}"><div class="head">${u.avatar}</div><span class="person-name">${esc(u.name)}</span><span class="xp">⭐ ${number(u.xp)} XP</span><div class="pedestal">${i===1?'1':i===0?'2':'3'}</div></div>`).join('')}</div>
 <div class="glass panel-pad">${list.slice(3).map((u,i)=>`<div class="glass-soft leader-row ${u.id==='me'?'mine':''}"><b>${i+4}</b><div class="head">${u.avatar}</div><div><b>${esc(u.name)} ${u.id==='me'?'(მე)':''}</b><br><small>🔥 ${u.streak} დღე</small></div><b>⭐ ${number(u.xp)} XP</b></div>`).join('')}</div>
 <div class="notice">🔎 ეს არის ადგილობრივი JSON დემო-რეიტინგი. სხვა ადამიანების ცოცხალი მონაცემები არ გამოიყენება.</div>`},handle(action,el,refresh){if(action==='term'){term=el.dataset.id;refresh();return true;}return false;}}
