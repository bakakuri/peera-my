import {store} from '../core/store.js';
import {pageTop,footer} from '../components/chrome.js';
import {number,pct,meter} from '../core/utils.js';
import {dateKey} from '../core/utils.js';
export default {render(){const s=store.stats,completed=Object.keys(store.user.completed).length,goal=store.profile.dailyGoal||50,
 daily=store.user.daily[dateKey()]||0,earned=store.data.achievements.filter(a=>store.achievement(a).done).length;
 return `${pageTop('შედეგები')}<p class="page-description">სწავლის პროგრესი, მიღწევები და რეიტინგი — ერთ ადგილას.</p>
<section class="v7-results-intro"><div><span class="v7-kicker">შენი პროგრესი</span><h2>${number(s.xp)} XP</h2><p>ქულები, რომლებიც აქამდე დააგროვე</p><div class="v7-result-goal">დღიური მიზანი <b>${daily}/${goal} XP</b>${meter(pct(daily,goal))}</div></div><span class="v7-results-icon">🏆</span></section>
<div class="v7-result-stats"><div><small>გაკვეთილი</small><strong>${completed}</strong></div><div><small>ნასწავლი სიტყვა</small><strong>${store.learned()}</strong></div><div><small>სერია</small><strong>${s.streak} დღე</strong></div><div><small>გამეორების სიზუსტე</small><strong>${pct(s.correct,s.reviews)}%</strong></div></div>
<div class="v7-title-row"><h2>დეტალური შედეგები</h2></div>
<div class="v7-result-links"><a href="#/progress"><span>📊</span><div><b>სრული სტატისტიკა</b><small>აქტივობის კალენდარი, კვირეული შედეგები და კურსები</small></div><span>→</span></a>
<a href="#/achievements"><span>🏅</span><div><b>მიღწევები</b><small>${earned}/${store.data.achievements.length} ჯილდო მიღებულია</small></div><span>→</span></a>
<a href="#/leaderboard"><span>🏆</span><div><b>რეიტინგი</b><small>რეიტინგის მდგომარეობა და სამომავლო შეჯიბრებები</small></div><span>→</span></a></div>${store.profile.demo?'<p class="demo-label">ნაჩვენებია სტუმრის საჩვენებელი პროგრესი. ახალი რეგისტრაცია ნულიდან იწყება.</p>':''}${footer()}`;}}
