import {store} from '../core/store.js';
import {esc,img,icon,art,meter,pct,number,pill} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
function tile(a){const x=store.achievement(a),percentage=pct(x.current,a.goal);return `<div class="glass ach-card ${x.done?'':'locked'}"><div style="font-size:2.7rem;text-align:center;filter:drop-shadow(0 4px 5px #764c9b88)">${a.emoji}</div><div><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p>${meter(percentage,x.done?'':'purple')}<small class="text-muted">${x.current}/${a.goal}</small></div>${x.done?'<span class="done-check">✅</span>':''}</div>`}
export default {render(){const arr=store.data.achievements,done=arr.filter(a=>store.achievement(a).done).length;return `${pageTop('მიღწევები','🏆')}
<div class="ach-hero"><div class="title">⭐ შენი ჯილდოები ⭐</div>${img('girl-cheer.png','girl')}<span class="trophy-emoji" aria-hidden="true">🏆</span><div class="banner-label">დონე ${Math.floor(store.stats.xp/500)+1}</div></div>
<div class="glass summary-strip">${[['🥇',done,'მიღწეული'],['🥈',arr.length-done,'შესასრულებელი'],['🔒',arr.filter(a=>store.achievement(a).current===0).length,'დაბლოკილი']].map(([ico,n,text])=>`<div class="summary-unit"><span style="font-size:2rem">${ico}</span><div><strong>${n}</strong><small>${text}</small></div></div>`).join('')}</div>
<div class="section-heading"><h2>📚 ყველა მიღწევა</h2><span class="muted text-small">${done}/${arr.length}</span></div>
<div class="ach-grid">${arr.map(tile).join('')}</div><a class="awards-promo shine" href="#/leaderboard">${icon('awards-3d','award-art')}<div><strong>რეიტინგი</strong><p>ნახე საუკეთესო მოსწავლეები და<br>შეადარე შენი პროგრესი.</p></div><span class="icon-btn">❯</span></a>`}}
