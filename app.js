const $=id=>document.getElementById(id),KEY='amoParviz_v1';
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const fa=n=>Number(n).toLocaleString('fa-IR',{useGrouping:false}),dg=n=>Number(n||0).toLocaleString('fa-IR'),money=n=>dg(Math.round(n))+' تومان',pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function g2j(gy,gm,gd){const g=[0,31,59,90,120,151,181,212,243,273,304,334];let jy=gm>2?gy+1:gy,days=355666+365*gy+~~((jy+3)/4)-~~((jy+99)/100)+~~((jy+399)/400)+gd+g[gm-1];jy=-1595+33*~~(days/12053);days%=12053;jy+=4*~~(days/1461);days%=1461;if(days>365){jy+=~~((days-1)/365);days=(days-1)%365}const jm=days<186?1+~~(days/31):7+~~((days-186)/30),jd=1+(days<186?days%31:(days-186)%30);return[jy,jm,jd]}
function j2g(jy,jm,jd){jy+=1595;let days=-355668+365*jy+~~(jy/33)*8+~~(((jy%33)+3)/4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*~~(days/146097);days%=146097;if(days>36524){gy+=100*~~(--days/36524);days%=36524;if(days>=365)days++}gy+=4*~~(days/1461);days%=1461;if(days>365){gy+=~~((days-1)/365);days=(days-1)%365}let gd=days+1;const sa=[0,31,(gy%4==0&&gy%100!=0)||gy%400==0?29:28,31,30,31,30,31,31,30,31,30,31];let gm=0;for(;gm<13&&gd>sa[gm];gm++)gd-=sa[gm];return[gy,gm,gd]}
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const jp=iso=>g2j(...iso.split('-').map(Number)),jf=iso=>{if(!iso)return'—';const[y,m,d]=jp(iso);return fa(d)+' '+MN[m-1]+' '+fa(y)};
const dim=(y,m)=>m<7?31:m<12?30:(g=>g2j(...g)[1]===12?30:29)(j2g(y,12,30));
function jdMake(id){const el=$(id),cy=jp(todayISO())[0];el.className='jd';el.innerHTML='<select aria-label="سال">'+[...Array(9)].map((_,i)=>`<option value="${cy-6+i}">${fa(cy-6+i)}</option>`).join('')+'</select><select aria-label="ماه">'+MN.map((n,i)=>`<option value="${i+1}">${n}</option>`).join('')+'</select><select aria-label="روز"></select>';const[y,m,d]=el.children,fill=()=>{const k=+d.value||1,n=dim(+y.value,+m.value);d.innerHTML=[...Array(n)].map((_,i)=>`<option value="${i+1}">${fa(i+1)}</option>`).join('');d.value=Math.min(k,n)};y.onchange=m.onchange=fill;y.value=cy;fill()}
const jdGet=id=>{const[y,m,d]=[...$(id).children].map(x=>+x.value),g=j2g(y,m,d);return g[0]+'-'+pad(g[1])+'-'+pad(g[2])};
function jdSet(id,iso){const c=$(id).children,[y,m,d]=jp(iso);if(![...c[0].options].some(o=>+o.value===y))c[0].add(new Option(fa(y),y));c[0].value=y;c[1].value=m;c[0].onchange();c[2].value=d}

const D0={shifts:[],payments:[],bonuses:[],staff:[],running:{},audit:[],auth:{mgr:''},settings:{mode:'hourly',rate:50000,normalHours:8,overtime:1.4,storeName:''}};
function load(){let v={};try{v=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
 const d={...structuredClone(D0),...v};['shifts','payments','bonuses','staff','audit'].forEach(k=>{if(!Array.isArray(d[k]))d[k]=[]});d.settings={...D0.settings,...(v.settings||{})};d.auth={...D0.auth,...(v.auth||{})};d.running=v.running||{};
 if(!d.staff.length&&(d.shifts.length||d.payments.length))d.staff.push({id:'s1',name:'پرسنل',pin:'',rate:0});
 const f=d.staff[0]?.id;d.shifts.forEach(s=>{s.staffId=s.staffId||f});d.payments.forEach(s=>{s.staffId=s.staffId||f});
 d.bonuses.forEach(b=>{if(!b.staffId)b.staffId=(d.staff.find(x=>x.name===b.person)||d.staff[0]||{}).id});return d}
let data=load(),me=null;
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
async function H(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('amo'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=0;for(const c of'amo'+s)h=(h*31+c.charCodeAt(0))|0;return'f'+h}}
const isM=()=>me&&me.role==='manager',sName=id=>(data.staff.find(s=>s.id===id)||{name:'—'}).name,myName=()=>isM()?'مدیر':sName(me.id);
const inScope=a=>isM()?a:a.filter(x=>x.staffId===me.id),canEdit=s=>isM()||(s.staffId===me.id&&!s.locked);
function logA(t){data.audit.unshift({t:Date.now(),by:myName(),a:t});data.audit.length=Math.min(data.audit.length,200)}

// تم
function theme(t){document.documentElement.dataset.theme=t;$('themeBtn').textContent=t==='dark'?'☀️':'🌙';$('tc').content=t==='dark'?'#09131c':'#0e7fc4';localStorage.setItem('amo_theme',t)}
theme(localStorage.getItem('amo_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
$('themeBtn').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');

// محاسبات
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
function dur(s){let d=mins(s.end)-mins(s.start);if(d<0)d+=1440;return Math.max(0,d-(+s.breakMin||0))/60}
function wageFor(h,r){const n=+data.settings.normalHours||8,o=+data.settings.overtime||1;return data.settings.mode==='daily'?r*Math.min(h,n)/n+Math.max(0,h-n)*(r/n)*o:Math.min(h,n)*r+Math.max(0,h-n)*r*o}
const rateOf=id=>+(data.staff.find(x=>x.id===id)||{}).rate||+data.settings.rate||0;
function calc(s){const h=dur(s),tot=data.shifts.filter(x=>x.staffId===s.staffId&&x.date===s.date).reduce((a,x)=>a+dur(x),0)||h;return{hours:h,wage:tot?wageFor(tot,rateOf(s.staffId))*h/tot:0}}
function totals(sf){const f=a=>a.filter(x=>!sf||x.staffId===sf);let hours=0,wage=0;f(data.shifts).forEach(s=>{const c=calc(s);hours+=c.hours;wage+=c.wage});const paid=f(data.payments).reduce((a,p)=>a+(+p.amount||0),0),pend=f(data.bonuses).filter(b=>b.status!=='paid').reduce((a,b)=>a+b.amount,0);return{hours,wage,paid,pend,balance:wage+pend-paid}}

// ورود
const lg={el:$('login')};
function fillLogin(){const first=!data.auth.mgr;$('lgT').textContent=first?'ساخت رمز مدیر':'ورود';$('lgP').textContent=first?'برای شروع، یک رمز حداقل ۴ رقمی برای مدیر بسازید.':'کاربر را انتخاب و رمز را وارد کنید.';$('lgU').classList.toggle('hidden',first);$('loginBtn').textContent=first?'ساخت رمز و ورود':'ورود';$('loginUser').innerHTML='<option value="m">مدیر</option>'+data.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');$('loginPin').value='';$('lgE').textContent=''}
$('loginBtn').onclick=async()=>{const pin=$('loginPin').value.trim(),u=$('loginUser').value;$('lgE').textContent='';
 if(!data.auth.mgr){if(pin.length<4){$('lgE').textContent='رمز باید حداقل ۴ رقم باشد.';return}data.auth.mgr=await H(pin);localStorage.setItem(KEY,JSON.stringify(data));return enter({role:'manager'})}
 if(u==='m'){if(await H(pin)!==data.auth.mgr){$('lgE').textContent='رمز اشتباه است.';return}return enter({role:'manager'})}
 const s=data.staff.find(x=>x.id===u);if(!s)return;
 if(!s.pin){if(pin.length<4){$('lgE').textContent='اولین ورود: یک رمز حداقل ۴ رقمی تعیین کنید.';return}s.pin=await H(pin);localStorage.setItem(KEY,JSON.stringify(data));return enter({role:'staff',id:s.id})}
 if(await H(pin)!==s.pin){$('lgE').textContent='رمز اشتباه است.';return}enter({role:'staff',id:s.id})};
$('loginPin').onkeydown=e=>{if(e.key==='Enter')$('loginBtn').click()};
function enter(u){me=u;sessionStorage.setItem('amo_me',JSON.stringify(u));$('login').classList.add('hidden');document.body.dataset.role=u.role;$('who').textContent=(isM()?'مدیر':'پرسنل: '+sName(u.id));$('shiftStaff').value=u.id||'';initForms();showTab('dashboard');render()}
$('logoutBtn').onclick=()=>{me=null;sessionStorage.removeItem('amo_me');document.body.dataset.role='';fillLogin();$('login').classList.remove('hidden')};

// تب‌ها
function showTab(n){document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('hidden',p.id!==n));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===n));scrollTo({top:0})}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

// جدول‌ها
function badges(s){let r='';if(s.locked)r+='<span class="pill">🔒 تأییدشده</span>';else r+='<span class="pill w">بازبینی نشده</span>';if((s.log||[]).some(l=>l.by!=='مدیر'&&l.a==='ویرایش'))r+='<span class="pill b">ویرایش‌شده توسط پرسنل</span>';return r}
function rowShift(s){const c=calc(s);return`<tr><td>${jf(s.date)}</td><td class="mgr">${esc(sName(s.staffId))}</td><td>${fa(s.start)} تا ${fa(s.end)}</td><td>${dg(c.hours.toFixed(2))}</td><td>${money(c.wage)}</td><td>${badges(s)}</td><td class="no-print">${canEdit(s)?`<button class="g" onclick="editShift('${s.id}')">ویرایش</button><button class="g neg" onclick="delShift('${s.id}')">حذف</button>`:'<small class="muted">قفل</small>'}${isM()?`<button class="g" onclick="lockShift('${s.id}')">${s.locked?'🔓':'🔒'}</button>`:''}</td></tr>`}
const tableShifts=a=>a.length?`<table><thead><tr><th>تاریخ</th><th class="mgr">پرسنل</th><th>ساعت</th><th>کارکرد</th><th>دستمزد</th><th>وضعیت</th><th class="no-print">عملیات</th></tr></thead><tbody>${a.map(rowShift).join('')}</tbody></table>`:'<div class="empty">هنوز شیفتی ثبت نشده. از «ثبت شیفت» شروع کنید.</div>';
function periodFilter(a){const p=$('period').value;if(p==='all')return a;const now=new Date(),[jy,jm]=jp(todayISO());let from,to='9999';if(p==='d7'){const d=new Date(now-6*864e5);from=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}else{let y=jy,m=jm-(p==='m1'?1:0);if(m<1){m=12;y--}const g=j2g(y,m,1),h=j2g(m===12?y+1:y,m===12?1:m+1,1);from=g[0]+'-'+pad(g[1])+'-'+pad(g[2]);to=h[0]+'-'+pad(h[1])+'-'+pad(h[2])}return a.filter(x=>x.date>=from&&(to==='9999'||x.date<to))}
const sortD=a=>[...a].sort((x,y)=>y.date.localeCompare(x.date));
function renderPay(){const a=sortD(inScope(data.payments));$('payTable').innerHTML=a.length?`<table><thead><tr><th>تاریخ</th><th class="mgr">پرسنل</th><th>نوع</th><th>مبلغ</th><th>توضیحات</th><th class="mgr"></th></tr></thead><tbody>${a.map(p=>`<tr><td>${jf(p.date)}</td><td class="mgr">${esc(sName(p.staffId))}</td><td>${p.type==='advance'?'مساعده':'پرداخت دستمزد'}</td><td>${money(p.amount)}</td><td>${esc(p.note||'—')}</td><td class="mgr"><button class="g neg" onclick="delPay('${p.id}')">حذف</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">پرداختی ثبت نشده است.</div>'}
function renderBonus(){const a=sortD(inScope(data.bonuses));$('bonusTable').innerHTML=a.length?`<table><thead><tr><th>تاریخ</th><th>پرسنل</th><th>مبلغ</th><th>علت</th><th>وضعیت</th><th class="mgr"></th></tr></thead><tbody>${a.map(b=>`<tr><td>${jf(b.date)}</td><td>${esc(sName(b.staffId))}</td><td>${money(b.amount)}</td><td>${esc(b.reason||'—')}</td><td><span class="pill ${b.status==='paid'?'':'w'}">${b.status==='paid'?'پرداخت شد':'در انتظار'}</span>${b.paidDate?`<small class="muted"> ${jf(b.paidDate)}</small>`:''}</td><td class="mgr">${b.status!=='paid'?`<button class="g" onclick="paidBonus('${b.id}')">ثبت پرداخت</button>`:''}<button class="g neg" onclick="delBonus('${b.id}')">حذف</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">پاداشی ثبت نشده است.</div>'}
const Q=['کار بزرگ از قدم‌های کوچک و پیوسته ساخته می‌شود.','کیفیت یعنی وقتی کسی نگاه نمی‌کند هم درست کار کنی.','صداقت در کار، سرمایه‌ای است که کم نمی‌شود.','تلاش پنهان امروز، نتیجه درخشان فرداست.','با احترام کار کن؛ احترام بهترین نتیجه را برمی‌گرداند.'];
function renderStaff(){$('staffList').innerHTML=data.staff.length?`<table><thead><tr><th>نام</th><th>نرخ</th><th></th></tr></thead><tbody>${data.staff.map(s=>`<tr><td>${esc(s.name)}</td><td>${s.rate?money(s.rate):'پیش‌فرض'}</td><td><button class="g" onclick="resetPin('${s.id}')">رمز جدید</button><button class="g neg" onclick="delStaff('${s.id}')">حذف</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">پرسنلی اضافه نشده است.</div>';$('audit').innerHTML=data.audit.slice(0,15).map(l=>`<p class="muted">${jf(new Date(l.t).toISOString().slice(0,10))} ${fa(new Date(l.t).toTimeString().slice(0,5))} · <b>${esc(l.by)}</b>: ${esc(l.a)}</p>`).join('')||'<div class="empty">هنوز تغییری ثبت نشده است.</div>'}
function fillSel(){['shiftStaff','payStaff','bonusStaff','dashStaff'].forEach(id=>{const e=$(id),v=e.value;e.innerHTML=(id==='dashStaff'?'<option value="">همه پرسنل</option>':'')+data.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');if([...e.options].some(o=>o.value===v))e.value=v})}
function render(){if(!me)return;fillSel();const sf=isM()?$('dashStaff').value:me.id,t=totals(sf);$('tH').textContent=dg(t.hours.toFixed(1))+' ساعت';$('tW').textContent=money(t.wage);$('tP').textContent=money(t.paid);$('tB').textContent=money(t.balance);$('tB').className=t.balance>0?'pos':t.balance<0?'neg':'';
 const sc=data.shifts.filter(s=>!sf||s.staffId===sf),days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5),iso=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());return{iso,h:sc.filter(s=>s.date===iso).reduce((a,s)=>a+dur(s),0)}}),mx=Math.max(8,...days.map(d=>d.h));
 $('bars').innerHTML=days.map(d=>`<div title="${jf(d.iso)}"><span>${d.h?dg(d.h.toFixed(1)):''}</span><i style="height:${d.h/mx*80}px"></i>${fa(jp(d.iso)[2])}</div>`).join('');
 $('recent').innerHTML=tableShifts(sortD(inScope(data.shifts)).slice(0,5));$('historyTable').innerHTML=tableShifts(periodFilter(sortD(inScope(data.shifts))));renderPay();renderBonus();renderStaff();
 $('storeTitle').textContent=data.settings.storeName||'سامانه مدیریت ساعت کاری';const day=Math.floor(Date.now()/864e5);$('wT').textContent='خوش آمدید '+(isM()?'مدیر':sName(me.id))+' عزیز 🌤️';$('wQ').textContent='«'+Q[day%Q.length]+'»';$('wD').textContent='امروز: '+jf(todayISO());tick()}
$('dashStaff').onchange=render;$('period').onchange=render;

// شیفت
function resetShift(){$('shiftForm').reset();$('editId').value='';jdSet('shiftDate',todayISO());$('breakMin').value=0;$('prev').classList.add('hidden');$('saveShift').textContent='ذخیره شیفت';$('shT').textContent='ثبت ساعت کاری';if(!isM())$('shiftStaff').value=me.id}
$('clearShift').onclick=resetShift;
function prev(){const s=$('start').value,e=$('end').value,b=$('prev');if(!s||!e)return b.classList.add('hidden');const x={start:s,end:e,breakMin:+$('breakMin').value||0},h=dur(x);b.classList.remove('hidden');b.innerHTML=`مدت کارکرد: <b>${dg(h.toFixed(2))} ساعت</b> · دستمزد تقریبی: <b>${money(wageFor(h,rateOf(isM()?$('shiftStaff').value:me.id)))}</b>`}
['start','end','breakMin'].forEach(i=>$(i).oninput=prev);
$('shiftForm').onsubmit=e=>{e.preventDefault();const id=$('editId').value,old=data.shifts.find(x=>x.id===id),sid=isM()?$('shiftStaff').value:me.id;
 if(old&&!canEdit(old)){alert('این شیفت قفل شده و فقط مدیر می‌تواند آن را تغییر دهد.');return}
 const s={id:id||crypto.randomUUID(),staffId:sid,date:jdGet('shiftDate'),start:$('start').value,end:$('end').value,breakMin:+$('breakMin').value||0,note:$('note').value.trim(),locked:isM(),log:old?old.log||[]:[]};
 let d=mins(s.end)-mins(s.start);if(d<0)d+=1440;if(s.breakMin>=d){alert('مدت استراحت باید کمتر از کل شیفت باشد.');return}
 s.log.push({t:Date.now(),by:myName(),a:old?'ویرایش':'ثبت'});
 logA((old?'ویرایش شیفت ':'ثبت شیفت ')+sName(sid)+' – '+jf(s.date)+(old?` (قبلاً ${old.start}-${old.end})`:''));
 if(old)data.shifts[data.shifts.indexOf(old)]=s;else data.shifts.push(s);save();resetShift();showTab('history')};
window.editShift=id=>{const s=data.shifts.find(x=>x.id===id);if(!s||!canEdit(s))return;$('editId').value=id;$('shiftStaff').value=s.staffId;jdSet('shiftDate',s.date);$('start').value=s.start;$('end').value=s.end;$('breakMin').value=s.breakMin;$('note').value=s.note||'';$('saveShift').textContent='ذخیره تغییرات';$('shT').textContent='ویرایش شیفت';prev();showTab('shift')};
window.delShift=id=>{const s=data.shifts.find(x=>x.id===id);if(!s||!canEdit(s))return;if(confirm('این شیفت حذف شود؟')){logA('حذف شیفت '+sName(s.staffId)+' – '+jf(s.date));data.shifts=data.shifts.filter(x=>x!==s);save()}};
window.lockShift=id=>{const s=data.shifts.find(x=>x.id===id);if(!s)return;s.locked=!s.locked;logA((s.locked?'تأیید و قفل ':'باز کردن قفل ')+'شیفت '+sName(s.staffId)+' – '+jf(s.date));save()};

// تایمر
function tick(){if(!me||isM())return;const r=data.running[me.id];$('tmrBtn').textContent=r?'⏹ پایان شیفت':'▶ شروع شیفت';if(!r){$('tmr').textContent='۰۰:۰۰:۰۰';return}const sec=~~((Date.now()-r)/1000);$('tmr').textContent=[~~(sec/3600),~~(sec/60)%60,sec%60].map(x=>fa(pad(x))).join(':')}
setInterval(tick,1000);
$('tmrBtn').onclick=()=>{const r=data.running[me.id],hm=t=>{const d=new Date(t);return pad(d.getHours())+':'+pad(d.getMinutes())};if(!r){data.running[me.id]=Date.now();logA('شروع تایمر شیفت');return save()}
 const a=new Date(r),s={id:crypto.randomUUID(),staffId:me.id,date:a.getFullYear()+'-'+pad(a.getMonth()+1)+'-'+pad(a.getDate()),start:hm(r),end:hm(Date.now()),breakMin:0,note:'ثبت خودکار با تایمر',locked:false,log:[{t:Date.now(),by:myName(),a:'ثبت'}]};delete data.running[me.id];if(s.start===s.end){alert('شیفت کمتر از یک دقیقه بود و ثبت نشد.');return save()}data.shifts.push(s);logA('پایان تایمر و ثبت شیفت');save();showTab('history')};

// پرداخت / پاداش / پرسنل (مدیر)
$('payForm').onsubmit=e=>{e.preventDefault();if(!isM())return;const p={id:crypto.randomUUID(),staffId:$('payStaff').value,date:jdGet('payDate'),amount:+$('payAmount').value,type:$('payType').value,note:$('payNote').value.trim()};if(!p.staffId||p.amount<=0){alert('پرسنل و مبلغ معتبر را وارد کنید.');return}data.payments.push(p);logA('ثبت پرداخت '+money(p.amount)+' برای '+sName(p.staffId));save();$('payForm').reset();jdSet('payDate',todayISO())};
window.delPay=id=>{if(isM()&&confirm('این پرداخت حذف شود؟')){logA('حذف یک پرداخت');data.payments=data.payments.filter(p=>p.id!==id);save()}};
$('bonusForm').onsubmit=e=>{e.preventDefault();if(!isM())return;const b={id:crypto.randomUUID(),staffId:$('bonusStaff').value,date:todayISO(),amount:+$('bonusAmount').value,reason:$('bonusReason').value.trim(),status:'pending',paidDate:''};if(!b.staffId||b.amount<=0){alert('پرسنل و مبلغ معتبر را وارد کنید.');return}data.bonuses.push(b);logA('ثبت پاداش '+money(b.amount)+' برای '+sName(b.staffId));save();$('bonusForm').reset()};
window.paidBonus=id=>{const b=data.bonuses.find(x=>x.id===id);if(isM()&&b&&confirm('پاداش به‌عنوان پرداخت‌شده ثبت شود؟')){b.status='paid';b.paidDate=todayISO();logA('پرداخت پاداش '+sName(b.staffId));save()}};
window.delBonus=id=>{if(isM()&&confirm('این پاداش حذف شود؟')){data.bonuses=data.bonuses.filter(x=>x.id!==id);save()}};
$('setForm').onsubmit=e=>{e.preventDefault();data.settings={...data.settings,storeName:$('storeName').value.trim(),mode:$('rateMode').value,rate:+$('rate').value,normalHours:+$('normalHours').value,overtime:+$('overtime').value};logA('تغییر تنظیمات');save();alert('ذخیره شد.')};
$('staffForm').onsubmit=async e=>{e.preventDefault();const pin=$('stPin').value.trim();if(pin.length<4){alert('رمز حداقل ۴ رقم باشد.');return}data.staff.push({id:'s'+Date.now().toString(36),name:$('stName').value.trim(),pin:await H(pin),rate:+$('stRate').value||0});logA('افزودن پرسنل '+$('stName').value.trim());save();$('staffForm').reset()};
window.resetPin=async id=>{const p=prompt('رمز جدید (حداقل ۴ رقم):');if(!p||p.length<4)return;sName(id);data.staff.find(s=>s.id===id).pin=await H(p);logA('تغییر رمز '+sName(id));save()};
window.delStaff=id=>{if(data.shifts.some(s=>s.staffId===id)||data.payments.some(s=>s.staffId===id)){alert('این پرسنل سابقه دارد و قابل حذف نیست.');return}if(confirm('حذف شود؟')){data.staff=data.staff.filter(s=>s.id!==id);save()}};
$('chgPin').onclick=async()=>{const p=prompt('رمز جدید مدیر (حداقل ۴ رقم):');if(!p||p.length<4)return;data.auth.mgr=await H(p);logA('تغییر رمز مدیر');save();alert('رمز مدیر تغییر کرد.')};

// پشتیبان
const dl=(n,c,t)=>{const u=URL.createObjectURL(new Blob([c],{type:t})),a=document.createElement('a');a.href=u;a.download=n;a.click();URL.revokeObjectURL(u)};
$('backupBtn').onclick=()=>dl('amo-backup.json',JSON.stringify(data),'application/json');
$('restoreFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!Array.isArray(v.shifts)||!v.settings)throw 0;if(confirm('اطلاعات فعلی با فایل جایگزین شود؟')){localStorage.setItem(KEY,JSON.stringify(v));data=load();fillSetForm();save();alert('بازیابی شد. اگر رمز مدیر در فایل نبود، دوباره وارد شوید.')}}catch(x){alert('فایل پشتیبان معتبر نیست.')}e.target.value=''};
$('resetBtn').onclick=()=>{if(confirm('همه اطلاعات حذف شود؟')&&confirm('مطمئنید؟ این کار قابل بازگشت نیست.')){localStorage.removeItem(KEY);sessionStorage.clear();location.reload()}};
$('csvBtn').onclick=()=>{const rows=[['تاریخ شمسی','پرسنل','شروع','پایان','ساعت','دستمزد','توضیحات'],...sortD(inScope(data.shifts)).map(s=>{const c=calc(s);return[jf(s.date),sName(s.staffId),s.start,s.end,c.hours.toFixed(2),Math.round(c.wage),s.note||'']})];dl('shifts.csv','\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv;charset=utf-8')};
function fillSetForm(){const s=data.settings;$('storeName').value=s.storeName||'';$('rateMode').value=s.mode;$('rate').value=s.rate;$('normalHours').value=s.normalHours;$('overtime').value=s.overtime}
function initForms(){if(!$('shiftDate').firstChild){jdMake('shiftDate');jdMake('payDate')}fillSel();fillSetForm();jdSet('payDate',todayISO());resetShift()}

fillLogin();
try{const u=JSON.parse(sessionStorage.getItem('amo_me')||'null');if(u&&data.auth.mgr&&(u.role==='manager'||data.staff.some(s=>s.id===u.id)))enter(u)}catch(e){}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
