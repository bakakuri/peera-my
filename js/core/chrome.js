import {state} from './state.js';
import {cloud} from './cloud.js';
import {esc,icon,flag} from './utils.js';
export const mainLinks=[['home','მთავარი'],['courses','კურსები'],['practice','პრაქტიკა'],['dictionary','ლექსიკონი'],['results','შედეგები']];
export const extras=[['cards','ბარათები'],['grammar','გრამატიკა'],['listening','მოსმენა'],['games','თამაშები'],['plan','სასწავლო გეგმა'],['achievements','მიღწევები'],['leaderboard','რეიტინგი'],['profile','პროფილი'],['feedback','დახმარება']];
export const sections={lesson:'courses',cards:'practice',grammar:'practice',listening:'practice',games:'practice',plan:'practice',achievements:'results',leaderboard:'results',feedback:'profile',auth:'profile',word:'dictionary'};
const navItem=([route,label],current,cls)=>`<a class="${cls} ${current===route?'active':''}" href="#/${route}" ${current===route?'aria-current="page"':''}><span class="navico" aria-hidden="true">${icon(route)}</span><span>${label}</span></a>`;
export function frame(view,route){
 const active=sections[route]||route;
 return `<div class="shell"><aside class="side" aria-label="მთავარი მენიუ">
 <a class="brand" href="#/home"><span class="brand-mark">P</span><span>Peera<span class="brand-dot">.</span>My</span></a>
 <nav class="side-links">${mainLinks.map(x=>navItem(x,active,'side-link')).join('')}</nav>
 <div><p class="side-caption">სასწავლო ინსტრუმენტები</p><nav class="side-links">${extras.map(x=>navItem(x,route,'side-link')).join('')}</nav></div>
 <div class="side-bottom"><a class="side-link" href="#/${cloud.user?'profile':'auth'}"><span class="navico">◉</span><span>${cloud.user?'ჩემი ანგარიში':'შესვლა / რეგისტრაცია'}</span></a><p class="side-sub">ყოველდღე ერთი პატარა ნაბიჯი. <br>მეტი თავდაჯერება საუბარში.</p></div></aside>
 <div class="main-wrap"><header class="topbar"><div class="topbar-left"><a href="#/home" class="brand mobile-brand"><span class="brand-mark">P</span><span>Peera<span class="brand-dot">.</span>My</span></a><div class="topbar-eyebrow">შენი პირადი სასწავლო სივრცე</div></div>
 <div class="topbar-actions"><span class="pill gray">${flag(state.user.language)} ${esc(state.course?.level||'A1')}</span><span class="pill amber">✦ ${state.user.xp} XP</span><a class="profile-avatar" href="#/profile" aria-label="პროფილი">${esc((state.user.name||'მ').charAt(0).toUpperCase())}</a></div></header>
 <main id="main-content" class="content" tabindex="-1">${view}</main></div></div>
 <nav class="bottom-nav" aria-label="მობილური ნავიგაცია">${mainLinks.map(x=>navItem(x,active,'nav-tile')).join('')}</nav>`;
}
export const heading=(title,desc='',extra='')=>`<div class="page-head"><div><h1>${esc(title)}</h1>${desc?`<p class="page-sub">${esc(desc)}</p>`:''}</div>${extra}</div>`;
export const section=(title,link='',label='ყველას ნახვა')=>`<div class="section-title"><h2>${title}</h2>${link?`<a href="${link}">${label} →</a>`:''}</div>`;
export function cloudNotice(){
 if(state.isGuest)return `<div class="notice">◉ სტუმრის რეჟიმი — პროგრესი ინახება ამ მოწყობილობაზე. <a href="#/auth"><b>შედით ანგარიშში →</b></a></div>`;
 if(state.syncError)return `<div class="notice danger-notice">☁ სინქრონიზაციის პრობლემა: ${esc(state.syncError)}. მონაცემები შენახულია მოწყობილობაზე.</div>`;
 return `<div class="notice">☁ ანგარიში დაკავშირებულია — პროგრესი სინქრონიზდება Supabase-თან.</div>`;
}
export function tiles(links){return `<div class="tool-grid">${links.map(([url,name,desc,ico,variant])=>`<a class="tool-item" href="#/${url}"><span class="ico ${variant||''}">${ico}</span><span><b>${name}</b><small>${desc}</small></span></a>`).join('')}</div>`;}
export const instruments=[['cards','ბარათები','გამეორება ინტერვალებით','◈','green'],['grammar','გრამატიკა','მოკლე წესები და მაგალითები','Aa',''],['listening','მოსმენა','მოუსმინე და გაიმეორე','♫','blue'],['games','მინი თამაში','შეაერთე სწორი წყვილები','♟','amber']];
