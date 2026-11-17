const $=s=>document.querySelector(s),KEY='dipgen_v1';
var pipe=[],editing=null,uid=0;
const defv=id=>Object.fromEntries(OPS[id].p.map(p=>[p.k,p.d]));
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify({pipe,g:glob()}))}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d)return;pipe=d.pipe.filter(x=>OPS[x.id]);uid=pipe.length;const g=d.g;$('#path').value=g.path;$('#flag').value=g.flag;$('#show').checked=g.show;$('#backend').value=g.backend;$('#save').checked=g.save;$('#out').value=g.out}catch(e){}}
const glob=()=>({path:$('#path').value||'aa.jpg',flag:$('#flag').value,show:$('#show').checked,backend:$('#backend').value,save:$('#save').checked,out:$('#out').value||'result.png'});
const cats=[...new Set(Object.values(OPS).map(o=>o.cat))];
function initSel(){$('#cat').innerHTML=cats.map(c=>`<option>${c}</option>`).join('');$('#cat').onchange=()=>{fillOps();showForm()};$('#op').onchange=()=>showForm();fillOps();
 $('#side').innerHTML=cats.map(c=>`<h4>${c}</h4>`+Object.entries(OPS).filter(([k,o])=>o.cat==c).map(([k,o])=>`<button data-id="${k}">${o.n}<br><small>${o.ar}</small></button>`).join('')).join('');
 $('#side').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.id)}}
function fillOps(){$('#op').innerHTML=Object.entries(OPS).filter(([k,o])=>o.cat==$('#cat').value).map(([k,o])=>`<option value="${k}">${o.n} — ${o.ar}</option>`).join('')}
function pick(id){$('#cat').value=OPS[id].cat;fillOps();$('#op').value=id;editing=null;showForm()}
function formHTML(id,v){return OPS[id].p.map(p=>{const val=v[p.k];let i;if(p.t=='s')i=`<select data-k="${p.k}">${p.o.map(o=>`<option value="${o.v}"${o.v==val?' selected':''}>${o.l}</option>`).join('')}</select>`;else if(p.t=='c')i=`<input type="checkbox" data-k="${p.k}"${val?' checked':''}>`;else i=`<input data-k="${p.k}" type="${p.t=='n'?'number':'text'}" step="any" value="${esc(val)}">`;return`<label title="${esc(p.h||'')}">${p.l}${i}</label>`}).join('')}
function readForm(root,id){const v={};OPS[id].p.forEach(p=>{const e=root.querySelector(`[data-k="${p.k}"]`);v[p.k]=p.t=='c'?e.checked:p.t=='n'?parseFloat(e.value):p.t=='s'&&typeof p.o[0].v=='number'?+e.value:e.value});return v}
function showForm(){const id=$('#op').value,o=OPS[id];$('#info').textContent=`المصدر: ${o.lec}${o.g?' — تتطلب صورة رمادية':''}`;$('#form').innerHTML=formHTML(id,editing?pipe[editing.i].v:defv(id));$('#err').textContent='';$('#add').textContent=editing?'تحديث العملية':'إضافة إلى القائمة';$('#cancel').hidden=!editing}
function summary(x){return OPS[x.id].p.map(p=>`${p.k}=${x.v[p.k]}`).join(', ')}
function renderPipe(){$('#pipe').innerHTML=pipe.map((x,i)=>`<li draggable="true" data-i="${i}"><span class="h">⠿ ${i+1}</span><span class="s"><b>${OPS[x.id].n}</b> <code>${esc(summary(x))}</code></span><button data-a="edit">تعديل</button><button data-a="dup">تكرار</button><button data-a="up">↑</button><button data-a="dn">↓</button><button data-a="del">حذف</button></li>`).join('')||'<li class="muted">لا توجد عمليات بعد</li>';save()}
function move(a,b){if(b<0||b>=pipe.length||a==b)return;pipe.splice(b,0,pipe.splice(a,1)[0]);renderPipe()}
$('#pipe').onclick=e=>{const b=e.target.closest('button'),li=e.target.closest('li');if(!b||!li)return;const i=+li.dataset.i,a=b.dataset.a;
 if(a=='del')pipe.splice(i,1);else if(a=='dup')pipe.splice(i+1,0,{uid:++uid,id:pipe[i].id,v:{...pipe[i].v}});else if(a=='up')return move(i,i-1);else if(a=='dn')return move(i,i+1);else if(a=='edit'){editing={i};pick2(pipe[i].id);return}renderPipe()};
