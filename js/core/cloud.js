import * as cache from './db.js';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './cloud-config.js';
const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
let client=null,account=null,initialized=false,lastError='';
const authStorage={
  async getItem(key){return (await cache.get('supabase:auth:'+key))??null},
  async setItem(key,value){await cache.set('supabase:auth:'+key,value)},
  async removeItem(key){await cache.remove('supabase:auth:'+key)}
};
function loadSdk(){
  if(window.supabase?.createClient)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=SDK;script.async=true;
    const timer=setTimeout(()=>{script.remove();reject(Error('Supabase SDK ვერ ჩაიტვირთა'))},6500);
    script.onload=()=>{clearTimeout(timer);window.supabase?.createClient?resolve():reject(Error('Supabase SDK გაუმართავია'))};
    script.onerror=()=>{clearTimeout(timer);reject(Error('Supabase CDN მიუწვდომელია'))};
    document.head.append(script);
  });
}
export const cloud={
 get available(){return !!client},get user(){return account},get error(){return lastError},
 async init(){
  if(initialized)return !!client;initialized=true;
  try{
   await loadSdk();
   client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
     auth:{storage:authStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
   });
   const {data,error}=await client.auth.getSession();if(error)throw error;
   account=data.session?.user??null;
   client.auth.onAuthStateChange((event,session)=>{
     const previous=account?.id??null;account=session?.user??null;
     if(previous!==(account?.id??null))queueMicrotask(()=>window.dispatchEvent(new Event('peera:auth')));
   });
   return true;
  }catch(error){lastError=error.message;console.warn('Supabase:',lastError);client=null;return false}
 },
 async readCatalog(){
  if(!client)throw Error(lastError||'Supabase მიუწვდომელია');
  const groups={};const size=500;
  for(let from=0;;from+=size){
    const {data,error}=await client.from('peera_catalog').select('kind,id,data')
      .order('kind').order('position').order('id').range(from,from+size-1);
    if(error)throw error;
    for(const row of data||[]){(groups[row.kind]??=[]).push(row.data)}
    if((data||[]).length<size)break;
  }
  if(!groups.words?.length||!groups.lessons?.length)throw Error('კატალოგი ცარიელია');
  for(const key of ['profile','stats','settings'])if(groups[key]?.length)groups[key]=groups[key][0];
  return groups;
 },
 async readProgress(){
  if(!client||!account)return null;
  const {data,error}=await client.from('peera_progress').select('data').eq('user_id',account.id).maybeSingle();
  if(error)throw error;return data?.data??null;
 },
 async writeProgress(progress){
  if(!client||!account)throw Error('ანგარიშში შესვლა აუცილებელია');
  const {error}=await client.from('peera_progress').upsert({
    user_id:account.id,data:progress,updated_at:new Date().toISOString()
  },{onConflict:'user_id'});
  if(error)throw error;
 },
 async readLeaderboard(){
  if(!client||!account)throw Error('შესვლა აუცილებელია');
  const {data,error}=await client.rpc('peera_read_leaderboard');
  if(error)throw error;
  return data||[];
 },
 async setLeaderboardProfile(name,visible){
  if(!client||!account)throw Error('შესვლა აუცილებელია');
  const {error}=await client.from('peera_ranking_profiles').upsert({user_id:account.id,display_name:String(name||'მოსწავლე').slice(0,40),visible:!!visible,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)throw error;
 },
 async submitQuiz(lessonId,answers){
  if(!client||!account)throw Error('შესვლა აუცილებელია');
  const {data,error}=await client.rpc('peera_score_lesson',{p_lesson_id:lessonId,p_answers:answers});
  if(error)throw error;
  return data;
 },
 async submitFeedback(category,message){
  if(!client||!account)throw Error('შესვლა აუცილებელია');
  const {error}=await client.from('peera_feedback').insert({user_id:account.id,category,message});
  if(error)throw error;
 },
 async signIn(email,password){
  if(!client)throw Error(lastError||'Supabase მიუწვდომელია');
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error)throw error;account=data.user??null;return data;
 },
 async signUp(email,password){
  if(!client)throw Error(lastError||'Supabase მიუწვდომელია');
  const {data,error}=await client.auth.signUp({email,password});
  if(error)throw error;account=data.session?.user??null;return data;
 },
 async signOut(){
  if(!client)return;
  const {error}=await client.auth.signOut();if(error)throw error;account=null;
 }
};
