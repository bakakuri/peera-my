import {store} from '../core/store.js';
import {pageTop,footer} from '../components/chrome.js';
import {esc} from '../core/utils.js';
const tools=[
 ['cards','🗂️','ბარათებით სწავლა','ახალი და გასამეორებელი სიტყვები','10–15 წუთი','v7-purple'],
 ['listening','🎧','მოსმენა და გამოთქმა','აუდიო, მნიშვნელობის გამოცნობა და მეტყველება','5–10 წუთი','v7-blue'],
 ['grammar','📖','გრამატიკის სავარჯიშოები','წესები და მათზე დაფუძნებული კითხვები','5–10 წუთი','v7-orange'],
 ['games','🎮','სიტყვების თამაში','შეაწყვილე სიტყვები და მათი მნიშვნელობები','5 წუთი','v7-green'],
 ['plan','📅','ჩემი სასწავლო გეგმა','დღის დავალებები და პროგრესის შემოწმება','ყოველდღე','v7-pink']
];
export default {render(){const due=store.due().length,available=store.queue().length;return `${pageTop('პრაქტიკა')}<p class="page-description">აირჩიე სავარჯიშო. ყველა ღილაკი კონკრეტულ სასწავლო მოქმედებაზე გადაგიყვანს.</p>
<section class="v7-practice-lead"><div><span class="v7-kicker">დღევანდელი პრაქტიკა</span><h2>${due?`${due} სიტყვა გასამეორებელია`:'დაიწყე ახალი სიტყვების სწავლა'}</h2><p>${due?'დროა ადრე ნასწავლი სიტყვები გაიხსენო.':`${available} ახალი სიტყვა მზადაა სასწავლად.`}</p><a class="v7-primary" href="#/cards">▶ ბარათების გახსნა <span>→</span></a></div><img src="assets/3d/book.png" alt="" loading="lazy"></section>
<div class="v7-title-row"><h2>სავარჯიშოები</h2><span class="v7-label">${tools.length} განყოფილება</span></div>
<div class="v7-practice-grid">${tools.map(([route,ico,title,description,duration,theme])=>`<a href="#/${route}" class="v7-practice-card ${theme}"><span class="v7-practice-ico">${ico}</span><strong>${esc(title)}</strong><p>${esc(description)}</p><small>⏱ ${duration}</small><span class="v7-practice-arrow">→</span></a>`).join('')}</div>${footer()}`}}
