import {cloud} from '../core/cloud.js';
import {state} from '../core/state.js';
import {heading} from '../core/chrome.js';
import {esc} from '../core/utils.js';
let mode='login';
export default {render(){return `<div class="study-panel">${heading('ჩემი ანგარიში','შეინახე სწავლის შედეგები და გააგრძელე ნებისმიერი მოწყობილობიდან.')}
 ${cloud.user?`<div class="card stack"><span class="ico green">✓</span><h2>ანგარიში დაკავშირებულია</h2><p class="muted">${esc(cloud.user.email)}</p><p class="muted">პროგრესის შენახვა ჩართულია.</p><div class="inline"><a href="#/profile" class="btn btn-primary">პროფილი</a><button class="btn btn-outline" data-action="logout">ანგარიშიდან გამოსვლა</button></div></div>`:
 `<div class="card" style="max-width:515px;margin:auto"><div class="tabs"><button class="tab ${mode==='login'?'active':''}" data-action="mode" data-id="login">შესვლა</button><button class="tab ${mode==='register'?'active':''}" data-action="mode" data-id="register">რეგისტრაცია</button></div><h2 style="margin:20px 0">${mode==='login'?'კეთილი იყოს შენი დაბრუნება!':'შექმენი შენი ანგარიში'}</h2>
 ${!cloud.online?`<div class="notice danger-notice" style="margin-bottom:14px">☁ Supabase მიუწვდომელია. სტუმრის რეჟიმი მუშაობს; შესვლა დროებით ვერ განხორციელდება.</div>`:''}
 <form data-form="auth"><div class="form-field"><label for="email">ელფოსტა</label><input id="email" name="email" type="email" class="input" autocomplete="email" required placeholder="example@mail.com"></div><div class="form-field"><label for="password">პაროლი</label><input id="password" name="password" type="password" class="input" autocomplete="${mode==='login'?'current-password':'new-password'}" minlength="8" required placeholder="მინიმუმ 8 სიმბოლო"></div>
 <button type="submit" class="btn btn-success btn-full" ${!cloud.online?'disabled':''}>${mode==='login'?'ანგარიშში შესვლა':'ანგარიშის შექმნა'} →</button></form><p class="muted tiny" style="margin-top:15px">რეგისტრაციის შემდეგ შესაძლოა ელფოსტის დადასტურება დაგჭირდეს.</p></div>`}
 </div>`;
 },async action(a,el,r,render,toast){if(a==='mode'){mode=el.dataset.id;render();return true}if(a==='logout'){await cloud.signOut();await state.loadUser();location.hash='#/home';render();toast('ანგარიშიდან გამოხვედი');return true}return false},
 async submit(form,r,render,toast){if(form.dataset.form!=='auth')return false;const v=new FormData(form),email=String(v.get('email')).trim(),password=String(v.get('password'));
 const btn=form.querySelector('button[type=submit]');btn.disabled=true;try{
  if(mode==='login'){await cloud.signIn(email,password);await state.loadUser();location.hash='#/home';render();toast('✓ შესვლა წარმატებულია')}
  else{const result=await cloud.signUp(email,password);if(result.session){await state.loadUser();location.hash='#/home';render();toast('✓ ანგარიში შექმნილია')}else toast('შეამოწმე ელფოსტა რეგისტრაციის დასადასტურებლად')}
 }finally{btn.disabled=false}return true}
};
