# Phase 6E-2D: Link Units to Project Models - Implementation Report

## Backup
تم إنشاء النسخة الاحتياطية بنجاح في المسار التالي:
`C:\Users\irayy\Desktop\Naht-ERP_1\Naht-ERP\backup_before_phase6e2d_link_units_to_project_models_2026-07-02.zip`

## التعديلات التي تمت
### 1. `src/actions/units.ts`
- إضافة Server Action جديدة باسم `updateUnitModelDetails` لاستقبال `formData` وتحديث حقول الوحدة (`modelId`, `floor`, `facade`, `unitPlanImage`, `sortOrder`). تتأكد من صلاحيات المستخدم (ADMIN أو MARKETING) وتتأكد أن الوحدة والنموذج ينتميان لنفس المشروع.
- تعديل دالة `createUnit` بشكل آمن ومطابق للمطلوب لتستقبل حقل `modelId` اختيارياً وتضيفه للوحدة عند الإنشاء دون كسر الحقول القديمة. 

### 2. `src/app/crm/projects/[id]/units/page.tsx`
- تحديث جلب بيانات المشروع (query) ليتضمن `models` بالترتيب الصحيح لتمكين عرض النماذج في خيارات التصنيف.
- إضافة `select` بسيط للنموذج (`modelId`) ضمن فورم "إضافة وحدة جديدة".
- إضافة مكوّن `UnitClassificationForm` كـ Client Component لكل وحدة داخل الجدول (كمرفق تحتي لكل صف) يسمح باختيار (النموذج، الدور، الواجهة، المخطط الخاص بالوحدة، ترتيب الفرز) مع زر إرسال يستدعي `updateUnitModelDetails`.

### 3. `src/app/crm/projects/[id]/units/UnitClassificationForm.tsx` (ملف جديد)
- تم إنشاء هذا المكوّن كـ Client Component للتعامل مع تحديث بيانات تصنيف الوحدة بدون تعقيد صفحة الـ Server المخصصة للجدول. 

### 4. `src/app/crm/projects/[id]/models/page.tsx`
- تحديث الرسالة التوجيهية في قسم الوحدات غير المصنفة لتصبح:
  "يمكن ربط الوحدات بالنماذج من صفحة إدارة الوحدات"
  بناءً على طلب العميل.

## حالة البناء (Build)
تم تشغيل `npm run build` بنجاح بعد استكمال كافة التعديلات ولا توجد أي أخطاء. المشروع جاهز لمرحلة Visual Validation ثم الاعتماد والقفل (Lock & Commit).
