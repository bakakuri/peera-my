import {store} from '../core/store.js';
import {esc,number,flag} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
import {speak,listen} from '../core/audio.js';
let ui={query:'',lang:'all',level:'all',category:'all',tab:'all',page:1,selected:null};
function filtered(){let list=store.words;
 if(ui.lang!=='all')list=list.filter(w=>w.language===ui.lang);
 if(ui.level!=='all')list=list.filter(w=>w.level===ui.level);
 if(ui.category!=='all')list=list.filter(w=>w.category===ui.category);
 if(ui.tab==='fav')list=list.filter(w=>store.user.favorites.includes(w.id));
 if(ui.tab==='recent')list=list.filter(w=>store.user.recent.includes(w.id));
 if(ui.query){const q=ui.query.toLocaleLowerCase();list=list.filter(w=>[w.term,w.translation,w.phonetic].some(x=>String(x||'').toLocaleLowerCase().includes(q)));}
 return list;
}
function wordRow(w){const fav=store.user.favorites.includes(w.id);
 return `<article class="dict-item"><span class="dict-word-flag" aria-hidden="true">${flag(w.language)}</span>
 <button class="dict-copy" data-action="word-detail" data-id="${esc(w.id)}" aria-label="${esc(w.term)} — სიტყვის დეტალები">
  <strong>${esc(w.term)}</strong><small>${esc(w.phonetic)} · ${esc(w.level)}</small><span>${esc(w.translation)}</span></button>
 <div class="dict-actions"><button class="icon-btn" data-action="speak" data-id="${esc(w.id)}" aria-label="სიტყვის მოსმენა">▶</button>
 <button class="icon-btn ${fav?'selected':''}" data-action="fav" data-id="${esc(w.id)}" aria-label="${fav?'რჩეულებიდან ამოღება':'რჩეულებში დამატება'}">${fav?'★':'☆'}</button></div>
 </article>`;
}
function detail(){const w=store.word(ui.selected);if(!w)return '';
 return `<div class="modal-screen" data-action="close-word" role="presentation"><section class="modal-card word-detail-card" role="dialog" aria-modal="true" aria-label="სიტყვის დეტალები" data-stop>
  <div class="word-detail-head"><span>${flag(w.language)} · ${esc(w.level)}</span><button class="icon-btn" data-action="close-word" aria-label="დახურვა">✕</button></div>
  <h2>${esc(w.term)}</h2><p class="word-phonetic">${esc(w.phonetic)}</p><h3>${esc(w.translation)}</h3>
  <button class="btn btn-purple" data-action="speak" data-id="${esc(w.id)}">▶ გამოთქმის მოსმენა</button>
  ${w.examples?.length?`<div class="word-examples"><h4>გამოყენების მაგალითები</h4>${w.examples.slice(0,3).map(e=>`<p><b>${esc(e.sentence)}</b><small>${esc(e.translation)}</small></p>`).join('')}</div>`:''}
 </section></div>`;
}
function rows(){const list=filtered(),totalPages=Math.max(1,Math.ceil(list.length/15));ui.page=Math.min(ui.page,totalPages);
 return `<div class="dict-list-head"><h2>სიტყვები</h2><span class="dict-count">მოიძებნა: ${number(list.length)}</span></div>
 ${list.length?`<div class="dict-list">${list.slice((ui.page-1)*15,ui.page*15).map(wordRow).join('')}</div>
 <div class="pagination"><button class="btn btn-light" data-action="page-prev" ${ui.page===1?'disabled':''}>← წინა</button><span class="pagination-count">${ui.page} / ${totalPages}</span><button class="btn btn-light" data-action="page-next" ${ui.page===totalPages?'disabled':''}>შემდეგი →</button></div>`:
 `<div class="glass no-results"><h3>სიტყვა ვერ მოიძებნა</h3><p>სცადე სხვა სიტყვა ან შეცვალე ფილტრი.</p><button class="btn btn-light" data-action="reset-filters">ფილტრების გასუფთავება</button></div>`}`;
}
export default {
 render(){const categories=[...new Set(store.words.map(w=>w.category))].filter(Boolean);
 return `${pageTop('ლექსიკონი','','#/home')}<p class="page-description">მოძებნე სიტყვა, ნახე მაგალითები და მოუსმინე სწორ გამოთქმას.</p>
 <div class="search-wrap"><label><span aria-hidden="true">⌕</span><input data-input="search" type="search" value="${esc(ui.query)}" placeholder="მოძებნე სიტყვა ან თარგმანი…" aria-label="სიტყვის ძებნა"></label>
 <button class="icon-btn purple" data-action="microphone" aria-label="ხმოვანი ძებნა">🎤</button></div>
 <div class="filter-row"><select data-change="lang" aria-label="ენა"><option value="all">ყველა ენა</option>${store.data.courses.map(c=>`<option value="${c.id}" ${ui.lang===c.id?'selected':''}>${c.flag} ${esc(c.name)}</option>`).join('')}</select>
 <select data-change="level" aria-label="დონე"><option value="all">ყველა დონე</option>${['A1','A2','B1','B2','C1','C2'].map(v=>`<option value="${v}" ${ui.level===v?'selected':''}>${v}</option>`).join('')}</select>
 <select data-change="category" aria-label="კატეგორია"><option value="all">ყველა კატეგორია</option>${categories.map(c=>`<option value="${esc(c)}" ${ui.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="tab-row dictionary-tabs">${[['all','ყველა სიტყვა'],['fav','★ რჩეულები'],['recent','ბოლოს ნანახი']].map(([id,t])=>`<button class="tab ${ui.tab===id?'active':''}" data-action="tab" data-id="${id}">${t}</button>`).join('')}</div>
 ${rows()}${ui.selected?detail():''}`;
 },
 async handle(action,el,refresh){
  if(action==='tab'){ui.tab=el.dataset.id;ui.page=1;refresh();return true}
  if(action==='word-detail'){ui.selected=el.dataset.id;await store.seen(ui.selected);refresh();return true}
  if(action==='close-word'){ui.selected=null;refresh();return true}
  if(action==='speak'){const w=store.word(el.dataset.id);if(w){speak(w.term,w.language);await store.seen(w.id)}return true}
  if(action==='fav'){await store.favorite(el.dataset.id);refresh();return true}
  if(action==='page-prev'||action==='page-next'){ui.page+=action==='page-prev'?-1:1;refresh();return true}
  if(action==='reset-filters'){ui={query:'',lang:'all',level:'all',category:'all',tab:'all',page:1,selected:null};refresh();return true}
  if(action==='microphone'){const ok=listen((text,error)=>{if(error){window.peeraToast('ხმოვანი ძებნა: '+error);return}ui.query=text;ui.page=1;refresh()},ui.lang==='all'?'de':ui.lang);
   if(!ok)window.peeraToast('ხმოვანი ძებნა ამ ბრაუზერში მიუწვდომელია');return true}
  return false;
 },
 input(name,value,refresh){if(name==='search')ui.query=value;else ui[name]=value;ui.page=1;refresh(true)}
};
