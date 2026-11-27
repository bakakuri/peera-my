import {store} from '../core/store.js';
import {esc,art,icon,meter,pct} from '../core/utils.js';
import {pageTop,footer} from '../components/chrome.js';
const tasks=[['📖','10 ახალი სიტყვა','cards'],['📚','ერთი გაკვეთილი','learn'],['🎧','მოსმენის პრაქტიკა','listening'],['🎮','მინი თამაში','games']];
export default {render(){const now=new Date(),done=store.user.daily[now.toISOString().slice(0,10)]||0;return `${pageTop('სასწავლო გეგმა','📅')}
 <div class="glass daily-success">${art('calendar')}<div><h2>შენი ყოველდღიური მისია</h2><p>დღეს შეაგროვე ${store.profile.dailyGoal} XP</p>${meter(pct(done,store.profile.dailyGoal))}<small>${done}/${store.profile.dailyGoal} XP</small></div></div>
 <div class="section-heading"><h2>📆 მიმდინარე კვირა</h2></div><div class="plan-week">${['ორ','სამ','ოთხ','ხუთ','პარ','შაბ','კვ'].map((l,i)=>`<div class="plan-day ${i===(now.getDay()+6)%7?'active':''}"><span>${l}</span><b>${i===(now.getDay()+6)%7?'★':'○'}</b></div>`).join('')}</div>
 <div class="section-heading"><h2>⚡ დავალებები</h2></div><div class="glass settings-list">${tasks.map(([emoji,label,route],i)=>`<a href="#/${route}" class="settings-row"><span style="font-size:1.8rem">${emoji}</span><div class="copy"><strong>${label}</strong><p>${['გაიმეორე სიტყვები ბარათებით','გააგრძელე გაკვეთილების გზა','მოუსმინე ფრაზებს','გაავარჯიშე მეხსიერება'][i]}</p></div><b>❯</b></a>`).join('')}</div><div class="notice">შეხსენების დრო ინახება პროფილში, თუმცა ბრაუზერის push შეტყობინებები ამ სტატიკურ ვერსიაში ჯერ არ იგზავნება.</div>${footer()}`}}
