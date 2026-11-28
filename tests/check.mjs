import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import {state,blank} from '../js/core/state.js';
import {frame} from '../js/core/chrome.js';
import home from '../js/views/home.js';import courses from '../js/views/courses.js';
import lesson from '../js/views/lesson.js';import cards from '../js/views/cards.js';
import dictionary from '../js/views/dictionary.js';import practice from '../js/views/practice.js';
import results from '../js/views/results.js';import profile from '../js/views/profile.js';
import auth from '../js/views/auth.js';import extras from '../js/views/extras.js';
globalThis.window={};
for(const key of ['courses','lessons','words'])state.catalog[key]=JSON.parse(readFileSync(new URL(`../data/${key}.json`,import.meta.url),'utf8'));
state.user=blank();state.ready=true;state.isGuest=true;
assert.equal(state.catalog.courses.length,2);assert.equal(state.catalog.lessons.length,14);assert.equal(state.catalog.words.length,132);
const routes=[['home',home],['courses',courses],['lesson',lesson,'de-01'],['practice',practice],['cards',cards],['dictionary',dictionary],['word',dictionary,'de-01-w01'],['results',results],['profile',profile],['auth',auth],['grammar',extras],['listening',extras],['games',extras],['plan',extras],['achievements',extras],['leaderboard',extras],['feedback',extras]];
const styles=['tokens','layout','components','pages','responsive'].map(name=>readFileSync(new URL(`../css/${name}.css`,import.meta.url),'utf8')).join('\n');
mkdirSync(new URL('./renders/',import.meta.url),{recursive:true});
for (const [name,view,id] of routes){
 const html=view.render({name,id:id||''});assert.ok(html.length>100,`empty ${name}`);assert.ok(!html.includes('NaN'),`NaN ${name}`);
 const shell=frame(html,name);assert.ok(shell.includes('bottom-nav'),name);console.log('✓',name,shell.length);
 if(['home','courses','cards','dictionary','results','practice','profile','lesson'].includes(name)){
 const out=`<!DOCTYPE html><html lang="ka"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style></head><body><div id="app">${shell}</div></body></html>`;
 writeFileSync(new URL(`./renders/${name}.html`,import.meta.url),out);
 }
}
const word=state.catalog.words[0];
assert.equal(state.user.xp,0);assert.equal(state.learned(),0);
await state.review(word,2);assert.equal(state.user.xp,5);assert.equal(state.learned(),1);
assert.equal(state.due().length,0);await state.toggleFavorite(word.id);assert.ok(state.user.favorites.includes(word.id));
await state.saveDraft('de-01',{stage:2,wordIndex:4,answers:{}});assert.equal(state.user.draft['de-01'].stage,2);
const l=state.lesson('de-01');let answers={};for(const id of l.word_ids.slice(0,5))answers[id]=state.word(id).translation;
const result=await state.complete(l,answers,5,5);assert.equal(result.score,5);assert.equal(result.xp,40);assert.equal(state.user.xp,45);assert.ok(state.user.completed[l.id]);assert.ok(!state.user.draft[l.id]);
const again=await state.complete(l,answers,5,5);assert.equal(again.xp,0);
console.log('✓ actions, draft, reviews, XP and no duplicate completion');
