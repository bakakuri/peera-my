import {esc,icon,img,number} from '../core/utils.js';
import {store} from '../core/store.js';
import {cloud} from '../core/cloud.js';
const primary=[['home','მთავარი','home'],['learn','სწავლა','lessons'],['dictionary','ლექსიკონი','dictionary'],['achievements','მიღწევები','awards'],['profile','პროფილი','profile']];
export const extras=[['cards','ბარათები','cards-3d'],['progress','პროგრესი','progress-3d'],['leaderboard','რეიტინგი','trophy'],['grammar','გრამატიკა','dictionary-3d'],['listening','მოსმენა','speaker'],['plan','სასწავლო გეგმა','calendar'],['games','თამაშები','star'],['profile','პარამეტრები','settings'],['auth','ანგარიშში შესვლა','profile']];
export function header(){return `<header class="topbar">
  <a class="brand" href="#/home" aria-label="Peera.My მთავარი">${img('logo.png')}</a>
  <span class="streak-pill" title="სწავლის სერია"><span class="fire">🔥</span>${store.stats.streak} დღე</span>
  <button class="orb" aria-label="შეტყობინებები" data-action="notifications">${icon('bell')}<i class="bell-count">1</i></button>
  <a class="avatar" href="#/profile" aria-label="პროფილი">${img('girl-dict.png')}</a>
</header>`}
export function nav(route){return `<nav class="bottom-nav" aria-label="მთავარი ნავიგაცია">${primary.map(([id,label,ico])=>`<a class="nav-item ${id===route?'active':''}" href="#/${id}" ${id===route?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></a>`).join('')}</nav><button class="more-trigger" aria-label="ყველა გვერდის ნახვა" title="ყველა გვერდი" data-action="drawer">+</button>`}
export function drawer(){return `<div class="drawer-backdrop" data-action="drawer"></div><aside class="drawer" role="dialog" aria-label="საიტის ყველა გვერდი"><div style="display:flex;justify-content:space-between;align-items:center"><b>ყველა განყოფილება</b><button class="icon-btn" data-action="drawer" aria-label="დახურვა">✕</button></div><div class="drawer-grid">${extras.map(([id,name,ico])=>`<a class="drawer-item" href="#/${id}" data-drawer-close>${icon(ico)}<span>${name}</span></a>`).join('')}</div><p class="page-footer">${store.source==='supabase'?'Supabase + IndexedDB':'JSON + IndexedDB'} • ${cloud.user?'დაკავშირებული ანგარიში':'სტუმრის რეჟიმი'}</p></aside>`}
export function pageTop(title,ico='',back='#/home'){return `<div class="page-top"><a class="back" href="${back}" aria-label="უკან">‹</a><h1>${ico?`<span>${ico}</span> `:''}${esc(title)}</h1></div>`}
export function footer(){return `<p class="page-footer">Peera.My • ${store.source==='supabase'?'Supabase კატალოგი':'ლოკალური JSON კატალოგი'} • ${cloud.user?'პროგრესი ღრუბელშია':'სტუმრის პროგრესი ამ მოწყობილობაზეა'}</p>`}
