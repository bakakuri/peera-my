import {get,put,remove} from './db.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,SUPABASE_UMD} from './config.js';
const authStore={getItem:async key=>(await get('auth:'+key))??null,setItem:(key,value)=>put('auth:'+key,value),removeItem:key=>remove('auth:'+key)};
let sb,activeUser,error='',initialised=false;
const loadSdk=()=>new Promise((resolve,reject)=>{
 if(window.supabase?.createClient)return resolve();
 const script=document.createElement('script');script.src=SUPABASE_UMD;script.async=true;
 const timeout=setTimeout(()=>{script.remove();reject(Error('Supabase SDK ვერ ჩაიტვირთა'))},4800);
 script.onload=()=>{clearTimeout(timeout);window.supabase?.createClient?resolve():reject(Error('Supabase SDK მიუწვდომელია'))};
 script.onerror=()=>{clearTimeout(timeout);reject(Error('Supabase CDN მიუწვდომელია'))};document.head.append(script);
});
export const cloud={
 get online(){return !!sb},get user(){return activeUser},get error(){return error},
 async init(){
  if(initialised)return !!sb;initialised=true;
  try{
   await loadSdk();sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{storage:authStore,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
   });
   const {data,error:e}=await sb.auth.getSession();if(e)throw e;
   activeUser=data.session?.user??null;
   sb.auth.onAuthStateChange((_type,session)=>{
    const before=activeUser?.id??null;activeUser=session?.user??null;
    if(before!==(activeUser?.id??null))queueMicrotask(()=>dispatchEvent(new Event('peera:auth')));
   });return true;
  }catch(e){error=e.message;sb=null;return false}
 },
 async catalog(){
  if(!sb)return null;
  const kinds=['courses','lessons','words'],result={};
  for(const kind of kinds){
   let rows=[];for(let start=0;;start+=500){
    const {data,error:e}=await sb.from(kind).select('*').order(kind==='courses'?'id':kind==='words'?'sort':'sort').range(start,start+499);
    if(e)throw e;rows.push(...data);if(data.length<500)break;
   }
   result[kind]=rows.map(x=>kind==='courses'?{...x,lessonCount:x.lesson_count}:kind==='lessons'?{...x,order:x.sort,word_ids:x.word_ids,dialogue:x.dialogue}: {...x,order:x.sort});
  }
  if(!result.words.length||!result.lessons.length)throw Error('Supabase კატალოგი ცარიელია');return result;
 },
 async getState(){if(!sb||!activeUser)return null;const {data,error:e}=await sb.from('user_state').select('data').eq('user_id',activeUser.id).maybeSingle();if(e)throw e;return data?.data||null},
 async saveState(state){if(!sb||!activeUser)return false;const {error:e}=await sb.from('user_state').upsert({user_id:activeUser.id,data:state,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(e)throw e;return true},
 async getProfile(){if(!sb||!activeUser)return null;const {data,error:e}=await sb.from('learner_profiles').select('*').eq('user_id',activeUser.id).maybeSingle();if(e)throw e;return data},
 async saveProfile(profile){if(!sb||!activeUser)return;const {error:e}=await sb.from('learner_profiles').upsert({user_id:activeUser.id,display_name:profile.name,share_rank:profile.shareRank??false,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(e)throw e},
 async completeLesson(id,answers){if(!sb||!activeUser)return null;const {data,error:e}=await sb.rpc('submit_lesson',{lesson_key:id,submitted_answers:answers});if(e)throw e;return data},
 async ranking(){if(!sb)return [];const {data,error:e}=await sb.rpc('public_leaderboard');if(e)throw e;return data||[]},
 async feedback(message){if(!sb||!activeUser)throw Error('შედით ანგარიშში');const {error:e}=await sb.from('learner_feedback').insert({user_id:activeUser.id,message});if(e)throw e},
 async signIn(email,password){if(!sb)throw Error(error||'სერვერი მიუწვდომელია');const {data,error:e}=await sb.auth.signInWithPassword({email,password});if(e)throw e;activeUser=data.user;return data},
 async signUp(email,password){if(!sb)throw Error(error||'სერვერი მიუწვდომელია');const {data,error:e}=await sb.auth.signUp({email,password});if(e)throw e;activeUser=data.session?.user??null;return data},
 async signOut(){if(!sb)return;const {error:e}=await sb.auth.signOut();if(e)throw e;activeUser=null},
};
