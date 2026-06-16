# PROJECT_HISTORY_AND_STATUS

## أولًا: معلومات عامة عن المشروع
* **اسم المشروع:** منصة نحت العقارية (Naht-Platform)
* **مسار المشروع المحلي:** `c:\Users\Rayyan Naht\Desktop\Naht-ERP\6-naht-platform`
* **التقنية المستخدمة:** Next.js (App Router), Prisma, SQLite, TailwindCSS, TypeScript
* **الفرع الحالي:** `ui-refinements`
* **آخر Batch معتمد رسميًا:** Batch 14
* **آخر Batch قيد التنفيذ:** Batch 15 (Map Refinements & Map Manager)
* **آخر Backup رسمي:** `naht-platform-backup-after-batch-14-real-estate-products-stable`
* **آخر Backup WIP:** `naht-platform-wip-backup-before-pins-settings` (ويوجد أيضاً: `naht-platform-wip-backup-pause-before-batch-15-geographic-map-testing`)

## ثانيًا: التسلسل التاريخي للعمل
* **بداية المشروع:** تأسيس بيئة العمل واختيار التقنيات (Next.js, Prisma, TailwindCSS, TypeScript).
* **بناء CRM:** بناء نظام إدارة شامل ومتكامل كلوحة تحكم (Dashboard) مخصصة لفريق المبيعات والتسويق والإدارة.
* **المنتجات العقارية:** تأسيس نماذج المشاريع والوحدات العقارية، وربطها بالخريطة، وإدارة التفاصيل (الصور، المرافق، الإحداثيات).
* **Leads (العملاء المحتملين):** تأسيس نظام استقبال وتسجيل وتوزيع وتتبع Leads مع ميزات فلترة ومتابعة وربطها بالموظفين.
* **Campaigns / Tracking:** بناء نظام متطور لإدارة الروابط التسويقية وتتبع النقرات والمصادر (UTM) ودمجه مع Leads و Google Ads/Meta Pixels.
* **CMS (نظام إدارة المحتوى):** بناء وحدة مركزية للتحكم في جميع نصوص وصور الصفحات (الرئيسية، من نحن، تواصل معنا، إعدادات الموقع، Footer، FAQs) دون الحاجة للمبرمج.
* **الصلاحيات:** تفعيل Role-based access control (ADMIN, MARKETING, SALES) وحماية المسارات بناءً على الصلاحية.
* **تصميم الصفحة الرئيسية:** واجهة عصرية فخمة تعكس هوية الشركة ومستوى المشاريع، متجاوبة بالكامل.
* **Batch 14 المعتمد رسميًا:** تعزيز عرض المنتجات العقارية في الواجهة، تصميم صفحة /projects وتفاصيل المشاريع الفردية، وتوثيق النظام بشكل نهائي لبيئة مستقرة.

* **Batch 15 (قيد الاختبار النهائي - غير معتمد بعد):**
  * الانتقال لـ **Geographic Map** باستخدام مكتبة **Leaflet / React Leaflet**.
  * إنشاء صفحة إدارة مركزية مخصصة **`/crm/projects-map`**.
  * إدارة إحداثيات ومواقع المنتجات العقارية من لوحة التحكم.
  * توفير **Zoom Controls** واضحة.
  * تحسين وتجميل **Popup Button** (زر عرض التفاصيل).
  * إصلاح نظام الفلترة **Filters** ليعمل ديناميكياً مع الخريطة الجغرافية.
  * برمجة **Pins Settings** للتحكم الكامل في (ألوان علامات الحالات 5، رفع شعار العلامة، التحكم بحجم الشعار).
  * إضافة **Map Style Settings** لتوفير قوالب جاهزة (Presets) وتحكم متقدم بـ **CSS Filters** (سطوع، تباين، تشبع، تدرج).
  * تنفيذ **Live Map Preview** ليعرض معاينة حية لأي تعديلات داخل لوحة التحكم قبل الحفظ.
  * **حذف إمضاء PUIUX** من حقوق الخريطة.
  * **إبقاء CARTO / OSM Attribution** بشكل نظامي مصغر لتفادي الإزعاج البصري.
  * **النتيجة:** Batch 15 مُنجز برمجياً ولكن ما زال بحاجة لاعتماد المستخدم.

