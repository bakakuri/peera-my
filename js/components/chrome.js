import {esc,icon,flag} from '../core/utils.js';
import {store} from '../core/store.js';
import {cloud} from '../core/cloud.js';

export const tabs = [
 ['home','მთავარი','home'],
 ['learn','კურსები','lessons'],
 ['practice','პრაქტიკა','cards'],
 ['dictionary','ლექსიკონი','dictionary'],
 ['results','შედეგები','progress']
];
const sub = [
 ['cards','ბარათებით სწავლა','cards','practice'],
 ['listening','მოსმენა და გამოთქმა','speaker','practice'],
 ['grammar','გრამატიკა','dictionary','learn'],
 ['plan','დღიური გეგმა','calendar','practice'],
 ['games','სიტყვების თამაში','cards','practice'],
 ['progress','ჩემი პროგრესი','progress','results'],
 ['achievements','მიღწევები','awards','results'],
 ['leaderboard','რეიტინგი','trophy','results']
];
export const sectionOf=route=>route.startsWith('lesson')||route.startsWith('quiz')?'learn':sub.find(s=>s[0]===route)?.[3]||route;
const link=([href,label,ico],active,css='')=>`<a class="${css}${active===href?' active':''}" href="#/${href}" ${active===href?'aria-current="page"':''}>${icon(ico)}<span>${esc(label)}</span></a>`;
export function sidebar(route){const active=sectionOf(route);return `<aside class="desktop-sidebar" aria-label="ძირითადი მენიუ">
  <a href="#/home" class="sidebar-logo"><span class="logo-mark">P</span><span>Peera<span class="logo-dot">.</span>My</span></a>
  <div class="sidebar-label">სასწავლო სივრცე</div><nav class="sidebar-links">${tabs.map(t=>link(t,active,'sidebar-link')).join('')}</nav>
  <div class="sidebar-label">სწრაფი ბმულები</div><nav class="sidebar-links">${sub.map(t=>link(t,route,'sidebar-link sidebar-sub')).join('')}</nav>
  <a href="#/profile" class="sidebar-account"><span class="account-avatar">${esc((store.profile.name||'მ')[0])}</span><span><strong>${esc(store.profile.name||'მოსწავლე')}</strong><small>${cloud.user?'ანგარიში დაკავშირებულია':'სტუმრის რეჟიმი'}</small></span><span>›</span></a>
 </aside>`}
export function header(){const current=store.data.courses.find(c=>c.id===store.lang);return `<header class="topbar">
  <a class="brand" href="#/home" aria-label="Peera.My — მთავარი"><span class="brand-mark">P</span><span>Peera<span class="brand-dot">.</span>My</span></a>
  <a href="#/learn" class="topbar-language">${current?.flag||flag(store.lang)} <span>${esc(current?.name||'ენა')}</span><b>⌄</b></a>
  <div class="topbar-actions"><a class="streak-pill" href="#/results" title="სასწავლო სერია">🔥 ${store.stats.streak||0} დღე</a>
    <a class="avatar" href="#/profile" title="ჩემი პროფილი" aria-label="პროფილის გახსნა">${esc((store.profile.name||'მ')[0].toUpperCase())}</a></div>
</header>`}
export function nav(route){const active=sectionOf(route);return `<nav class="bottom-nav" aria-label="ქვედა ნავიგაცია">${tabs.map(t=>link(t,active,'nav-item')).join('')}</nav>`}
export function drawer(){return ''}
export function pageTop(title,ico='',back='#/home'){return `<div class="page-top"><a class="back" href="${back}" aria-label="უკან დაბრუნება">←</a><h1>${esc(title)}</h1></div>`}
export function footer(){return `<p class="page-footer">Peera.My · ${store.source==='supabase'?'კატალოგი Supabase-დან':'კატალოგი JSON-დან'} · ${cloud.user?'ანგარიში დაკავშირებულია':'პროგრესი ინახება ამ მოწყობილობაზე'}</p>`}
