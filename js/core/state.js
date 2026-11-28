import {get,put} from './db.js';
import {cloud} from './cloud.js';
import {dayKey} from './utils.js';
const today=()=>new Date().toISOString();
export const blank=()=>({
 language:'de',goal:30,name:'მოსწავლე',shareRank:false,notifications:false,sounds:true,
 xp:0,streak:0,bestStreak:0,lastActive:null,daily:{},cards:{},completed:{},
 draft:{},favorites:[],recent:[],reviews:0,correct:0,verifiedXp:0,createdAt:today()
});
export const state={
 catalog:{courses:[],words:[],lessons:[]},user:blank(),status:'loading',syncError:'',isGuest:true,ready:false,
 async init(){
  const [courses,lessons,words]=await Promise.all(['courses','lessons','words'].map(async key=>{
   const r=await fetch(`./data/${key}.json`,{cache:'no-cache'});if(!r.ok)throw Error(`ვერ ჩაიტვირთა ${key}.json`);return r.json();
  }));this.catalog={courses,lessons,words};
  const linked=await cloud.init();if(linked){try{this.catalog=await cloud.catalog();this.status='online'}catch(e){this.status='offline';this.syncError=e.message}}else{this.status='offline';this.syncError=cloud.error}
  await this.loadUser();this.ready=true;
 },
 async loadUser(){
  this.isGuest=!cloud.user;
  if(cloud.user){
   const key='signed:'+cloud.user.id;
   try{const remote=await cloud.getState();this.user={...blank(),...(remote||{})};const profile=await cloud.getProfile();
    if(profile){this.user.name=profile.display_name;this.user.shareRank=profile.share_rank;}
    if(!remote)await cloud.saveState(this.user);await put(key,this.user);this.syncError='';
   }catch(e){this.syncError=e.message;this.user={...blank(),...(await get(key)||{})}}
  }else this.user={...blank(),...(await get('guest')||{})};
 },
 async persist(){
  const key=this.isGuest?'guest':'signed:'+cloud.user?.id;await put(key,this.user);
  if(!this.isGuest){try{await cloud.saveState(this.user);this.syncError=''}catch(e){this.syncError='სინქრონიზაცია ვერ შესრულდა: '+e.message;throw e}}
 },
 get course(){return this.catalog.courses.find(c=>c.id===this.user.language)||this.catalog.courses[0]},
 lessons(course=this.user.language){return this.catalog.lessons.filter(l=>l.course_id===course).sort((a,b)=>a.order-b.order)},
 words(course=this.user.language){return this.catalog.words.filter(w=>w.course_id===course)},
 word(id){return this.catalog.words.find(w=>w.id===id)},
 lesson(id){return this.catalog.lessons.find(l=>l.id===id)},
 nextLesson(course=this.user.language){return this.lessons(course).find(l=>!this.user.completed[l.id])||null},
 progress(course=this.user.language){const l=this.lessons(course);return {done:l.filter(x=>this.user.completed[x.id]).length,total:l.length}},
 learned(){return Object.values(this.user.cards).filter(c=>c.reps>0).length},
 due(){return this.words().filter(w=>this.user.cards[w.id]&&new Date(this.user.cards[w.id].due)<=new Date())},
 newWords(){return this.words().filter(w=>!this.user.cards[w.id])},
 queue(){return [...this.due(),...this.newWords().slice(0,10)]},
 dailyXp(key=dayKey()){return this.user.daily[key]||0},
 addXp(amount){if(amount<=0)return;const k=dayKey();const prev=new Date();prev.setDate(prev.getDate()-1);
  if(this.user.lastActive!==k){this.user.streak=this.user.lastActive===dayKey(prev)?this.user.streak+1:1;this.user.bestStreak=Math.max(this.user.streak,this.user.bestStreak);this.user.lastActive=k}
  this.user.xp+=amount;this.user.daily[k]=(this.user.daily[k]||0)+amount;
 },
 async review(word,grade){const old=this.user.cards[word.id]||{reps:0,interval:0,ease:2.5};const day=[1/1440,1,3,7];const interval=grade===0?day[0]:old.reps?Math.max(1,old.interval)*(grade===1?1.25:grade===2?2.3:3.1):day[grade];
  this.user.cards[word.id]={reps:grade===0?0:old.reps+1,interval,ease:Math.max(1.3,old.ease+(grade===0?-.2:grade===3?.1:0)),due:new Date(Date.now()+interval*864e5).toISOString(),lastGrade:grade};
  this.user.reviews++;if(grade>=2)this.user.correct++;const xp=grade>=2?5:0;this.addXp(xp);await this.persist();return xp;
 },
 async saveDraft(lessonId,data){this.user.draft[lessonId]=data;await this.persist()},
 async complete(lesson,answers,score,total){if(this.user.completed[lesson.id])return {xp:0,score};
  let xp=score*5+15;
  if(!this.isGuest){const result=await cloud.completeLesson(lesson.id,answers);if(result?.score!=null){score=result.score;xp=result.xp||0;this.user.verifiedXp+=xp}}
  this.user.completed[lesson.id]={score,total,at:today()};delete this.user.draft[lesson.id];this.addXp(xp);await this.persist();return {xp,score};
 },
 async toggleFavorite(id){const s=new Set(this.user.favorites);s.has(id)?s.delete(id):s.add(id);this.user.favorites=[...s];await this.persist()},
 async setLanguage(code){if(!this.catalog.courses.some(c=>c.id===code))return;this.user.language=code;await this.persist()},
 async update(fields){Object.assign(this.user,fields);await this.persist();if(!this.isGuest&&(fields.name!==undefined||fields.shareRank!==undefined))await cloud.saveProfile({name:this.user.name,shareRank:this.user.shareRank})},
 async reset(){this.user=blank();await this.persist()},
};
