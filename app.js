const $=id=>document.getElementById(id);
const KEY='amoParviz_v1';
const defaults={shifts:[],payments:[],bonuses:[],settings:{mode:'hourly',rate:50000,normalHours:8,overtime:1.4,storeName:'',managerName:'',staffName:''},welcome:{role:'manager',person:''}};
let data=load();
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return {...structuredClone(defaults),...v,shifts:Array.isArray(v.shifts)?v.shifts:[],payments:Array.isArray(v.payments)?v.payments:[],bonuses:Array.isArray(v.bonuses)?v.bonuses:[],settings:{...defaults.settings,...(v.settings||{})},welcome:{...defaults.welcome,...(v.welcome||{})}};}catch(e){return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function digits(n){return Number(n||0).toLocaleString('fa-IR')}
function money(n){return digits(Math.round(n))+' تومان'}
function jalali(iso){if(!iso)return '—';const [y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'long',day:'numeric'}).format(new Date(y,m-1,d,12))}
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function mins(t){const [h,m]=t.split(':').map(Number);return h*60+m}
function shiftCalc(s){let duration=mins(s.end)-mins(s.start);if(duration<0)duration+=1440;duration=Math.max(0,duration-(+s.breakMin||0));const hours=duration/60, normal=+data.settings.normalHours||8, rate=+data.settings.rate||0;let wage;if(data.settings.mode==='daily'){const base=rate*Math.min(hours,normal)/normal;wage=base+Math.max(0,hours-normal)*(rate/normal)*(+data.settings.overtime||1)}else{wage=Math.min(hours,normal)*rate+Math.max(0,hours-normal)*rate*(+data.settings.overtime||1)}return {hours,wage,minutes:duration}}
function totals(){let hours=0,wage=0;data.shifts.forEach(s=>{const c=shiftCalc(s);hours+=c.hours;wage+=c.wage});const paid=data.payments.reduce((a,p)=>a+(+p.amount||0),0);return {hours,wage,paid,balance:wage-paid}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showTab(name){document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('hidden',p.id!==name));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));if(name==='history')renderHistory();if(name==='payments')renderPayments();if(name==='bonuses')renderBonuses();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
function rowShift(s){const c=shiftCalc(s);return `<tr><td>${jalali(s.date)}</td><td>${esc(s.start)} تا ${esc(s.end)}</td><td>${digits(c.hours.toFixed(2))}</td><td>${money(c.wage)}</td><td>${esc(s.note||'—')}</td><td class="no-print"><button class="ghost" onclick="editShift('${s.id}')">ویرایش</button><button class="ghost negative" onclick="deleteShift('${s.id}')">حذف</button></td></tr>`}
function tableShifts(arr){if(!arr.length)return '<div class="empty">هنوز شیفتی ثبت نشده است.</div>';return `<table><thead><tr><th>تاریخ شمسی</th><th>ساعت</th><th>کارکرد</th><th>دستمزد</th><th>توضیحات</th><th class="no-print">عملیات</th></tr></thead><tbody>${arr.map(rowShift).join('')}</tbody></table>`}
function renderHistory(){let arr=[...data.shifts].sort((a,b)=>b.date.localeCompare(a.date));const f=$('fromDate')?.value,t=$('toDate')?.value;if(f)arr=arr.filter(x=>x.date>=f);if(t)arr=arr.filter(x=>x.date<=t);$('historyTable').innerHTML=tableShifts(arr)}
function renderPayments(){if(!data.payments.length){$('paymentTable').innerHTML='<div class="empty">پرداختی ثبت نشده است.</div>';return}$('paymentTable').innerHTML=`<div class="table-wrap"><table><thead><tr><th>تاریخ شمسی</th><th>نوع</th><th>مبلغ</th><th>توضیحات</th><th class="no-print">عملیات</th></tr></thead><tbody>${[...data.payments].sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<tr><td>${jalali(p.date)}</td><td>${p.type==='advance'?'مساعده':'پرداخت دستمزد'}</td><td>${money(p.amount)}</td><td>${esc(p.note||'—')}</td><td class="no-print"><button class="ghost negative" onclick="deletePayment('${p.id}')">حذف</button></td></tr>`).join('')}</tbody></table></div>`}

const dailyQuotes=[
"کار بزرگ، از قدم‌های کوچک و پیوسته ساخته می‌شود.",
"امروز را بهتر از دیروز بساز؛ همین یعنی پیشرفت.",
"صداقت در کار، سرمایه‌ای است که هرگز کم نمی‌شود.",
"موفقیت سهم کسانی است که با نظم ادامه می‌دهند.",
"هر مشتری راضی، نشانه یک کار درست و باارزش است.",
"با احترام کار کن؛ احترام، بهترین نتیجه را برمی‌گرداند.",
"تلاش پنهان امروز، نتیجه درخشان فرداست.",
"کیفیت یعنی وقتی کسی نگاه نمی‌کند هم درست کار کنی.",
"صبوری و پشتکار، راه‌های سخت را هموار می‌کند.",
"یک روز خوب را با یک تصمیم درست شروع کن."
];
function renderWelcome(){
 const role=$('roleView')?.value||data.welcome.role||'manager';
 const person=($('welcomePerson')?.value||data.welcome.person||'').trim();
 const name=person?` ${esc(person)}`:'';
 $('welcomeTitle').textContent=role==='staff'?`خوش آمدی${name} عزیز 🌟`:`خوش آمدید${name} عزیز 🌤️`;
 const now=new Date(),day=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
 $('welcomeQuote').textContent='«'+dailyQuotes[((day%dailyQuotes.length)+dailyQuotes.length)%dailyQuotes.length]+'»';
 $('welcomeDate').textContent='امروز: '+jalali(todayISO())+' · '+(role==='staff'?'روز کاری پربرکتی داشته باشی':'روز پربازدهی برای مدیریت آرزو می‌کنیم');
}
function renderBonuses(){
 const box=$('bonusTable');if(!box)return;
 if(!data.bonuses.length){box.innerHTML='<div class="empty">هنوز پاداشی ثبت نشده است.</div>';return;}
 box.innerHTML=`<div class="table-wrap"><table><thead><tr><th>تاریخ ثبت</th><th>پرسنل</th><th>مبلغ</th><th>علت</th><th>وضعیت</th><th class="no-print">عملیات</th></tr></thead><tbody>${[...data.bonuses].sort((a,b)=>b.date.localeCompare(a.date)).map(b=>`<tr><td>${jalali(b.date)}</td><td>${esc(b.person)}</td><td>${money(b.amount)}</td><td>${esc(b.reason||'—')}</td><td><span class="pill ${b.status==='paid'?'badge-paid':'badge-pending'}">${b.status==='paid'?'پرداخت شد':'در انتظار پرداخت'}</span>${b.paidDate?`<small class="muted"> · ${jalali(b.paidDate)}</small>`:''}</td><td class="no-print">${b.status==='pending'?`<button class="secondary" onclick="markBonusPaid('${b.id}')">ثبت پرداخت</button>`:''} <button class="ghost negative" onclick="deleteBonus('${b.id}')">حذف</button></td></tr>`).join('')}</tbody></table></div>`;
}
window.markBonusPaid=id=>{const b=data.bonuses.find(x=>x.id===id);if(!b||b.status==='paid')return;if(confirm('این پاداش به‌عنوان پرداخت‌شده ثبت شود؟')){b.status='paid';b.paidDate=todayISO();save();renderBonuses();}};
window.deleteBonus=id=>{if(confirm('این پاداش حذف شود؟')){data.bonuses=data.bonuses.filter(x=>x.id!==id);save();renderBonuses();}};

function render(){const t=totals();$('totalHours').textContent=digits(t.hours.toFixed(2))+' ساعت';$('totalWage').textContent=money(t.wage);$('totalPaid').textContent=money(t.paid);$('balance').textContent=money(t.balance);$('balance').className=t.balance>=0?'positive':'negative';$('recent').innerHTML=tableShifts([...data.shifts].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5));const today=data.shifts.filter(s=>s.date===todayISO());$('todayStatus').textContent=today.length?`امروز ${digits(today.length)} شیفت ثبت شده؛ مجموع کارکرد ${digits(today.reduce((a,s)=>a+shiftCalc(s).hours,0).toFixed(2))} ساعت.`:'برای امروز هنوز شیفتی ثبت نشده است.';renderPayments();renderBonuses();$('storeTitle').textContent=data.settings.storeName||'سامانه مدیریت ساعت کاری';renderWelcome()}
function resetShiftForm(){$('shiftForm').reset();$('editId').value='';$('shiftDate').value=todayISO();$('breakMin').value=0;$('shiftPreview').classList.add('hidden');$('saveShift').textContent='ذخیره شیفت';previewDate()}
function previewDate(){$('jalaliPreview').textContent='تاریخ شمسی: '+jalali($('shiftDate').value)}
$('shiftDate').addEventListener('change',previewDate);$('clearShift').addEventListener('click',resetShiftForm);
$('shiftForm').addEventListener('submit',e=>{e.preventDefault();const s={id:$('editId').value||crypto.randomUUID(),date:$('shiftDate').value,start:$('start').value,end:$('end').value,breakMin:+$('breakMin').value||0,note:$('note').value.trim()};if(!s.date||!s.start||!s.end){alert('لطفاً تاریخ و ساعت شروع و پایان را وارد کنید.');return}let duration=mins(s.end)-mins(s.start);if(duration<0)duration+=1440;if(s.breakMin>=duration){alert('مدت استراحت باید از کل مدت شیفت کمتر باشد.');return}const idx=data.shifts.findIndex(x=>x.id===s.id);if(idx>=0)data.shifts[idx]=s;else data.shifts.push(s);save();resetShiftForm();showTab('history')});
window.editShift=id=>{const s=data.shifts.find(x=>x.id===id);if(!s)return;$('editId').value=s.id;$('shiftDate').value=s.date;$('start').value=s.start;$('end').value=s.end;$('breakMin').value=s.breakMin;$('note').value=s.note||'';$('saveShift').textContent='ذخیره تغییرات';previewDate();showTab('shift')};
window.deleteShift=id=>{if(confirm('این شیفت حذف شود؟')){data.shifts=data.shifts.filter(s=>s.id!==id);save();renderHistory()}};
$('filterHistory').addEventListener('click',renderHistory);
$('paymentForm').addEventListener('submit',e=>{e.preventDefault();const p={id:crypto.randomUUID(),date:$('payDate').value,amount:+$('payAmount').value,type:$('payType').value,note:$('payNote').value.trim()};if(!p.date||p.amount<=0){alert('تاریخ و مبلغ معتبر وارد کنید.');return}data.payments.push(p);save();$('paymentForm').reset();$('payDate').value=todayISO()});
window.deletePayment=id=>{if(confirm('این پرداخت حذف شود؟')){data.payments=data.payments.filter(p=>p.id!==id);save()}};
$('settingsForm').addEventListener('submit',e=>{e.preventDefault();data.settings={...data.settings,mode:$('rateMode').value,rate:+$('rate').value,normalHours:+$('normalHours').value,overtime:+$('overtime').value};save();alert('تنظیمات ذخیره شد.')});
$('rateMode').value=data.settings.mode;$('rate').value=data.settings.rate;$('normalHours').value=data.settings.normalHours;$('overtime').value=data.settings.overtime;
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
$('backupBtn').addEventListener('click',()=>download('amo-parviz-backup.json',JSON.stringify(data,null,2),'application/json'));
$('restoreFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!Array.isArray(v.shifts)||!Array.isArray(v.payments)||!v.settings)throw Error();if(!Array.isArray(v.bonuses))v.bonuses=[];v.settings={...defaults.settings,...v.settings};v.welcome={...defaults.welcome,...(v.welcome||{})};if(confirm('اطلاعات فعلی با اطلاعات فایل جایگزین شود؟')){data=v;save();$('rateMode').value=data.settings.mode;$('rate').value=data.settings.rate;$('normalHours').value=data.settings.normalHours;$('overtime').value=data.settings.overtime;alert('بازیابی انجام شد.')}}catch(err){alert('فایل پشتیبان معتبر نیست.')}e.target.value=''});
$('resetBtn').addEventListener('click',()=>{if(confirm('همه شیفت‌ها، پرداخت‌ها و تنظیمات حذف شوند؟')){data=structuredClone(defaults);save();$('storeName').value='';$('managerName').value='';$('roleView').value='manager';$('welcomePerson').value='';$('rateMode').value=data.settings.mode;$('rate').value=data.settings.rate;$('normalHours').value=data.settings.normalHours;$('overtime').value=data.settings.overtime}});
$('csvBtn').addEventListener('click',()=>{const rows=[['تاریخ شمسی','تاریخ میلادی','شروع','پایان','ساعت کار','دستمزد','توضیحات'],...data.shifts.map(s=>{const c=shiftCalc(s);return [jalali(s.date),s.date,s.start,s.end,c.hours.toFixed(2),Math.round(c.wage),s.note||'']})];const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');download('shift-history.csv',csv,'text/csv;charset=utf-8')});

$('bonusForm').addEventListener('submit',e=>{e.preventDefault();const b={id:crypto.randomUUID(),date:todayISO(),person:$('bonusPerson').value.trim(),amount:+$('bonusAmount').value,reason:$('bonusReason').value.trim(),status:'pending',paidDate:''};if(!b.person||b.amount<=0){alert('نام پرسنل و مبلغ معتبر وارد کنید.');return}data.bonuses.push(b);save();$('bonusForm').reset();renderBonuses();});
$('storeForm').addEventListener('submit',e=>{e.preventDefault();data.settings.storeName=$('storeName').value.trim();data.settings.managerName=$('managerName').value.trim();save();alert('مشخصات فروشگاه ذخیره شد.');});
$('saveWelcome').addEventListener('click',()=>{data.welcome={role:$('roleView').value,person:$('welcomePerson').value.trim()};save();renderWelcome();});
$('roleView').addEventListener('change',()=>{data.welcome.role=$('roleView').value;renderWelcome();});
$('welcomePerson').addEventListener('input',renderWelcome);
function updateShiftPreview(){
 const start=$('start').value,end=$('end').value,box=$('shiftPreview');
 if(!start||!end){box.classList.add('hidden');return}
 let duration=mins(end)-mins(start);if(duration<0)duration+=1440;
 duration=Math.max(0,duration-(+$('breakMin').value||0));
 const hours=duration/60,normal=+data.settings.normalHours||8,rate=+data.settings.rate||0;
 let wage=data.settings.mode==='daily'?(rate*Math.min(hours,normal)/normal+Math.max(0,hours-normal)*(rate/normal)*(+data.settings.overtime||1)):(Math.min(hours,normal)*rate+Math.max(0,hours-normal)*rate*(+data.settings.overtime||1));
 box.classList.remove('hidden');
 box.innerHTML=`<div class="muted">خلاصه محاسبه شیفت</div><p style="margin:8px 0">از <b>${esc(start)}</b> تا <b>${esc(end)}</b></p><div>مدت کارکرد: <b>${digits((duration/60).toFixed(2))} ساعت</b></div><div style="margin-top:8px">مبلغ قابل دریافت: <strong>${money(wage)}</strong></div><small class="muted">پس از کسر ${digits(+$('breakMin').value||0)} دقیقه استراحت</small>`;
}
['start','end','breakMin'].forEach(id=>$(id).addEventListener('input',updateShiftPreview));
$('storeName').value=data.settings.storeName||'';
$('managerName').value=data.settings.managerName||'';
$('roleView').value=data.welcome.role||'manager';
$('welcomePerson').value=data.welcome.person||'';
$('bonusPerson').value=data.settings.staffName||'';

$('today').textContent='امروز: '+jalali(todayISO());$('payDate').value=todayISO();resetShiftForm();render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
