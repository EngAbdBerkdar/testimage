# DIP Code Generator

تطبيق ويب محلي (HTML/CSS/JS فقط، بلا Backend ولا API) يولّد كود Python من عمليات محاضرات معالجة الصور 2–6. لا يعالج صوراً ولا يرفعها.

**التشغيل:** افتح `index.html` في المتصفح.

## الملفات
- `index.html` / `style.css` / `script.js`: الواجهة (Dark، RTL، Sidebar، Pipeline، سحب وإفلات، Copy/Download، تظليل Python، LocalStorage).
- `operations.js`: قاعدة العمليات وقوالب الكود (المصدر الفعلي للتشغيل).
- `operations.json`: تصدير لبيانات العمليات ومعاملاتها (للتوثيق؛ التطبيق يقرأ `operations.js` كي يعمل من `file://`).
- `test.js` و`test_ui.js`: اختبارات (Node + jsdom: `npm i jsdom` ثم `node test_ui.js`).

## العمليات المتوفرة
Grayscale, Resize, Rotation, Crop, Gamma, Add/Subtract/Multiply/Divide, Histogram Equalization, Histogram, Mean, Gaussian, Median, Bilateral, Add Noise, Threshold, Sobel, Laplacian, Canny, Unsharp Mask, Show, Save.

## قواعد الكود المولَّد
- يلتزم بدوال المحاضرات؛ كل سطر يخالف كود الدكتور يُوسَم في الشرح بـ **[تعديل]** مع السبب (فحص `None`، `try/except`، تحويل إلى `uint8`، تحويل إلى رمادي تلقائي قبل العمليات التي تتطلبه).
- `Interpolation` غير موجودة بالمحاضرات فلا تظهر.
- اللغة الطبيعية: كلمات مفتاحية فقط؛ ما لا يُفهم يُعرض كـ «لم أفهم» ولا يُضاف شيء. العمليات خارج المنهاج (flip, dilate...) تظهر كتنبيه.
- التحليل يفسّر «تصغير بنسبة 50%» كنسبة الحجم النهائي (`scale_percent` كما في المحاضرة).
