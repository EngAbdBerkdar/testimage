// قاعدة العمليات المستخرجة من المحاضرات 2-6 (وليس هناك محاضرة 1 في الملفات المرفوعة)
const P=(k,l,t,d,h,o)=>({k,l,t,d,h,o});
const OPT=a=>a.map(x=>Array.isArray(x)?{v:x[0],l:x[1]}:{v:x,l:x});
const odd=(v,k)=>v[k]>0&&v[k]%2==1?null:`${k} يجب أن يكون عدداً فردياً موجباً`;
const OPS={
grayscale:{cat:'Image Basics',n:'Grayscale',ar:'تحويل إلى رمادي',lec:'م2 (cvtColor في كود الفيديو)',p:[],
 gen(v,c){const p=c.cur,r=c.nv('gray');c.cur=r;c.gray=true;return[[`${r} = cv2.cvtColor(${p}, cv2.COLOR_BGR2GRAY)`,'تحويل الصورة إلى التدرج الرمادي (BGR2GRAY)']]}},
resize:{cat:'Image Transformation',n:'Resize',ar:'تغيير الحجم',lec:'م3 §1.1',
 p:[P('mode','الطريقة','s','size','size: أبعاد محددة (width,height) كما في resize(im,(200,100)). percent: نسبة مئوية كما في scale_percent',OPT([['size','أبعاد محددة'],['percent','نسبة مئوية']])),
 P('w','Width (أعمدة)','n',500,'عدد الأعمدة الجديد؛ يغيّر عرض الصورة'),P('h','Height (أسطر)','n',500,'عدد الأسطر الجديد؛ يغيّر ارتفاعها'),P('pct','Scale %','n',50,'نسبة الحجم النهائي من الأصلي (50 = نصف، 220 = تكبير)')],
 gen(v,c){const p=c.cur,r=c.nv('resized');c.cur=r;if(v.mode=='percent')return[[`h, w = ${p}.shape[:2]`,'قراءة أبعاد الصورة (سطور، أعمدة)'],[`scale_percent = ${v.pct}/100`,'نسبة التحجيم'],[`${r} = cv2.resize(${p}, (int(w*scale_percent), int(h*scale_percent)))`,'تحجيم: المعاملان (عرض، ارتفاع) بالأعداد الصحيحة']];
 return[[`${r} = cv2.resize(${p}, (${v.w}, ${v.h}))`,'تحجيم إلى (width=أعمدة, height=أسطر)']]},
 val:v=>v.mode=='size'&&(v.w<1||v.h<1)?'الأبعاد يجب أن تكون موجبة':v.mode=='percent'&&v.pct<=0?'النسبة يجب أن تكون موجبة':null},
rotate:{cat:'Image Transformation',n:'Rotation',ar:'تدوير',lec:'م3 §1.2',
 p:[P('angle','Rotation Angle','n',90,'زاوية التدوير بالدرجات'),P('dir','Direction','s','ccw','الاتجاه الموجب في المحاضرة عكس عقارب الساعة',OPT([['ccw','عكس عقارب الساعة (+)'],['cw','مع عقارب الساعة (-)']])),P('scale','Scale','n',1,'1.0 يحافظ على الحجم، 0.5 نصف الحجم')],
 gen(v,c){const p=c.cur,r=c.nv('rotated'),a=v.dir=='cw'?-v.angle:v.angle;c.cur=r;return[[`h, w = ${p}.shape[:2]`,'أبعاد الصورة'],['center = (w//2, h//2)','مركز التدوير = مركز الصورة (x,y)'],[`m = cv2.getRotationMatrix2D(center, ${a}, ${v.scale})`,'بناء مصفوفة التدوير'],[`${r} = cv2.warpAffine(${p}, m, (w, h))`,'تطبيق المصفوفة؛ تُقصّ الزوايا لأن الحجم ثابت']]}},
crop:{cat:'Image Transformation',n:'Crop',ar:'اقتطاع',lec:'م3 §1.3',
 p:[P('h1','h1 (سطر البداية)','n',0,''),P('h2','h2 (سطر النهاية)','n',100,'غير مشمول'),P('w1','w1 (عمود البداية)','n',0,''),P('w2','w2 (عمود النهاية)','n',100,'غير مشمول')],
 gen(v,c){const p=c.cur,r=c.nv('crop');c.cur=r;return[[`${r} = ${p}[${v.h1}:${v.h2}, ${v.w1}:${v.w2}]`,'اقتطاع im[h1:h2, w1:w2]']]},
 val:v=>v.h2<=v.h1||v.w2<=v.w1?'يجب أن تكون النهاية أكبر من البداية':null},
gamma:{cat:'Intensity Transformation',n:'Gamma Correction',ar:'تصحيح غاما',lec:'م4 §4.1',
 p:[P('g','Gamma Value','n',0.5,'أكبر من 1 تعتّم، أصغر من 1 تفتّح'),P('m','الطريقة','s','sk','sk: exposure.adjust_gamma (كود المحاضرة). manual: cv2.pow المعلّق في المحاضرة',OPT([['sk','skimage adjust_gamma'],['manual','cv2.pow يدوياً']]))],
 gen(v,c){const p=c.cur,r=c.nv('gamma');c.cur=r;c.use('np');if(v.m=='manual')return[[`${r} = np.uint8(cv2.pow(${p}/255.0, ${v.g})*255)`,'[تعديل] تطبيع إلى [0,1] ثم قانون s=r^γ ثم إعادة إلى uint8 (المحاضرة تعرض أول سطرين فقط)']];c.use('exposure');return[[`${r} = exposure.adjust_gamma(${p}, ${v.g})`,'تصحيح غاما بالدالة الجاهزة']]},
 val:v=>v.g<=0?'gamma يجب أن تكون موجبة':null},
arith:{cat:'Intensity Transformation',n:'Add / Subtract / Multiply / Divide',ar:'عمليات حسابية',lec:'م3 تمرين 3',
 p:[P('op','العملية','s','add','تقصّ القيم عند 0 و255',OPT(['add','subtract','multiply','divide'])),P('val','Value','n',40,'القيمة الثابتة')],
 gen(v,c){const p=c.cur,r=c.nv(v.op);c.cur=r;if(c.gray)return[[`${r} = cv2.${v.op}(${p}, ${v.val})`,'عملية حسابية على كل البكسلات مع القصّ']];c.use('np');return[[`${r} = cv2.${v.op}(${p}, np.full_like(${p}, ${v.val}))`,'[تعديل] للصورة الملونة نستعمل مصفوفة بالحجم نفسه كي تشمل كل القنوات']]}},
equalize:{cat:'Histogram Processing',n:'Histogram Equalization',ar:'تسوية الهيستوغرام',lec:'م3 §3',g:1,p:[],
 gen(v,c){const p=c.cur,r=c.nv('equ');c.cur=r;return[[`${r} = cv2.equalizeHist(${p})`,'تسوية الهيستوغرام لتحسين التباين']]}},
histogram:{cat:'Histogram Processing',n:'Histogram',ar:'الهيستوغرام',lec:'م3 §3',g:1,
 p:[P('m','الطريقة','s','plt','matplotlib: plt.hist. opencv: cv2.calcHist ثم plt.plot',OPT([['plt','matplotlib (plt.hist)'],['cv','opencv (cv2.calcHist)']])),P('bins','histSize','n',256,'عدد الأعمدة')],
 gen(v,c){const p=c.cur;c.use('plt');c.plt=1;if(v.m=='cv')return[[`hist = cv2.calcHist([${p}], [0], None, [${v.bins}], [0, ${v.bins}])`,'حساب الهيستوغرام (mask=None لكامل الصورة)'],['plt.figure()','نافذة رسم'],['plt.plot(hist)','رسم المنحنى']];return[['plt.figure()','نافذة رسم'],[`plt.hist(${p}.ravel(), ${v.bins}, [0, ${v.bins}])`,'ravel يسطّح المصفوفة ثم hist ترسم التوزع']]}},
mean:{cat:'Spatial Filtering',n:'Mean Filter',ar:'مرشح المتوسط',lec:'م5 §5.4.1',p:[P('w','عرض القناع','n',3,''),P('h','ارتفاع القناع','n',3,'')],
 gen(v,c){const p=c.cur,r=c.nv('mean');c.cur=r;return[[`${r} = cv2.blur(${p}, (${v.w}, ${v.h}))`,'مرشح متوسط (عرض، ارتفاع)']]}},
gaussian:{cat:'Spatial Filtering',n:'Gaussian Filter',ar:'المرشح الغوصي',lec:'م5 §5.4.2',p:[P('k','Kernel size (m)','n',5,'فردي'),P('s','Sigma','n',0,'0 يعني حسابها تلقائياً')],
 gen(v,c){const p=c.cur,r=c.nv('gauss');c.cur=r;return[[`${r} = cv2.GaussianBlur(${p}, (${v.k}, ${v.k}), ${v.s})`,'مرشح غاوس']]},val:v=>odd(v,'k')},
median:{cat:'Spatial Filtering',n:'Median Filter',ar:'المرشح الوسيط',lec:'م5 §5.5',p:[P('k','Kernel size (m)','n',3,'فردي')],
 gen(v,c){const p=c.cur,r=c.nv('median');c.cur=r;return[[`${r} = cv2.medianBlur(${p}, ${v.k})`,'وسيط الجوار؛ مثالي لملح وفلفل']]},val:v=>odd(v,'k')},
bilateral:{cat:'Spatial Filtering',n:'Bilateral Filter',ar:'المرشح الثنائي',lec:'م5 §5.4.3',p:[P('d','d','n',5,'حجم القناع'),P('sc','sigmaColor','n',75,''),P('ss','sigmaSpace','n',75,'')],
 gen(v,c){const p=c.cur,r=c.nv('bilat');c.cur=r;return[[`${r} = cv2.bilateralFilter(${p}, ${v.d}, ${v.sc}, ${v.ss})`,'ترشيح يحفظ الحواف (بطيء)']]}},
noise:{cat:'Spatial Filtering',n:'Add Noise',ar:'إضافة ضجيج',lec:'م5 §5.3',
 p:[P('m','النوع','s','gaussian','',OPT([['gaussian','Gaussian'],['s&p','Salt & Pepper'],['speckle','Speckle']])),P('var','var (التباين)','n',0.01,'تباين وليس انحرافاً معيارياً'),P('amount','amount','n',0.05,'نسبة بكسلات s&p'),P('back','تحويل إلى uint8','c',true,'random_noise تعيد float في [0,1]')],
 gen(v,c){const p=c.cur,r=c.nv('noisy');c.cur=r;c.use('skimage');c.use('np');const a=v.m=='s&p'?`amount=${v.amount}`:`mean=0, var=${v.var}`;const o=[[`${r} = skimage.util.random_noise(${p}, '${v.m}', ${a})`,'إضافة الضجيج']];if(v.back)o.push([`${r} = (${r}*255).astype(np.uint8)`,'[تعديل] إعادة إلى uint8 كي تعمل مرشحات OpenCV']);return o}},
threshold:{cat:'Image Segmentation',n:'Threshold',ar:'التعتيب',lec:'م5 §5.7 / م6',g:1,p:[P('t','thresh','n',127,'العتبة'),P('mv','maxval','n',255,'')],
 gen(v,c){const p=c.cur,r=c.nv('thresh');c.cur=r;return[[`ret, ${r} = cv2.threshold(${p}, ${v.t}, ${v.mv}, cv2.THRESH_BINARY)`,'فوق العتبة → maxval وإلا 0']]}},
sobel:{cat:'Edge Detection',n:'Sobel',ar:'سوبل',lec:'م6 §6.3',g:1,p:[P('dir','الاتجاه','s','x','x: حواف عمودية، y: أفقية',OPT([['x','dx=1 (حواف عمودية)'],['y','dy=1 (حواف أفقية)']])),P('k','ksize','s',3,'',OPT([1,3,5,7]))],
 gen(v,c){const p=c.cur,r=c.nv('sobel');c.cur=r;c.use('np');return[[`${r} = np.absolute(cv2.Sobel(${p}, cv2.CV_64F, ${v.dir=='x'?'1, 0':'0, 1'}, ksize=${v.k}))`,'سوبل بعمق CV_64F ثم القيمة المطلقة (كما في المحاضرة)'],[`${r} = np.uint8(np.clip(${r}, 0, 255))`,'[تعديل] تحويل إلى uint8 لمتابعة الـ pipeline']]}},
laplacian:{cat:'Edge Detection',n:'Laplacian',ar:'لابلاسيان',lec:'م6 §6.4.1',g:1,p:[],
 gen(v,c){const p=c.cur,r=c.nv('lap');c.cur=r;c.use('np');return[[`${r} = np.absolute(cv2.Laplacian(${p}, cv2.CV_64F))`,'لابلاسيان ثم القيمة المطلقة'],[`${r} = np.uint8(np.clip(${r}, 0, 255))`,'[تعديل] تحويل إلى uint8']]}},
canny:{cat:'Edge Detection',n:'Canny',ar:'كاني',lec:'م6 §6.4.2',g:1,p:[P('t1','threshold1 (دنيا)','n',100,'تحتها تُرفض'),P('t2','threshold2 (عليا)','n',200,'فوقها تُقبل')],
 gen(v,c){const p=c.cur,r=c.nv('canny');c.cur=r;return[[`${r} = cv2.Canny(${p}, ${v.t1}, ${v.t2})`,'كاشف كاني بعتبتين']]},val:v=>v.t1>=v.t2?'يجب أن تكون الدنيا أصغر من العليا':null},
unsharp:{cat:'Edge Detection',n:'Unsharp Mask (Sharpen)',ar:'تعزيز الصورة',lec:'م6 §6.7',g:1,p:[P('r','radius','n',5,'نصف قطر التنعيم'),P('a','amount','n',2,'مضاعفة الفرق'),P('back','تحويل إلى uint8','c',true,'الدالة تعيد float')],
 gen(v,c){const p=c.cur,r=c.nv('sharp');c.cur=r;c.use('unsharp');c.use('np');const o=[[`${r} = unsharp_mask(${p}, radius=${v.r}, amount=${v.a})`,'original + amount*(original - blur)']];if(v.back)o.push([`${r} = (np.clip(${r}, 0, 1)*255).astype(np.uint8)`,'[تعديل] إعادة إلى uint8']);return o}},
show:{cat:'Image Basics',n:'Show Image',ar:'عرض الصورة',lec:'م2',p:[P('b','الطريقة','s','cv2','',OPT([['cv2','cv2.imshow'],['plt','matplotlib']])),P('t','عنوان النافذة','t','image','')],
 gen(v,c){const p=c.cur,t=pyS(v.t);if(v.b=='plt'){c.use('plt');c.plt=1;return[['plt.figure()','نافذة'],c.gray?[`plt.imshow(${p}, cmap='gray')`,'عرض رمادي']:[`plt.imshow(cv2.cvtColor(${p}, cv2.COLOR_BGR2RGB))`,'[تعديل] BGR→RGB لأن matplotlib يفترض RGB']]}return[[`cv2.imshow(${t}, ${p})`,'عرض'],['cv2.waitKey(0)','انتظار مفتاح'],['cv2.destroyAllWindows()','إغلاق النوافذ']]}},
save:{cat:'Image Basics',n:'Save Image',ar:'حفظ الصورة',lec:'م2',p:[P('f','اسم الملف','t','result.png','الامتداد يحدد الصيغة')],
 gen(v,c){return[[`cv2.imwrite(${pyS(v.f)}, ${c.cur})`,'حفظ الصورة الحالية']]}}
};
function pyS(s){return "'"+String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'"}
const IMPORTS={cv2:'import cv2',np:'import numpy as np',plt:'import matplotlib.pyplot as plt',skimage:'import skimage',exposure:'from skimage import exposure',unsharp:'from skimage.filters import unsharp_mask'};
function generate(pipe,g){
 const c={cur:'img',gray:+g.flag===0,n:0,libs:new Set(['cv2']),mods:[],plt:0,use(l){this.libs.add(l)},nv(s){return 's'+(++this.n)+'_'+s}};
 const body=[],warns=[],params=[];
 const emit=(o,v)=>{const g0=c.gray;if(o.g&&!c.gray){const r=c.nv('gray');body.push([`${r} = cv2.cvtColor(${c.cur}, cv2.COLOR_BGR2GRAY)`,`[تعديل] ${o.n} تتطلب صورة رمادية فأُضيف تحويل`]);c.cur=r;c.gray=true;warns.push(`أُضيف تحويل إلى رمادي قبل ${o.n}`)}body.push(...o.gen(v,c))};
 for(const [i,op] of pipe.entries()){const o=OPS[op.id];const e=o.val&&o.val(op.v);if(e)return{error:`العملية ${i+1} (${o.n}): ${e}`};emit(o,op.v);params.push({o,v:op.v,i})}
 if(g.show)emit(OPS.show,{b:g.backend,t:'result'});if(g.save)emit(OPS.save,{f:g.out});
 if(c.plt)body.push(['plt.show()','إظهار كل رسوم matplotlib']);
 const L=[...[...c.libs].map(k=>[IMPORTS[k],'استدعاء مكتبة'])];
 const head=`#pipeline.py\n${L.map(x=>x[0]).join('\n')}\nimage_path = ${pyS(g.path)}\nimg = cv2.imread(image_path, ${g.flag})\nif img is None:\n    raise SystemExit('تعذر قراءة الصورة، تحقق من المسار: ' + image_path)\ntry:\n`;
 const code=head+body.map(x=>'    '+x[0]).join('\n')+'\nexcept Exception as e:\n    print("خطأ أثناء المعالجة:", e)\n';
 const lines=[...L,['image_path = ...','مسار الصورة'],['img = cv2.imread(image_path, flag)',`قراءة الصورة (flag=${g.flag}: 1 ملونة، 0 رمادية، -1 كما هي)`],['if img is None: ...','imread تعيد None عند خطأ المسار [تعديل: فحص إضافي]'],['try: ... except','[تعديل] معالجة الأخطاء'],...body];
 return{code,lines,warns,params};
}
if(typeof module!=='undefined')module.exports={OPS,generate};