function pick2(id){$('#cat').value=OPS[id].cat;fillOps();$('#op').value=id;showForm()}
let drag=null;$('#pipe').ondragstart=e=>{drag=+e.target.dataset.i};$('#pipe').ondragover=e=>e.preventDefault();$('#pipe').ondrop=e=>{e.preventDefault();const li=e.target.closest('li');if(li&&drag!=null)move(drag,+li.dataset.i);drag=null};
$('#add').onclick=()=>{const id=$('#op').value,v=readForm($('#form'),id),o=OPS[id];if(o.p.some(p=>p.t=='n'&&isNaN(v[p.k]))){$('#err').textContent='أدخل قيماً رقمية صحيحة';return}const e=o.val&&o.val(v);if(e){$('#err').textContent=e;return}
 if(editing){pipe[editing.i]={...pipe[editing.i],id,v};editing=null}else pipe.push({uid:++uid,id,v});showForm();renderPipe()};
$('#cancel').onclick=()=>{editing=null;showForm()};$('#clear').onclick=()=>{pipe=[];renderPipe()};
function hl(code){return esc(code).replace(/(#.*$)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(import|from|as|try|except|if|is|None|raise|and|or|not|for|in)\b|\b(\d+\.?\d*)\b|\b([a-zA-Z_][\w.]*)(?=\()/gm,(m,c,s,k,n,f)=>c?`<span class="cm">${c}</span>`:s?`<span class="s2">${s}</span>`:k?`<span class="k">${k}</span>`:n?`<span class="nu">${n}</span>`:`<span class="f">${f}</span>`)}
$('#gen').onclick=()=>{const r=generate(pipe,glob());$('#res').hidden=false;if(r.error){$('#msgs').innerHTML=`<p class="err">${r.error}</p>`;$('#code').textContent='';return}
 if(!pipe.length&&!glob().show&&!glob().save){$('#msgs').innerHTML='<p class="warn">القائمة فارغة: أضف عمليات أولاً</p>'}else $('#msgs').innerHTML=r.warns.map(w=>`<p class="warn">⚠ ${w}</p>`).join('');
 $('#code').innerHTML=hl(r.code);window.lastCode=r.code;
 $('#lines').innerHTML=r.lines.map(l=>`<tr><td>${esc(l[0])}</td><td>${esc(l[1])}</td></tr>`).join('');
 $('#pdoc').innerHTML=r.params.map(({o,v,i})=>`<p><b>${i+1}. ${o.n}</b> (${o.lec})</p><ul>${o.p.map(p=>`<li><code>${p.k}=${esc(v[p.k])}</code> — ${p.l}: ${esc(p.h||'')}</li>`).join('')||'<li>بلا معاملات</li>'}</ul>`).join('')};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.lastCode)}catch(e){const t=document.createElement('textarea');t.value=window.lastCode;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}$('#copy').textContent='تم النسخ ✓';setTimeout(()=>$('#copy').textContent='Copy Code',1500)};