## ثالثًا: الحالة الحالية للمشروع
* **أين توقفنا الآن:** أنهينا كافة طلبات Batch 15 (بما فيها Live Preview). المشروع الآن في مرحلة الإيقاف المؤقت (Pause) للاختبار الميداني من قِبل المستخدم ولاستئناف العمل لاحقاً.
* **ماذا يعمل حاليًا:** الخريطة الجغرافية بجميع أجزائها، إعدادات التحكم بالألوان والشعارات والخريطة الجغرافية، المعاينة المباشرة (Live Preview)، ونظام التوثيق والمتابعة.
* **ماذا لم يتم اعتماده بعد:** جميع أعمال Batch 15 تنتظر قرار الاعتماد النهائي ليتم عمل Commit لها.
* **ما الذي يحتاج اختبار:** يجب على المستخدم اختبار الخريطة الجغرافية في الصفحة الرئيسية، واختبار Live Preview في صفحة `/crm/projects-map`، والتأكد من توافق الألوان.
* **آخر نتيجة npm run build:** نجاح تام دون أخطاء (`Compiled successfully`).
* **آخر نتيجة git status:** تعديلات معلقة ولم يتم عمل `Commit` إطلاقاً.

## رابعًا: تفاصيل Batch 15 الحالية
**(Batch 15 ما زال قيد التنفيذ ولم يتم اعتماده رسميًا بعد)**
* الانتقال من وضع الصورة إلى **Geographic Map** باستخدام Leaflet / React Leaflet كإعداد افتراضي.
* إنشاء وبرمجة صفحة مركزية **`/crm/projects-map`** تحت قسم المنتجات العقارية في CRM وتحديد صلاحياتها بـ ADMIN و MARKETING.
* إصلاح **Zoom Controls** (إظهار الأزرار أسفل يمين).
* إصلاح وتجميل **Popup Button** وتحويل لونه لهوية نحت.
* إصلاح **Filters** لتعتمد على القيم الإنجليزية الصحيحة من قاعدة البيانات.
* تنفيذ **إعدادات Pins المطلوبة** (ألوان الحالات الـ 5، شعار العلامة، رفع الشعار والتحكم بحجمه).
* إزالة نص **PUIUX** من Attribution بالكامل.
* الإبقاء على **CARTO / OSM attribution** بشكل قانوني ومصغر أسفل يسار الخريطة لتفادي الإزعاج البصري.
* تنفيذ **إعدادات ألوان الخريطة (Map Style Settings)** من داخل لوحة التحكم مع تحكم متقدم باستخدام CSS Filters وقوالب جاهزة.
* تنفيذ ميزة **Live Map Preview** داخل `/crm/projects-map` تعكس التعديلات لحظياً قبل الحفظ.
* **مهم:** عدم عمل Commit أو Backup رسمي حتى اعتماد الاختبار النهائي من المستخدم.

## خامسًا: أوامر التشغيل والاستعادة
في حالة فتح المشروع أو استعادته، قم بتشغيل الأوامر التالية بالترتيب:
```bash
cd "c:\Users\Rayyan Naht\Desktop\Naht-ERP\6-naht-platform"
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
```
**ملاحظة هامة جداً:** إذا ظهر Data Loss Warning أثناء أمر `db push`، يتم التوقف فورًا وعدم المتابعة وإرسال الخطأ للمستخدم!

## سادسًا: القيود الثابتة
* لا Commit بدون موافقة صريحة.
* لا Merge مع Main / Master بدون موافقة صريحة.
* لا Production بدون موافقة صريحة.
* لا Vercel بدون موافقة صريحة.
* لا Supabase بدون موافقة صريحة.
* لا Cloudflare R2 بدون موافقة صريحة.
* لا DNS changes بدون موافقة صريحة.
* لا تعديل Tracking أو Lead Forms أو الصلاحيات إلا بتوجيه مباشر وواضح.

## سابعًا: تعليمات للمطور أو AI Agent القادم
* **اقرأ هذا الملف أولًا** قبل أي تعديل أو اتخاذ أي قرار.
* اقرأ `BATCH_15_WIP_STATUS.md` إذا كان Batch 15 لا يزال مفتوحًا ومكتوباً بأنه قيد التنفيذ.
* شغّل `npm run build` قبل إرسال أي تقرير نهائي للمستخدم للتأكد من خلو المشروع من مشاكل Types.
* لا تعتمد أي Batch أو تنتقل لآخر إلا بعد صدور قرار صريح باعتماد الاختبار من المستخدم.
* **كل Backup جديد (سواء WIP أو رسمي)** يجب أن يحدّث هذا الملف أولًا قبل إنشاء الـ Backup، ثم ينسخه داخله.

## How to continue from another device / طريقة الاستكمال من جهاز آخر

1. نقل مجلد الـ Backup كامل:
   naht-platform-wip-backup-after-batch-15-live-preview-before-restart
2. فك الضغط أو نسخه على الجهاز الجديد.
3. فتح المشروع في VS Code.
4. قراءة الملفات بالترتيب:
   - START_HERE_AFTER_RESTART.md
   - RESUME_FROM_HERE.md
   - PROJECT_HISTORY_AND_STATUS.md
   - BATCH_15_WIP_STATUS.md

