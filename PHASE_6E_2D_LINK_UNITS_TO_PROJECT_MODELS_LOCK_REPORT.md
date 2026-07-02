# Phase 6E-2D Lock Report: Link Units to Project Models

تم اعتماد وإقفال مرحلة 6E-2D بنجاح، وتتضمن:
- تم إضافة `updateUnitModelDetails` في `src/actions/units.ts`.
- الصلاحيات المسموحة: `ADMIN` و `MARKETING`.
- `modelId` اختياري.
- يمكن ربط الوحدة بنموذج.
- يمكن إرجاع الوحدة إلى غير مصنفة.
- يتم التحقق أن `unitId` تابع لنفس `projectId`.
- يتم التحقق أن `modelId` تابع لنفس `projectId`.
- تم تحديث `createUnit` ليستقبل `modelId` اختيارياً بدون كسر العمل القديم.
- تم تحديث صفحة `/crm/projects/[id]/units`.
- تم إنشاء `UnitClassificationForm.tsx`.
- تم تحديث صفحة `/crm/projects/[id]/models` لتعرض الوحدات تحت النموذج الصحيح.
- الوحدات تختفي من قسم الوحدات غير المصنفة بعد الربط.
- عدد الوحدات في النموذج يتحدث تلقائياً.
- `unitPlanImage` تم اختباره ويعمل بنجاح.
- تم استخدام `defaultValue` آمن مع `null` لجميع الخصائص.
- تم تحسين كروت الوحدات في صفحة `/projects/[slug]` (واجهة العملاء العامة).
- الأيقونات ظهرت بشكل سليم.
- القيم الصفرية والفارغة تم إخفاؤها (Conditional Rendering).
- تصميم الجوال Mobile سليم ومتجاوب (Grid-cols-1).
- لم يتم لمس `schema.prisma`.
- لم يتم عمل `db push`.
- لم يتم إضافة API Routes جديدة.
- لم يتم حذف أي وحدات فعلية.
- البناء `build` نجح سابقاً بدون أخطاء.
- النسخة الاحتياطية (Backup) موجودة بالمسار:
  `C:\Users\irayy\Desktop\Naht-ERP_1\Naht-ERP\backup_before_phase6e2d_link_units_to_project_models_2026-07-02.zip`
- صور `public/uploads` التجريبية بقيت Untracked ولن يتم إضافتها إلى Git.
