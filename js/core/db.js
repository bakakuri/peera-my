const DB = 'peera-my-json-v1';
const STORE = 'state';
const memory = new Map();
let dbPromise;
function open(){
  if (!('indexedDB' in window)) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise(resolve=>{
    let req;try{req=indexedDB.open(DB,1)}catch{return resolve(null);}
    req.onupgradeneeded=()=>req.result.createObjectStore(STORE);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>resolve(null);
    req.onblocked=()=>resolve(null);
  });
  return dbPromise;
}
export async function get(key){
  if(memory.has(key)) return memory.get(key);
  const db=await open(); if(!db) return undefined;
  return new Promise(resolve=>{
    const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(key);
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(undefined);
  });
}
export async function set(key,value){
  memory.set(key,value);
  const db=await open(); if(!db)return false;
  return new Promise(resolve=>{
    const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);
  });
}
export async function reset(){
  memory.clear();const db=await open();if(!db)return;
  return new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=resolve;});
}

export async function remove(key){
  memory.delete(key);const db=await open();if(!db)return false;
  return new Promise(resolve=>{
    const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);
  });
}
