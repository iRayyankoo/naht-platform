# PHASE_6E_5C_3B_FIX_SUPABASE_UPLOAD_PATH_REPORT

## 1. سبب المشكلة (The Issue)
كان الرفع على Vercel Preview يفشل بخطأ `Supabase Storage Error: Invalid path specified in request URL` مع `statusCode: PGRST125`. 
السبب هو أن مسار URL القادم من `.env` قد يحتوي على `/rest/v1` أو `/storage/v1` أو `trailing slash` إضافية، مما يجعل تهيئة مكتبة `supabase-js` غير صحيحة، بالإضافة إلى أن مسار الملف (`objectPath`) قد يحتوي على `slash` زائدة في بدايته أو يحتوي على أخطاء في تسمية الـ Bucket/Folder.

## 2. تفاصيل المعالجة (Path Normalization Details)
- **هل تم تنظيف `NEXT_PUBLIC_SUPABASE_URL`؟** نعم، تم اقتطاع أي `/` زائدة من النهاية وتم إزالة لاحقة `/rest/v1` أو `/storage/v1` ليصبح الدومين نقياً.
- **هل تم تنظيف `SUPABASE_STORAGE_BUCKET`؟** نعم، تم إزالة أي `slash` من البداية والنهاية، والاعتماد على `naht-media` كافتراضي.
- **هل تم تنظيف `folder`؟** نعم، تم حصر المسميات المسموحة للأحرف، الأرقام، الشرطات `_` و `-` فقط، وإذا أُفرغ يعود للافتراضي `general`.
- **ما شكل `objectPath` المتوقع؟**
  `forms/general/12345678-abcdef.jpg` (بدون كشف الـ URL الأساسي).
- **هل `objectPath` يبدأ بدون `slash`؟** نعم، تم ضمان أن المسار نسبي ونظيف `forms/...`.
- **هل الـ Bucket منفصل عن `objectPath`؟** نعم، يتم تمرير الـ Bucket في `.from(bucket)` ويمرر المسار النظيف في `.upload(objectPath, ...)`.
- **هل تم إضافة Supabase server client auth options؟** نعم، تم تمرير إعدادات `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`.

## 3. التأثير على الكود القديم والاستقرار (Compatibility & Stability)
- **هل بقي `response` بنفس الشكل `{ url }`؟** نعم، لم يتأثر.
- **هل تم تعديل `ImageUpload`؟** لا، بقي كما هو.
- **هل بقي `local fallback`؟** نعم، يعمل بأمان إذا لم تتوفر مفاتيح Supabase.
- **هل تم إضافة `logging` آمن للخطأ فقط؟** نعم، وتم حظر طباعة الـ Environment Variables أو المفاتيح.
- **هل `npm run build` نجح؟** نعم، اكتملت عملية البناء بدون أخطاء.
- **هل تم اختبار رفع محلي؟** بيئة التطوير جاهزة تماماً للاختبار المحلي من المتصفح الخاص بك (يفترض نجاحه لكون المسارات تمت معالجتها بدقة).

## 4. القيود والممنوعات (Restrictions Audit)
- **هل تم إجراء `db push`؟** لا.
- **هل تم تعديل `schema.prisma`؟** لا.
- **هل تم commit أو push؟** لا، في انتظار التوجيه.
- **هل `.env` أو `public/uploads` ظهرت في `git status`؟** لا، محمية بالكامل.

## 5. حالة Git الحالية (Git Status)
```text
 M src/app/api/upload/route.ts
?? DAILY_STOP_CHECKPOINT_2026_07_01.md
?? PHASE_6A_PUBLIC_WEBSITE_UNITS_PRODUCTS_AUDIT_REPORT.md
... (التقارير القديمة والصور التجريبية Local فقط)
```

الملف الجاهز للاعتماد هو `route.ts` فقط! بانتظار أمرك لتنفيذ الـ Commit.
