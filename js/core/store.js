import * as db from './db.js';
import {cloud} from './cloud.js';
import {dateKey,flag} from './utils.js';
const FILES=['courses','words','lessons','achievements','profile','settings','stats','grammar','listening'];
const today=()=>new Date().toISOString();
const defaultCard=id=>({id,reps:0,interval:0,ease:2.5,dueAt:today(),lastGrade:null});
export const store={
  data:{},user:null, ready:false,
  source:'local',cloudError:'',
  async init(){
    const values=await Promise.all(FILES.map(async key=>{
      const r=await fetch(`data/${key}.json`,{cache:'no-cache'});
      if(!r.ok)throw Error(`JSON ${key}: HTTP ${r.status}`);return r.json();
    }));
    FILES.forEach((key,i)=>this.data[key]=values[i]);
    if(await cloud.init()){
      try{
        const catalog=await cloud.readCatalog();
        for(const key of FILES)if(catalog[key])this.data[key]=catalog[key];
        this.source='supabase';
      }catch(error){this.cloudError=error.message;console.warn('Catalog fallback:',error)}
    }else this.cloudError=cloud.error;
    await this.loadActiveUser();this.ready=true;
  },
  async loadActiveUser(){
    if(cloud.user){
      try{
        const remote=await cloud.readProgress();this.user=remote||this.newSignedUser();
        if(!this.user?.profile||!this.user?.stats)throw Error('დაზიანებული პროფილის მონაცემები');
        if(!remote)await this.save();
      }catch(error){
        this.cloudError=error.message;console.error('Progress:',error);
        const cached=await db.get('cloud-progress:'+cloud.user.id);
        this.user=cached||this.newSignedUser();
      }
    }else{
      this.user=(await db.get('user'))||this.newUser();
      await db.set('user',this.user);
    }
  },
  async reloadAuth(){await this.loadActiveUser()},
  newSignedUser(){
    const profile={...structuredClone(this.data.profile),name:cloud.user?.email?.split('@')[0]||'მოსწავლე',demo:false};
    const stats={...structuredClone(this.data.stats),xp:0,streak:0,bestStreak:0,reviews:0,correct:0,lessons:0,perfect:0,activity:Array(14).fill(0),weekly:Array(7).fill(0)};
    return {profile,stats,cards:{},completed:{},favorites:[],recent:[],daily:{},preferences:{},createdAt:today()};
  },
  newUser(){
    const user=this.newSignedUser();
    user.profile.name='მოსწავლე';
    user.profile.demo=false;
    return user;
  },
  async save(){
    if(cloud.user){
      await db.set('cloud-progress:'+cloud.user.id,this.user);
      await cloud.writeProgress(this.user);
    }else await db.set('user',this.user);
  },
  async draftLesson(id,draft){
    if(!this.user.drafts)this.user.drafts={};
    this.user.drafts[id]=draft;
    await this.save();
  },
  get profile(){return this.user.profile},get stats(){return this.user.stats},
  get words(){return this.data.words},get lessons(){return this.data.lessons},
  get lang(){return this.profile.language},
  lessonsFor(code=this.lang){return this.lessons.filter(l=>l.language===code).sort((a,b)=>a.number-b.number)},
  wordsFor(code=this.lang){return this.words.filter(w=>w.language===code)},
  word(id){return this.words.find(w=>w.id===id)},
  lesson(id){return this.lessons.find(l=>l.id===id)},
  learned(code){return this.words.filter(w=>(!code||w.language===code)&&(this.user.cards[w.id]?.reps||0)>0).length},
  due(code=this.lang){return this.wordsFor(code).filter(w=>{const c=this.user.cards[w.id];return c && new Date(c.dueAt)<=new Date()})},
  queue(code=this.lang){const due=this.due(code).map(x=>x.id),fresh=this.wordsFor(code).filter(x=>!this.user.cards[x.id]).slice(0,10).map(x=>x.id);return [...new Set([...due,...fresh])]},
  courseProgress(code){const lessons=this.lessonsFor(code);const done=lessons.filter(l=>this.user.completed[l.id]).length;return {done,total:lessons.length,percent:lessons.length?Math.round(100*done/lessons.length):0}},
  isUnlocked(lesson){const arr=this.lessonsFor(lesson.language),n=arr.findIndex(l=>l.id===lesson.id);return n===0||!!this.user.completed[arr[n-1]?.id]||!!this.user.completed[lesson.id]},
  async setLanguage(code){if(!this.data.courses.some(c=>c.id===code))return;this.profile.language=code;await this.save()},
  async favorite(id){const f=this.user.favorites;this.user.favorites=f.includes(id)?f.filter(x=>x!==id):[...f,id];await this.save()},
  async seen(id){this.user.recent=[id,...this.user.recent.filter(x=>x!==id)].slice(0,30);await this.save()},
  async grade(word,grade){
    const old=this.user.cards[word.id]||defaultCard(word.id);
    const intervals=[1/1440,1,3,7],reps=grade===0?0:old.reps+1;
    const interval=grade===0?intervals[0]:old.reps?Math.max(1,old.interval)*(grade===1?1.2:grade===2?2.4:3.2):intervals[grade];
    const card={...old,reps,interval,ease:Math.max(1.3,old.ease+(grade===0 ? -0.2 : grade===3 ? 0.12 : 0)),dueAt:new Date(Date.now()+interval*86400000).toISOString(),lastGrade:grade};
    this.user.cards[word.id]=card;
    this.stats.reviews+=1;if(grade>=2)this.stats.correct+=1;
    const xp=grade>=2?10:grade===1?3:0;this.addXp(xp);await this.save();return xp;
  },
  addXp(n){const k=dateKey();if(this.user.lastActive!==k){const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);this.stats.streak=this.user.lastActive===dateKey(yesterday)?this.stats.streak+1:1;this.stats.bestStreak=Math.max(this.stats.bestStreak,this.stats.streak);this.user.lastActive=k;}this.stats.xp+=n;this.user.daily[k]=(this.user.daily[k]||0)+n},
  async completeLesson(lesson,score,total,answers={}){
    const verified=cloud.user?await cloud.submitQuiz(lesson.id,answers):null;
    if(verified && !verified.passed)throw Error('ტესტი ვერ ჩაიბარა. სცადე თავიდან.');
    if(verified){score=verified.score;total=verified.total;}
    const old=this.user.completed[lesson.id];const isNew=!old;
    this.user.completed[lesson.id]={score:Math.max(score,old?.score||0),total,finishedAt:today()};
    if(isNew)this.stats.lessons+=1;
    if(total&&score===total&&(!old||old.score<total))this.stats.perfect+=1;
    const xp=verified?verified.xp:isNew?(score*5+20):0;this.addXp(xp);await this.save();return xp;
  },
  metric(stat){return ({xp:this.stats.xp,streak:this.stats.streak,lessons:Object.keys(this.user.completed).length,reviews:this.stats.reviews,learned:this.learned(),perfect:this.stats.perfect})[stat]||0},
  achievement(a){return {current:Math.min(a.goal,this.metric(a.stat)),done:this.metric(a.stat)>=a.goal}},
  async updateProfile(fields){Object.assign(this.profile,fields);if(cloud.user&&fields.name&&this.user.preferences?.rankOptIn)await cloud.setLeaderboardProfile(fields.name,true);await this.save()},
  async freshStart(){this.user=cloud.user?this.newSignedUser():this.newUser();await this.save()},
  appStatus(){return {words:this.words.length,lessons:this.lessons.length,lang:this.lang,flag:flag(this.lang)}}
};
