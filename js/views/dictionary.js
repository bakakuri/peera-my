import {state} from '../core/state.js';
import {heading} from '../core/chrome.js';
import {esc,speak,flag} from '../core/utils.js';
let query='',filter='all',page=0;
const PAGE=16;
function results(){let out=state.catalog.words.filter(w=>w.course_id===state.user.language);
 if(filter==='favorites')out=out.filter(w=>state.user.favorites.includes(w.id));
 if(filter==='learned')out=out.filter(w=>state.user.cards[w.id]?.reps>0);
 const q=query.trim().toLocaleLowerCase();if(q)out=out.filter(w=>[w.term,w.translation,w.phonetic,w.example].some(t=>String(t).toLocaleLowerCase().includes(q)));
 return out;
}
function rows(words){return words.map(w=>`<div class="word-item"><span class="word-bullet">Aa</span><a class="grow" href="#/word/${encodeURIComponent(w.id)}"><b>${esc(w.term)}</b><small>${esc(w.phonetic)} · ${esc(w.translation)}</small></a><span class="pill gray">A1</span><div class="word-actions"><button class="icon-btn" data-action="speak" data-id="${w.id}" aria-label="მოსმენა">♫</button><button class="icon-btn ${state.user.favorites.includes(w.id)?'on':''}" data-action="fav" data-id="${w.id}" aria-label="რჩეულებში">${state.user.favorites.includes(w.id)?'★':'☆'}</button></div></div>`).join('');}
export default {render(r){if(r.name==='word'){
 const w=state.word(r.id);if(!w)return '<div class="empty"><b>სიტყვა ვერ მოიძებნა</b><a href="#/dictionary">ლექსიკონი</a></div>';
 return `<div class="study-panel">${heading(w.term,'სიტყვის დეტალური ბარათი',`<a href="#/dictionary" class="btn btn-outline btn-sm">← ლექსიკონი</a>`)}<div class="card stack" style="padding:30px"><span class="pill">${flag(w.course_id)} ${w.level}</span><h1 style="font-size:35px">${esc(w.term)}</h1><p class="muted">${esc(w.phonetic)}</p><h2 style="color:var(--violet)">${esc(w.translation)}</h2><div class="inline"><button class="btn btn-quiet" data-action="speak" data-id="${w.id}">♫ მოსმენა</button><button class="btn btn-outline" data-action="fav" data-id="${w.id}">${state.user.favorites.includes(w.id)?'★ რჩეულებშია':'☆ რჩეულებში'}</button></div><hr class="sep"><h3>მაგალითი</h3><p style="font-size:16px">${esc(w.example)}</p><p class="muted">${esc(w.example_ge)}</p><a class="btn btn-primary" style="justify-self:start" href="#/lesson/${w.lesson_id}">გაკვეთილის ნახვა →</a></div></div>`;
 }
 const rwords=results(),slice=rwords.slice(page*PAGE,(page+1)*PAGE);return `${heading('ლექსიკონი','მოძებნე სიტყვა ქართულად ან სასწავლო ენაზე.')}
 <div class="card"><div class="inline"><input aria-label="სიტყვის ძებნა" class="input grow" placeholder="მაგალითად: Danke ან მადლობა" data-input="word-search" value="${esc(query)}"><span class="pill">${flag(state.user.language)} ${esc(state.course?.name)}</span></div><div class="tabs" style="margin-top:14px">${[['all','ყველა'],['favorites','☆ რჩეულები'],['learned','ნასწავლი']].map(([id,t])=>`<button class="tab ${filter===id?'active':''}" data-action="filter" data-id="${id}">${t}</button>`).join('')}</div></div>
 <section class="section"><div class="section-title"><h2>სიტყვები</h2><span class="muted tiny">${rwords.length} სიტყვა</span></div><div class="card">${slice.length?`<div class="word-list">${rows(slice)}</div>`:'<div class="empty"><b>სიტყვა ვერ მოიძებნა</b><p>შეცვალე ძებნა ან ფილტრი.</p></div>'}
 ${rwords.length>PAGE?`<div class="inline" style="justify-content:space-between;margin-top:17px"><button class="btn btn-outline" data-action="prev" ${page<=0?'disabled':''}>← წინა</button><span class="muted tiny">გვერდი ${page+1} / ${Math.ceil(rwords.length/PAGE)}</span><button class="btn btn-outline" data-action="next" ${(page+1)*PAGE>=rwords.length?'disabled':''}>შემდეგი →</button></div>`:''}</div></section>`;
 },async action(a,el,r,render,toast){if(a==='filter'){filter=el.dataset.id;page=0;render();return true}if(a==='speak'){const w=state.word(el.dataset.id);if(!speak(w.term,w.course_id))toast('აუდიო მიუწვდომელია');return true}
 if(a==='fav'){await state.toggleFavorite(el.dataset.id);render();return true}if(a==='prev'||a==='next'){page+=a==='prev'?-1:1;render();return true}return false},
 input(name,value,r,refresh){if(name==='word-search'){query=value;page=0;refresh()}}
};
