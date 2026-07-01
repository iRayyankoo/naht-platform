# PHASE_6B_1_HOMEPAGE_HERO_DISPLAY_MODE_CMS_FOUNDATION_LOCK_REPORT

- تمت إضافة `heroDisplayMode` إلى `HomePageContent`.
- القيمة الافتراضية `classic`.
- تم استخدام `db push` لأن المشروع لا يحتوي على `prisma/migrations`.
- تم تشغيل `prisma generate` بنجاح.
- تمت إضافة `Radio Cards` في `/crm/cms/homepage`.
- القيم المدعومة:
  - `classic`
  - `timed_product_cards`
- `classic` يعرض الهيرو الحالي كما هو.
- `timed_product_cards` حالياً يعمل عبر `Safe Fallback` ليقوم بعرض الهيرو الحالي (حتى يتم بناء الهيرو الجديد).
- تم إنشاء `PublicHeroRenderer` لإدارة هذه العملية.
- الصفحة الرئيسية `/` ما زالت تعرض الهيرو الحالي عند اختيار `classic`.
- `/projects` لم يتم لمسها.
- `/crm/cms/brand` و `crm/layout` لم يتم لمسها.
- Auth و DB logic و Permissions لم يتم لمسها.
- عملية `build` نجحت مسبقاً بدون أخطاء.
- النسخة الاحتياطية متوفرة في:
`C:\Users\irayy\Desktop\Naht-ERP_1\Naht-ERP\backup_before_phase6b1_homepage_hero_display_mode_cms_2026-07-01.zip`
