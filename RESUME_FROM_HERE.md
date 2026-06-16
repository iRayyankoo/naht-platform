# نقطة الاستئناف (Resume Point)

* **أولًا:** اقرأ `PROJECT_HISTORY_AND_STATUS.md` أولًا لأخذ نظرة شاملة على المشروع.
* **ثانيًا:** اقرأ `BATCH_15_WIP_STATUS.md` ثانيًا لمعرفة تفاصيل Batch 15 الحالية.
* **آخر Batch رسمي معتمد:** Batch 14.
* **حالة Batch 15:** قيد الاختبار وغير معتمد.
* **الفرع الحالي:** `ui-refinements`.

### قيود هامة جداً:
* **لا تعمل Commit** أو **Merge** أو **Production** بدون موافقة صريحة من Rayyan.

### أوامر التشغيل:
في حالة فتح المشروع، قم بتشغيل الأوامر التالية بالترتيب:
```bash
cd "c:\Users\Rayyan Naht\Desktop\Naht-ERP\6-naht-platform"
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
```

### روابط الاختبار:
* الرئيسية: [http://localhost:3000/](http://localhost:3000/)
* الخريطة (CRM): [http://localhost:3000/crm/projects-map](http://localhost:3000/crm/projects-map)
* الرئيسية (CMS): [http://localhost:3000/crm/cms/homepage](http://localhost:3000/crm/cms/homepage)
* المنتجات (CRM): [http://localhost:3000/crm/projects](http://localhost:3000/crm/projects)
* مشاريعنا: [http://localhost:3000/projects](http://localhost:3000/projects)

### المطلوب عند الرجوع:
* اختبار Batch 15 يدويًا قبل الاعتماد النهائي.

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
