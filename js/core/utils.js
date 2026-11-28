export const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
export const dayKey=(date=new Date())=>{const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
export const meter=(n,variant='')=>`<div class="progress ${variant}"><span style="width:${clamp(n)}%"></span></div>`;
export const navUrl=(name,id)=>`#/${name}${id?'/'+encodeURIComponent(id):''}`;
export const langName=code=>code==='de'?'გერმანული':'ინგლისური';
export const flag=code=>code==='de'?'🇩🇪':'🇬🇧';
export const percent=(a,b)=>b?Math.round(100*a/b):0;
export const dateDisplay=k=>new Date(k).toLocaleDateString('ka-GE',{day:'numeric',month:'short'});
export const shuffle=(arr,seed=0)=>[...arr].sort((a,b)=>hash(String(a.id||a)+seed)-hash(String(b.id||b)+seed));
function hash(s){let n=0;for(let i=0;i<s.length;i++)n=((n*31)+s.charCodeAt(i))|0;return n;}
export function speak(text,language='de'){
 if(!('speechSynthesis' in window))return false;
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text));u.lang=language==='de'?'de-DE':'en-GB';u.rate=.83;speechSynthesis.speak(u);return true;
}
export function optionsFor(word,others,index=0){
 const wrong=others.filter(x=>x.id!==word.id&&x.translation!==word.translation).slice(index+1).concat(others.filter(x=>x.id!==word.id));
 const distinct=[...new Set(wrong.map(x=>x.translation))].slice(0,3);
 return shuffle([...distinct,word.translation],index+3);
}
export const icon=(name)=>({'home':'⌂','courses':'▦','practice':'✦','dictionary':'▤','results':'◫','profile':'◉','cards':'◈','listening':'♫','grammar':'Aa','games':'♟','plan':'▣','achievements':'✧','leaderboard':'♛','feedback':'✉','auth':'↗'}[name]||'✦');
