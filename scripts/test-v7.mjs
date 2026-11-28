import fs from 'node:fs';
import {store} from '../js/core/store.js';
import {tabs,sidebar,nav} from '../js/components/chrome.js';
import home from '../js/views/home.js';
import practice from '../js/views/practice.js';
import results from '../js/views/results.js';
import learn from '../js/views/learn.js';
import lesson from '../js/views/lesson.js';
import cards from '../js/views/cards.js';
import dictionary from '../js/views/dictionary.js';
import progress from '../js/views/progress.js';
import profile from '../js/views/profile.js';
import achievements from '../js/views/achievements.js';
import leaderboard from '../js/views/leaderboard.js';
import grammar from '../js/views/grammar.js';
import listening from '../js/views/listening.js';
import plan from '../js/views/plan.js';
import games from '../js/views/games.js';
import auth from '../js/views/auth.js';
import support from '../js/views/support.js';
const root=new URL('../',import.meta.url);
for(const k of ['courses','words','lessons','achievements','profile','settings','stats','grammar','listening']){
 store.data[k]=JSON.parse(fs.readFileSync(new URL('data/'+k+'.json',root),'utf8'));
}
globalThis.window={peeraToast:()=>{},peeraSoundEnabled:true,dispatchEvent:()=>{}};
globalThis.location={hash:'#/home'};
store.user=store.newUser();store.ready=true;store.save=async()=>{};
if(store.stats.xp!==0 || store.stats.streak!==0 || store.learned()!==0) throw Error('Guest demo stats not removed');
const modules={home,learn,practice,results,lesson,cards,dictionary,progress,profile,achievements,leaderboard,grammar,listening,plan,games,auth,support};
for(const [name,view] of Object.entries(modules)){
 const html=view.render(name==='lesson'?'lesson/de-01':name);
 if(!html || html.length<45 || html.includes('undefined</'))throw Error('View broken '+name);
 console.log('PASS route',name,html.length);
}
for(const [id] of tabs)if(!modules[id])throw Error('Missing tab '+id);
if(!nav('home').includes('მთავარი') || !sidebar('home').includes('სასწავლო სივრცე'))throw Error('Navigation missing');
await learn.handle('choose-course',{dataset:{id:'en'}},()=>{});
if(!learn.render().includes('ინგლისური'))throw Error('Course filter failed');
await dictionary.handle('word-detail',{dataset:{id:store.words[0].id}},()=>{});
if(!dictionary.render().includes('word-detail-card'))throw Error('Dictionary detail failed');
await dictionary.handle('close-word',{},()=>{});
const before=store.stats.reviews;cards.render();await cards.handle('flip-card',{},()=>{});await cards.handle('grade',{dataset:{grade:'2'}},()=>{});
if(store.stats.reviews!==before+1)throw Error('SRS progress failed');
let saved=0;store.save=async()=>{saved++};
lesson.render('lesson/de-01');await lesson.handle('next-word',{},()=>{});
if(!store.user.drafts?.['de-01']||saved===0)throw Error('Lesson draft not saved');
console.log('PASS navigation, empty-state stats, dictionary, SRS, resumable lessons');
