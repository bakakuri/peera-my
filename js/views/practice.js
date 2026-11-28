import {state} from '../core/state.js';
import {heading,tiles,instruments} from '../core/chrome.js';
export default {render(){const due=state.due(),fresh=state.newWords(),u=state.user;
 return `${heading('პრაქტიკა','აქ ვიმეორებთ, ვუსმენთ და ვამყარებთ ნასწავლს.')}
 <section class="card" style="background:linear-gradient(110deg,#f0edff,#fff);border-color:#ded8ff"><div class="inline"><span class="ico" style="width:61px;height:61px;font-size:30px">◈</span><div class="grow"><span class="pill">დღევანდელი გამეორება</span><h2 style="margin:7px 0">${due.length} გასამეორებელი · ${Math.min(10,fresh.length)} ახალი</h2><p class="muted">ინტერვალური გამეორება დაგეხმარება სიტყვების დიდხანს დამახსოვრებაში.</p></div></div><a href="#/cards" class="btn btn-primary" style="margin-top:19px">დაიწყე ბარათებით →</a></section>
 <section class="section"><h2 style="margin-bottom:16px">აირჩიე სავარჯიშო</h2>${tiles(instruments)}</section>
 <section class="section"><div class="cols-even"><a class="card clickable" href="#/plan"><span class="ico amber">▣</span><h3 style="margin:13px 0 4px">ჩემი სასწავლო გეგმა</h3><p class="muted">ერთი გაკვეთილი, ახალი სიტყვები და გამეორება ყოველდღე.</p></a><a class="card clickable" href="#/results"><span class="ico green">◫</span><h3 style="margin:13px 0 4px">როგორ მიდის სწავლა?</h3><p class="muted">შედეგები, სიზუსტე და მიღწევები ერთ სივრცეში.</p></a></div></section>`;
 }};
