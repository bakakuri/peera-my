import {esc,icon,number} from '../core/utils.js';
import {store} from '../core/store.js';
import {cloud} from '../core/cloud.js';

export const primary = [
  ['home','მთავარი','home'],
  ['learn','გაკვეთილები','lessons'],
  ['cards','ბარათები','cards'],
  ['dictionary','ლექსიკონი','dictionary']
];
export const extras = [
  ['progress','ჩემი პროგრესი','progress'],
  ['achievements','მიღწევები','awards'],
  ['leaderboard','რეიტინგი','trophy'],
  ['grammar','გრამატიკა','dictionary'],
  ['listening','მოსმენა და გამოთქმა','speaker'],
  ['plan','სასწავლო გეგმა','calendar'],
  ['games','თამაშები','cards'],
  ['profile','პროფილი და პარამეტრები','profile'],
  ['auth','შესვლა / რეგისტრაცია','profile']
];
const item = ([route,label,ico], current, css='') => `<a href="#/${route}"
  class="${css} ${current===route?'active':''}" ${current===route?'aria-current="page"':''}>
  ${icon(ico)}<span>${esc(label)}</span></a>`;
export function sidebar(route){return `<aside class="desktop-sidebar" aria-label="საიტის მენიუ">
  <a class="sidebar-logo" href="#/home"><span class="logo-mark">P</span><span>Peera<span class="logo-dot">.</span>My</span></a>
  <div class="sidebar-label">სწავლა</div><nav class="sidebar-links">${primary.map(x=>item(x,route,'sidebar-link')).join('')}</nav>
  <div class="sidebar-label">ჩემი სივრცე</div><nav class="sidebar-links">${extras.filter(x=>x[0]!=='auth').map(x=>item(x,route,'sidebar-link')).join('')}</nav>
  <a class="sidebar-account" href="#/${cloud.user?'profile':'auth'}"><span class="account-avatar">${esc((store.profile.name||'მ').charAt(0).toUpperCase())}</span>
   <span><strong>${esc(store.profile.name||'მოსწავლე')}</strong><small>${cloud.user?'ანგარიში დაკავშირებულია':'სტუმრის რეჟიმი'}</small></span><span>›</span></a>
</aside>`;}
export function header(){return `<header class="topbar">
  <a class="brand" href="#/home" aria-label="Peera.My — მთავარი"><span class="brand-mark">P</span><span>Peera<span class="brand-dot">.</span>My</span></a>
  <span class="topbar-tagline">შენი სივრცე ენის შესასწავლად</span>
  <div class="topbar-actions"><span class="streak-pill" aria-label="სასწავლო სერია"><span aria-hidden="true">🔥</span>${store.stats.streak} დღე</span>
    <a class="avatar" href="#/profile" title="ჩემი პროფილი" aria-label="პროფილის გახსნა">${esc((store.profile.name||'მ').charAt(0).toUpperCase())}</a>
  </div>
</header>`;}
export function nav(route){const extra=extras.some(x=>x[0]===route);return `<nav class="bottom-nav" aria-label="მთავარი ნავიგაცია">
  ${primary.map(x=>item(x,route,'nav-item')).join('')}
  <button type="button" class="nav-item ${extra?'active':''}" data-action="drawer" aria-label="ყველა დანარჩენი განყოფილების გახსნა" aria-haspopup="dialog">
    <span class="nav-more-icon" aria-hidden="true">☷</span><span>მეტი</span>
  </button></nav>`;}
export function drawer(){return `<div class="drawer-backdrop" data-action="drawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="ყველა განყოფილება">
  <div class="drawer-heading"><div><strong>ყველა განყოფილება</strong><p>აირჩიე, რისი გაკეთება გინდა</p></div><button class="icon-btn drawer-close" data-action="drawer" aria-label="მენიუს დახურვა">✕</button></div>
  <div class="drawer-grid">${extras.map(([r,l,i])=>`<a class="drawer-item" href="#/${r}">${icon(i)}<span>${esc(l)}</span><b>›</b></a>`).join('')}</div>
  <div class="drawer-foot">${cloud.user?'☁️ პროგრესი შენს ანგარიშზე ინახება':'სტუმრის რეჟიმი · პროგრესი ამ მოწყობილობაზე ინახება'}</div>
</aside>`;}
export function pageTop(title,ico='',back='#/home'){return `<div class="page-top">
  <a class="back" href="${back}" aria-label="უკან დაბრუნება">←</a>
  <h1>${esc(title)}</h1>
</div>`;}
export function footer(){return `<p class="page-footer">Peera.My · ${store.source==='supabase'?'სასწავლო მონაცემები Supabase-დან':'სასწავლო მონაცემები JSON-დან'} · ${cloud.user?'პროგრესი სინქრონიზებულია':'სტუმრის რეჟიმი'}</p>`;}
