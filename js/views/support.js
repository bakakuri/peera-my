import {cloud} from '../core/cloud.js';
import {pageTop} from '../components/chrome.js';
import {esc} from '../core/utils.js';
let sent=false, busy=false;
export default {render(){return `${pageTop('დახმარება და უკუკავშირი','','#/profile')}<p class="page-description">დაგვეხმარე Peera.My-ის გაუმჯობესებაში. შეტყობინება პირდაპირ სერვერზე ინახება.</p>
<div class="glass panel-pad v7-feedback"><h2>რა შეგვიძლია გამოვასწოროთ?</h2>${!cloud.user?`<p class="notice">უკუკავშირის გასაგზავნად ანგარიშში შესვლაა საჭირო. <a href="#/auth">შესვლა →</a></p>`:''}
${sent?`<div class="v7-feedback-success">✅ შენი შეტყობინება მიღებულია. მადლობა!</div><button class="btn btn-light" data-action="support-again">ახალი შეტყობინება</button>`:
`<form id="support-form"><label for="support-kind">თემა</label><select id="support-kind" class="field"><option value="bug">ტექნიკური შეცდომა</option><option value="content">სასწავლო მასალის პრობლემა</option><option value="idea">ახალი ფუნქციის იდეა</option><option value="other">სხვა</option></select>
<label for="support-message">აღწერა</label><textarea class="field" id="support-message" rows="6" minlength="20" maxlength="3000" placeholder="დაგვიწერე რა მოხდა, რომელ გვერდზე და რა შედეგს ელოდებოდი…" required></textarea>
<button class="btn btn-purple" data-action="support-send" type="submit" ${!cloud.user||busy?'disabled':''}>${busy?'იგზავნება…':'შეტყობინების გაგზავნა →'}</button></form>`}</div>`;},
 async handle(action,el,refresh){if(action==='support-again'){sent=false;refresh();return true}
 if(action==='support-send'){if(!cloud.user){window.peeraToast('ჯერ შედი ანგარიშში');return true;}
 const msg=document.getElementById('support-message')?.value?.trim()||'';
 if(msg.length<20){window.peeraToast('მინიმუმ 20 სიმბოლოა საჭირო');return true;}
 busy=true;try{await cloud.submitFeedback(document.getElementById('support-kind').value,msg);sent=true;refresh();}finally{busy=false;}return true;}return false;}};