5. تشغيل الأوامر التالية:
`ash
npm install
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
`

6. روابط الاختبار:
   - http://localhost:3000/
   - http://localhost:3000/crm/projects-map
   - http://localhost:3000/crm/cms/homepage
   - http://localhost:3000/crm/projects
   - http://localhost:3000/projects

7. ملاحظة مهمة:
   ملف .env غير موجود في الـ Backup لأنه حساس. إذا احتجناه لاحقًا يتم نسخه يدويًا وبشكل آمن من الجهاز الأصلي.

8. ملاحظة Git Recovery:
   إذا احتاج المطور استرجاع التعديلات على نسخة Git نظيفة، يستخدم الملفات التالية:
   - GIT_STATUS.txt
   - GIT_DIFF.patch
   - GIT_DIFF_STAGED.patch
   - UNTRACKED_FILES_LIST.txt

9. القيود:
   - لا Commit.
   - لا Merge.
   - لا Production.
   - لا Vercel.
   - لا Supabase.
   - لا R2.
   - لا DNS.
   إلا بعد موافقة Rayyan.

### UI Update (Featured Projects)
- **تم تعديل UI قسم المشاريع المختارة:** تقليل المسافات البيضاء العلوية والسفلية، تحسين ترتيب ومقاسات العناوين، وتحسين محاذاة زر عرض المجموعة كاملة.
- **سبب التعديل:** بناءً على ملاحظة User بأن القسم يحتوي مساحة بيضاء مبالغ فيها وأن توزيع العناصر غير احترافي.
- **الملفات التي تم تعديلها:** src/app/(public)/components/FeaturedProjects.tsx
- **ملاحظة:** التعديل UI (تصميم) فقط في الـ CSS/Classes ولا يغير البيانات أو Prisma أو الخريطة أو CRM بأي شكل من الأشكال.

### Next Phase: Management Staging Review
- **المرحلة القادمة:** Google Cloud Staging / UAT Preview for Management Review
- **الوصف:** دراسة وتجهيز بيئة عرض Staging شبه نهائية للإدارة باستخدام Google Cloud (أو البدائل) دون التأثير على التطوير المحلي أو بدء الإنتاج الفعلي.

### Next Phase: Vercel + Supabase Staging Review
- **المرحلة القادمة:** Vercel + Supabase Staging / UAT Preview for Management Review
- **الوصف:** إعداد مسار وخطّة تنفيذية لرفع نسخة تجريبية Staging للإدارة باستخدام Vercel للعرض و Supabase PostgreSQL لقاعدة البيانات، دون المساس بتطوير SQLite المحلي ودون عمل Production Deployment.

### Current Phase: Staging Preparation
- **الحالة الحالية:** Preparing isolated staging-preview branch for Vercel + Supabase Staging / UAT
- **الوصف:** يتم الآن إنشاء فرع معزول استعداداً لربطه بقاعدة بيانات PostgreSQL للرفع على Vercel، دون التأثير على بيئة التطوير الأصلية (SQLite).

### Vercel Preview Build Fix
- **المشكلة:** فشل بناء مسودة Vercel (PrismaClientInitializationError) بسبب عدم تواجد مجلد .prisma/client داخل الحاوية.
- **الحل:** تم إضافة prisma generate في سكريبت postinstall و uild داخل package.json ليتم توليد الـ Client أوتوماتيكياً في بيئة Vercel.

 # # #   V e r c e l   P r e v i e w   D a t a b a s e   S y n c  
 -   * * 'DE4CD): * *   A4D  (F'!  E3H/)  V e r c e l   'D+'FJ  D9/E  H,H/  'D,/'HD:   S u p a b a s e   S t a g i n g   D B   w a s   e m p t y   a n d   P r i s m a   t a b l e s   w e r e   n o t   p u s h e d   b e f o r e   N e x t . j s   p r e r e n d e r .  
 -   * * 'D-D: * *   *E  *9/JD  #H'E1  'D(F'!:   R u n   p r i s m a   d b   p u s h   b e f o r e   n e x t   b u i l d   i n   s t a g i n g - p r e v i e w   o n l y .  
 
 # # #   U A T   S e e d   P r e p a r a t i o n  
 -   * * 'DE4CD): * *   'DEHB9  'D*,1J(J  S t a g i n g   J8G1  A'1:'K  D#F  S u p a b a s e   S t a g i n g   D B   h a s   s c h e m a   b u t   n o   s e e d   d a t a .  
 -   * * 'D-D: * *   *E  %9/'/  EDA  s e e d . t s   C'ED  H4'ED:   P r e p a r i n g   c o m p l e t e   U A T   s e e d   d a t a   f o r   m a n a g e m e n t   p r e v i e w .  
 