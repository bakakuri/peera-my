const DB_NAME='peera-fresh-v1';
let opening;
function db(){
 if(opening)return opening;
 opening=new Promise(resolve=>{
  if(!('indexedDB' in window))return resolve(null);
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('kv');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>resolve(null);request.onblocked=()=>resolve(null);
 });return opening;
}
const fallback=new Map();
export async function get(key){
 const database=await db();if(!database)return fallback.get(key);
 return new Promise(resolve=>{const tx=database.transaction('kv','readonly');const q=tx.objectStore('kv').get(key);q.onsuccess=()=>resolve(q.result);q.onerror=()=>resolve(null)});
}
export async function put(key,value){
 const database=await db();if(!database){fallback.set(key,value);return false;}
 return new Promise(resolve=>{const tx=database.transaction('kv','readwrite');tx.objectStore('kv').put(value,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)});
}
export async function remove(key){
 const database=await db();if(!database){fallback.delete(key);return;}
 return new Promise(resolve=>{const tx=database.transaction('kv','readwrite');tx.objectStore('kv').delete(key);tx.oncomplete=resolve;tx.onerror=resolve});
}
