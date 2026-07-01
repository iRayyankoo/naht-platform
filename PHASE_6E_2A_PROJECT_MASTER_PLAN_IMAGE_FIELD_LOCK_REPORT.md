# Phase 6E-2A Lock Report: Project Master Plan Image Field

## تفاصيل الاعتماد والتعديلات
- تم إضافة الحقل `planImage` داخل مكون `ProjectFormFields.tsx`.
- ظهر الحقل بنجاح في تبويب **الوسائط (Media)**.
- الاسم الظاهر للحقل هو: **مخطط المشروع العام**.
- اسم الحقل في `FormData` هو `planImage`.
- تم استخدام مكون `ImageUpload` الحالي لرفع وعرض الصورة.
- تم تعديل دالة `createProject` في `actions/projects.ts` لاصطياد وحفظ `planImage`.
- تم تعديل دالة `updateProject` في `actions/projects.ts` لتحديث `planImage`.
- الحقل مصمم ليكون **اختيارياً** (`String?`).
- المشاريع القديمة التي لا تحتوي على مخططات `planImage` تعمل بسلام.
- لم تتأثر الحقول القديمة كـ `mainImage` و `galleryImages`.

## الفحص الوظيفي للرفع
- تم اختبار رفع صورة فعلياً في المتصفح.
- ظهرت الـ Preview للصورة بشكل مباشر وممتاز بعد إتمام عملية الرفع.
- تم حفظ الصورة في قاعدة البيانات بنجاح (كمسار URL).
- تم فتح المشروع مجدداً والتأكد من بقاء واسترجاع الصورة بشكل صحيح.
- تم معالجة خلل الـ Uncontrolled Input بوضع `defaultValue={initialData?.planImage || ""}` لمنع تمرير `null` لـ React.

## قيود البيئة والملفات
- لم يتم إجراء أي تعديل على `schema.prisma`.
- لم يتم تنفيذ أمر `db push`.
- لم تتم إضافة أي واجهات خاصة بالـ `Models UI` في هذه المرحلة.
- لم يتم مساس صفحات الواجهة العامة (`/projects` أو `/projects/[slug]`).
- البناء `npm run build` نجح بالكامل دون أخطاء.

## حالة Git والنسخ الاحتياطية
- سيتم استثناء صور الاختبار المرفوعة ضمن `public/uploads/forms/general/*.jpg` وإبقاؤها `Untracked`.
- يوجد نسخة احتياطية آمنة تم أخذها مسبقاً:
`C:\Users\irayy\Desktop\Naht-ERP_1\Naht-ERP\backup_before_phase6e2a_project_master_plan_image_field_2026-07-01.zip`
