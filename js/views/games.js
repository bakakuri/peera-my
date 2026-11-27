import {store} from '../core/store.js';
import {esc,art} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
let cards=null,open=[],matched=new Set(),busy=false;
function init(){const pool=store.wordsFor().slice(0,6);cards=pool.flatMap(w=>[{key:w.id,text:w.term},{key:w.id,text:w.translation}]).sort(()=>Math.random()-.5);open=[];matched=new Set();busy=false;}
export default {render(){if(!cards)init();return `${pageTop('თამაშები და ტესტები','🎮')}<div class="glass panel-pad center">${art('gamepad')}<h2>იპოვე შესაბამისი წყვილები</h2><p class="text-small muted">შეაერთე გერმანული სიტყვა ქართულ თარგმანთან</p><p style="margin:11px 0">${matched.size}/6 წყვილი ნაპოვნია</p>${matched.size===6?'<b>🎉 გამარჯვება! შესანიშნავი მეხსიერება გაქვს.</b>':''}</div>
 <div class="game-board">${cards.map((c,i)=>{const visible=open.includes(i)||matched.has(c.key);return `<button class="game-tile ${visible?matched.has(c.key)?'matched':'':'hidden-game'}" data-action="flip-game" data-index="${i}">${visible?esc(c.text):'<span class="tile-inner">✦</span>'}</button>`}).join('')}</div><div class="center"><button class="btn btn-purple" data-action="restart-game">↻ თავიდან თამაში</button></div>`},
 handle(action,el,refresh){if(action==='restart-game'){init();refresh();return true;}if(action==='flip-game'){
 const i=Number(el.dataset.index),c=cards[i];if(busy||matched.has(c.key)||open.includes(i))return true;
 open.push(i);refresh();if(open.length===2){busy=true;const [a,b]=open;if(a!==b&&cards[a].key===cards[b].key){matched.add(c.key);setTimeout(()=>{open=[];busy=false;refresh()},550)}else{setTimeout(()=>{open=[];busy=false;refresh()},850)}}return true;
 }return false;}}
