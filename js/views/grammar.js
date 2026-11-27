import {store} from '../core/store.js';
import {esc,art,meter} from '../core/utils.js';
import {pageTop,footer} from '../components/chrome.js';
let answers={};
export default {render(){return `${pageTop('გრამატიკა','📖')}
 <div class="glass panel-pad" style="display:flex;gap:11px;align-items:center">${art('book','image')}<div><h2>გერმანული გრამატიკა</h2><p class="text-small muted">წაიკითხე წესი და შეამოწმე ცოდნა მოკლე ტესტით.</p></div></div>
 ${store.data.grammar.map((g,i)=>`<article class="glass grammar-topic"><h3>${i+1}. ${esc(g.title)}</h3><p>${esc(g.description)}</p><div class="example">${esc(g.example)}<small>${esc(g.translation)}</small></div><p><b>${esc(g.question)}</b></p><div class="quiz-grid">${g.options.map((op,j)=>`<button class="answer ${answers[g.id]===j?(j===g.answer?'correct':'wrong'):''}" data-action="grammar-answer" data-id="${g.id}" data-index="${j}">${esc(op)}</button>`).join('')}</div>${answers[g.id]!==undefined?`<p style="color:${answers[g.id]===g.answer?'green':'#af133f'}">${answers[g.id]===g.answer?'✅ სწორია!':'❌ სცადე კიდევ ერთხელ.'}</p>`:''}</article>`).join('')}${footer()}`},
 handle(action,el,refresh){if(action==='grammar-answer'){answers[el.dataset.id]=Number(el.dataset.index);refresh();return true;}return false;}}