$('#dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([window.lastCode],{type:'text/x-python'}));a.download=$('#fname').value||'pipeline.py';a.click()};
['path','flag','show','backend','save','out'].forEach(i=>$('#'+i).onchange=save);
// ---- NL parser (كلمات مفتاحية فقط، بلا أي API) ----
const norm=s=>s.toLowerCase().replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g,'.');
const num=t=>{const m=t.match(/-?\d+(?:\.\d+)?/);return m?parseFloat(m[0]):null};
const NL=[['equalize',/تسويه\s*(ال)?(هيستوغرام|هستوغرام)|equali[sz]/,()=>({})],
['noise',/(ضجيج|تشويش|noise)/,(t,s)=>({m:/ملح|فلفل|salt|s&p/.test(t)?'s&p':/ضربي|speckle/.test(t)?'speckle':'gaussian'})],
['histogram',/هيستوغرام|هستوغرام|histogram/,t=>({m:/opencv|calchist/.test(t)?'cv':'plt'})],
['grayscale',/رمادي|رماديه|gr[ae]y(scale)?/,()=>({})],
['resize',/resize|تصغير|تكبير|تحجيم|تغيير الحجم|صغر|كبر|قلل حجم/,t=>{const w=t.match(/(\d+)\s*[x*×]\s*(\d+)/),p=t.match(/(\d+(?:\.\d+)?)\s*(%|بالمئه|بالمايه|بالمائه|percent)/);if(w)return{mode:'size',w:+w[1],h:+w[2]};if(p)return{mode:'percent',pct:+p[1]};if(/نصف|half/.test(t))return{mode:'percent',pct:50};if(/ضعف|double/.test(t))return{mode:'percent',pct:200};return null}],
['rotate',/rotat|تدوير|دور|لف |استداره/,t=>{const a=num(t);if(a===null)return null;const cw=/(?<!عكس )(مع عقارب|(?<!counter)clockwise)/.test(t)&&!/counter|anti|عكس/.test(t);return{angle:Math.abs(a),dir:cw||a<0?'cw':'ccw'}}],
['gamma',/gamma|غاما|جاما/,t=>{const g=num(t);return g===null?null:{g}}],
['gaussian',/gaussian|غوصي|غاوسي|غوسي/,t=>({k:num(t)||5})],
['median',/median|وسيط/,t=>({k:num(t)||3})],
['bilateral',/bilateral|مرشح ثنائي|فلتر ثنائي/,()=>({})],
['mean',/\bblur\b|mean filter|average|متوسط|تمويه|تنعيم/,t=>{const m=t.match(/(\d+)\s*[x*×]\s*(\d+)/);return m?{w:+m[1],h:+m[2]}:null}],
['canny',/canny|كاني/,()=>({})],['sobel',/sobel|سوبل/,t=>({dir:/dy|افقي|horizontal/.test(t)?'y':'x'})],['laplacian',/laplac|لابلاس/,()=>({})],
['unsharp',/unsharp|sharpen|تعزيز|شحذ/,()=>({})],['threshold',/threshold|تعتيب|binar|عتبه/,t=>{const x=num(t);return x===null?null:{t:x}}],
['arith',/زياده السطوع|brighten|add |جمع|طرح|subtract|تعتيم|darken|ضرب|multiply|قسمه|divide/,t=>{const x=num(t);const op=/طرح|subtract|تعتيم|darken/.test(t)?'subtract':/ضرب|multiply/.test(t)?'multiply':/قسم|divide/.test(t)?'divide':'add';return x===null?null:{op,val:x}}],
['crop',/crop|اقتطاع|اقتطع|قص /,()=>null],
['save',/save|احفظ|حفظ/,t=>{const m=t.match(/[\w-]+\.(png|jpg|jpeg|bmp|tif)/);return m?{f:m[0]}:null}],['show',/imshow|show|display|اعرض|عرض/,()=>({})]];
const OUT=/(flip|translate|dilat|erod|morpholog|fft|fourier|hsv|contour|interpolat|استيفاء|تاكل|توسيع مورف|فورييه|عكس افقي)/;
function parseNL(txt){const clauses=norm(txt).split(/\bthen\b|and then|after that|ثم|بعدها|بعد ذلك|[,،;؛\n]|\.(?=\s|$)/).map(s=>s.trim()).filter(Boolean);const found=[],unknown=[],notes=[];
 for(const cl of clauses){if(OUT.test(cl)){notes.push(`«${cl}»: عملية غير موجودة بالمحاضرات`);continue}
  const hits=[];for(const [id,re,ex] of NL){const g=new RegExp(re.source,'g');let m;while((m=g.exec(cl))){if(!hits.some(h=>m.index<h.e&&m.index+m[0].length>h.s))hits.push({id,s:m.index,e:m.index+m[0].length,ex})}}
  hits.sort((a,b)=>a.s-b.s);if(!hits.length){unknown.push(cl);continue}
  hits.forEach((h,i)=>{const seg=cl.slice(h.e,hits[i+1]?hits[i+1].s:undefined),before=cl.slice(i?hits[i-1].e:0,h.s);const v=h.ex(seg,cl)||h.ex(before,cl)||null;const o=OPS[h.id];
   if(v===null&&o.p.length&&!['equalize','histogram','grayscale','canny','laplacian','show'].includes(h.id)){notes.push(`«${cl}»: فُهمت العملية ${o.n} لكن لم تُذكر قيمها، راجع القيم الافتراضية`);}
   found.push({uid:++uid,id:h.id,v:{...defv(h.id),...(v||{})}})})}
 return{found,unknown,notes}}
$('#parse').onclick=()=>{const r=parseNL($('#nl').value);const box=$('#nlout');box.innerHTML='';
 if(!r.found.length)box.innerHTML+='<p class="err">لم أفهم الطلب. اختر العملية من القوائم أعلاه.</p>';
 r.unknown.forEach(u=>box.innerHTML+=`<p class="err">لم أفهم: «${esc(u)}» — اخترها من القائمة</p>`);r.notes.forEach(n=>box.innerHTML+=`<p class="warn">⚠ ${esc(n)}</p>`);
 if(r.found.length){box.innerHTML+=r.found.map((x,i)=>`<details open data-j="${i}"><summary><b>${OPS[x.id].n}</b> <code>${esc(summary(x))}</code></summary><div class="row">${formHTML(x.id,x.v)}</div></details>`).join('')+'<button id="addnl" class="pri">إضافة المحدد إلى القائمة</button>';
  $('#addnl').onclick=()=>{box.querySelectorAll('details').forEach(d=>{const x=r.found[+d.dataset.j];pipe.push({uid:x.uid,id:x.id,v:readForm(d,x.id)})});box.innerHTML='';renderPipe()}}};
window.parseNL=parseNL;
load();initSel();showForm();renderPipe();
