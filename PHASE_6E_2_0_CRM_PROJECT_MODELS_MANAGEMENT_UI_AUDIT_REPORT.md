# Phase 6E-2-0 CRM Audit Report: Project Models Management UI

## 1. ما صفحات CRM المسؤولة عن المشاريع والوحدات؟
- قائمة المشاريع: `src/app/crm/projects/page.tsx`
- صفحة إنشاء وتعديل المشروع: `src/app/crm/projects/[id]/edit/page.tsx`
- مكون فورم المشاريع المشترك: `src/app/crm/projects/ProjectFormFields.tsx`
- صفحة إدارة الوحدات: `src/app/crm/projects/[id]/units/page.tsx`

## 2. أين يتم حفظ Project و Unit حالياً؟
- يتم استخدام **Server Actions** حصرياً ولا يوجد `API Routes` مخصصة للإنشاء والتعديل المباشر (توجد `API` للقراءة فقط في واجهة الموقع).
- دوال المشاريع محفوظة في `src/actions/projects.ts` (دوال `createProject` و `updateProject`).
- دوال الوحدات محفوظة في `src/actions/units.ts` (دوال `createUnit` و `updateUnitStatus`).

## 3. هل يوجد `ImageUpload` يمكن إعادة استخدامه؟
- **نعم**. المكون `src/components/crm/ImageUpload.tsx` متوفر ومستخدم مسبقاً داخل النظام. يمكننا استدعاؤه بسهولة لرفع `planImage` للمشروع وللنماذج.

## 4. أين الأفضل إضافة `planImage` (المخطط العام للمشروع)؟
- المكان الأفضل والأسهل: داخل تبويب **"الوسائط" (Media Tab)** في مكون `ProjectFormFields.tsx` بجانب معرض الصور (`galleryImages`) وصورة الغلاف (`mainImage`).
- يجب أيضاً استلامه في الـ Server Action داخل `src/actions/projects.ts`.

## 5. أين الأفضل إضافة صفحة إدارة النماذج (Models)؟
- الخيار المقترح في الـ Audit هو الأفضل. يجب إنشاء مسار جديد مخصص:
`/src/app/crm/projects/[id]/models/page.tsx`
- هذا يضمن عدم تكدس البيانات في صفحة تفاصيل المشروع، ويتيح صفحة مركزية منفصلة لإدارة النماذج والوحدات التابعة لها، أسوة بصفحة `units/page.tsx`.

## 6. ما الصلاحيات المناسبة لصفحة النماذج؟
- بناءً على ما هو معمول به في `projects.ts` و `units.ts`:
  - **قراءة، إنشاء، وتعديل النماذج**: تقتصر على الأدوار `["ADMIN", "MARKETING"]` باستخدام دالة الـ Helper `actionRequireRole` أو فحص الـ Session.
  - **حذف النماذج (Delete)**: يُفضل أن تكون حصرياً لـ `["ADMIN"]` لمنع الحذف العرضي من قِبل التسويق.

## 7. هل نحتاج API Routes أو Server Actions جديدة؟
- نحتاج فقط لإنشاء ملف **Server Actions** جديد: `src/actions/models.ts` يحتوي على دوال (إنشاء، تعديل، حذف نموذج). لن نحتاج `API Routes`.

## 8. هل يمكن تنفيذ `Phase 6E-2A` بدون تعديل DB؟
- **نعم بكل تأكيد**. قاعدة البيانات مهيأة مسبقاً (تم إدراج `planImage` و `ProjectModel` في `Phase 6E-1`)، لذلك التحديث في `Phase 6E-2A` سيكون مقتصراً على الواجهة والـ Actions فقط.

## 9. هل يمكن الحفاظ على الوحدات القديمة بدون `modelId`؟
- **نعم**. الوحدات القديمة ستظل تعمل ومرتبطة بـ `projectId` بشكل مباشر لأن `modelId` اختياري (`nullable`). في واجهة إدارة النماذج، يمكننا استعلام الوحدات التي `modelId: null` وعرضها كـ "وحدات غير مصنفة" لتمكين مدير النظام من ربطها بنماذج إن أراد ذلك، أو تركها.

## 10. خطة التنفيذ المقترحة المتدرجة:
- **Phase 6E-2A**: إضافة الحقل `planImage` في `ProjectFormFields.tsx` وتعديل الأكشن `updateProject`. 
- **Phase 6E-2B**: إنشاء الصفحة الفارغة للقراءة `/crm/projects/[id]/models` لترسيخ التوجيه (Routing).
- **Phase 6E-2C**: إضافة فورم إنشاء وإدارة النماذج (Server Actions + UI).
- **Phase 6E-2D**: تمكين ربط الوحدات الموجودة، وإضافة الحقول الجديدة للوحدات في `units/page.tsx`.

## 11. تأكيدات النظام:
- **هل تم تعديل أي كود؟** لا.
- **هل تم عمل commit/push/backup؟** لا.
- **حالة Git الحالية:** نظيفة (`?? PHASE_6A` فقط).
