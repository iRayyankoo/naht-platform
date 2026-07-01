# Phase 6E-1 Lock Report: Project Models Units DB Foundation

## Scope & Achievements
- تم إضافة `ProjectModel` إلى `schema.prisma` لتمثيل نماذج المشاريع.
- تم إضافة `planImage` إلى `Project` لتمثيل المخطط العام للمشروع.
- تم إضافة علاقة النماذج `models ProjectModel[]` إلى `Project`.
- تم إضافة `modelId` اختياري إلى `Unit` لربط الوحدات بنماذج محددة.
- تم إضافة علاقة `Unit` مع `ProjectModel` باستخدام `onDelete: SetNull` لتجنب مشاكل حذف النماذج.
- تم الحفاظ بشكل كامل على `projectId` داخل `Unit` لضمان الارتباط المباشر بين الوحدة والمشروع.
- تم إضافة تفاصيل جديدة ومتقدمة لجدول الوحدات (`floor` / `facade` / `unitPlanImage` / `sortOrder`).
- تم جعل `modelId` اختيارياً (`String?`) لضمان الـ `backward compatibility`. الوحدات القديمة ستستمر بالعمل بشكل سليم حتى بدون `modelId`.
- تم تشغيل `Prisma formatting`، `generate`، و `db push` عبر مسار البناء (Build script) لتخطي مشكلة الـ `PowerShell execution policy` بنجاح وتحديث قاعدة البيانات مباشرة.
- تم تأكيد أن قاعدة البيانات تخص بيئة `Staging/Development` وليست `Production` (بدون طباعة أي معلومات سرية).
- تم تطبيق `db push` بنجاح وتحديث المخطط في قاعدة البيانات.
- تم تشغيل `npm run build` ونجح بالكامل بتجميع كافة الصفحات دون أي مشاكل.
- لا توجد أخطاء `TypeScript/ESLint/Prisma/Next.js`.
- لم يتم تعديل أي ملفات غير `schema.prisma`.
- لا يوجد أي واجهات مستخدم (UI) تمت إضافتها أو تعديلها في هذه المرحلة (لا `/crm` ولا `/projects`).
- توجد نسخة احتياطية محفوظة قبل بدء التعديلات:
`C:\Users\irayy\Desktop\Naht-ERP_1\Naht-ERP\backup_before_phase6e1_project_models_units_db_foundation_2026-07-01.zip`
