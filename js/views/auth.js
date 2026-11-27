import {cloud} from '../core/cloud.js';
import {store} from '../core/store.js';
import {esc,img} from '../core/utils.js';
import {pageTop} from '../components/chrome.js';
let mode='login';
export default {
 render(){
  if(cloud.user)return `${pageTop('ჩემი ანგარიში','🔐','#/profile')}
   <section class="glass cloud-auth-card"><h2>✅ დაკავშირებული ხარ</h2><p>${esc(cloud.user.email||'ავტორიზებული მომხმარებელი')}</p>
   <p>პროგრესი ინახება Peera.My-ის Supabase ბაზაში.</p><a href="#/profile" class="btn btn-green">პროფილზე დაბრუნება</a>
   <button class="btn btn-light" data-action="auth-logout">გამოსვლა</button></section>`;
  return `${pageTop('ანგარიშში შესვლა','🔐','#/profile')}
   <section class="glass cloud-auth-card">
    ${img('girl-dict.png','cloud-auth-art')}
    <h2>ისწავლე ყველა მოწყობილობაზე</h2><p>შეინახე ბარათები, გაკვეთილები და შენი პროგრესი Supabase-ში.</p>
    <div class="tab-row" role="tablist"><button class="tab ${mode==='login'?'active':''}" data-action="auth-mode" data-mode="login">შესვლა</button>
      <button class="tab ${mode==='register'?'active':''}" data-action="auth-mode" data-mode="register">რეგისტრაცია</button></div>
    <form id="cloud-auth-form" autocomplete="on">
     <label class="cloud-label" for="cloud-email">ელფოსტა</label><input id="cloud-email" type="email" class="field" autocomplete="email" placeholder="example@email.com" required maxlength="254">
     <label class="cloud-label" for="cloud-password">პაროლი</label><input id="cloud-password" type="password" class="field" autocomplete="${mode==='login'?'current-password':'new-password'}" required minlength="6" placeholder="მინიმუმ 6 სიმბოლო">
     <button class="btn btn-green cloud-submit" type="submit" data-action="auth-submit">${mode==='login'?'შესვლა':'ანგარიშის შექმნა'} ❯</button>
    </form><p class="cloud-small">სტუმრად გამოყენებაც შესაძლებელია. სტუმრის პროგრესი მხოლოდ ამ მოწყობილობაზე ინახება.</p>
   </section>`;
 },
 async handle(action,el,refresh){
  if(action==='auth-mode'){mode=el.dataset.mode==='register'?'register':'login';refresh();return true}
  if(action==='auth-logout'){await cloud.signOut();await store.reloadAuth();location.hash='#/profile';refresh();window.peeraToast('ანგარიშიდან გამოხვედი');return true}
  if(action==='auth-submit'){
    const email=document.getElementById('cloud-email')?.value.trim();
    const password=document.getElementById('cloud-password')?.value||'';
    if(!email||password.length<6){window.peeraToast('შეიყვანე ელფოსტა და მინიმუმ 6-ნიშნა პაროლი');return true}
    const button=el;button.disabled=true;button.textContent='იტვირთება…';
    try{
      if(mode==='login'){
        await cloud.signIn(email,password);await store.reloadAuth();location.hash='#/profile';refresh();window.peeraToast('ანგარიშში შესვლა წარმატებულია');
      }else{
        const result=await cloud.signUp(email,password);
        if(result.session){await store.reloadAuth();location.hash='#/profile';refresh();window.peeraToast('ანგარიში შექმნილია')}
        else window.peeraToast('რეგისტრაცია მიღებულია — გადაამოწმე ელფოსტა დასადასტურებლად');
      }
    }finally{button.disabled=false;button.textContent=mode==='login'?'შესვლა ❯':'ანგარიშის შექმნა ❯'}
    return true;
  }
  return false;
 }
};
