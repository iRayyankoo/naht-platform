# تقرير تدقيق وإغلاق الإصدار المرشح 1.1 (Release Candidate 1.1 - RC1.1 Verification Report)

**التاريخ:** 11 أغسطس 2026  
**فرع الإصدار الموحد:** `release/2026-08-naht-platform-demo-rc1`  
**رمز الـ Merge Commit الأولي:** `49ac14f828a2a0ff998ae90d8a57e33ed3c17887`  
**رمز commit تصحيح واجهات الجوال:** `16936a2d989f664ad06e107530be908fcfaad63f`  
**رمز commit توثيق RC1.1 (HEAD الحالي):** `d80a14995c8629007f594fc199c277ef945d8b7b`  
**الوسم الأولي المعتمد:** `naht-platform-demo-rc1-2026-08-11`  
**الوسم الثاني المعاين:** `naht-platform-demo-rc1-evidence-verified-2026-08-11`  
**الوسم النهائي المعتمد لـ RC1.1:** `naht-platform-demo-rc1.1-verified-2026-08-11`  
**مسار حزمة الـ Bundle النهائي:** `C:\tmp\naht-platform-demo-rc1-2026-08-11.bundle`  
**بصمة SHA-256 للـ Bundle:** `1e4bd002f23cfdbef02bb63a3c9e693952a1d27932bc39031c626e2553b6a27e`

---

## 1. بيان تحسينات واجهات الجوال (Mobile UI Refinements)

1. **إلغاء التداخل والتأطير الجوال (Mobile Header Flow):**  
   في صفحتي الموارد البشرية (`/crm/hr`) والتسويق (`/crm/marketing`) تم تحويل شارة «بيانات تجريبية» من الوضع المطلق المتداخل (`absolute top-3 left-3`) إلى نمط التدفق المرن التفاعلي (`flex flex-col md:flex-row md:items-start justify-between gap-4`) لمنع أي تداخل مع العناوين في شاشات الجوال 390px مع الحفاظ التام على تصميم الشاشات الكبيرة Desktop.
2. **تبسيط عناوين الأقسام التجريبية:**  
   تم تحسين عنوان قسم التسويق إلى صياغة عربية قصيرة موحدة: `أقسام العرض التجريبي` مع الإبقاء على شارات الـ Demo التفصيلية بشكل منفصل.

---

## 2. إثبات فحص الصلاحيات والمالية (Authorized Finance RBAC Verification)

> [!IMPORTANT]
> **إثبات الفصل بين الأدوار والـ RBAC:**
> 1. **مسار الرفض المتوقع (`13_finance_admin_denied_expected.png`):** محاولة دخول المستخدم بـ `admin@naht-re.sa` (ADMIN عادي دون صلاحيات مالية) تؤدي إلى شاشة الرفض الموحدة وعدم إظهار الروابط المالية (إثبات تطبيق مبدأ Fail-Closed وعدم التنازل عن SoD).
> 2. **مسار التجربة المخولة (`10`, `11`, `12`):** محاولة دخول حساب مخول صريح يحمل صلاحيات `SUPER_ADMIN` / `FINANCE_ACCOUNTANT` (`finance.admin@naht-re.sa`) تعرض القائمة المالية المفعلة بالكامل، نموذج إنشاء القيد المتوازن، وتقارير المالية الممتلئة بالبيانات.

---

## 3. نتائج بوابات الجودة والتفتيش الخطي (Quality Gates)

1. **فحص الأنواع والسطور (`npx tsc --noEmit` & `git diff --check`):** `✔ Exit Code 0`
2. **فحص الأنماط للملفين المعدلين (`npx eslint`):** `✔ 0 errors, 0 warnings`
3. **بناء الإنتاج (`npx next build`):** `✔ Generated static and dynamic pages (77/77) successfully.`
4. **فحص بيئة التشغيل الإنتاجية (`next start`):** zero أخطاء أو تحذيرات جديدة في الـ Console والـ Terminal.

---

## 4. أدلة ومسارات الفحص البصري النهائي (Final Visual Evidence Paths)

**المجلد:** `C:\tmp\naht-platform-rc1-final-evidence\`

- `04_hr_mobile_390x844.png` (تحسين شارة الجوال لـ HR) — SHA-256: `81cdc46ee80ef591abb5cb9c6a5452af4f1b735ac54f65bc0deb73c5f497a38d`
- `06_marketing_mobile_390x844.png` (تحسين عنوان وشارة الجوال للتسويق) — SHA-256: `7fc91112ca7ce1c2d1f508bf78282ebc940f9827de249239f5c776896791ba2a`
- `10_finance_sidebar_authorized.png` (القائمة المالية للمستخدم المخول) — SHA-256: `8a085a77d24233192ffbca71234ab78717b95d697e85ffa33eb369d13b7045d9`
- `11_finance_journal_create_authorized.png` (شاشة إنشاء القيد للمستخدم المخول) — SHA-256: `4d83bc0b57069bbe7cf5d3ef9bfa4f9531486979ab4da0c546a3096d1199e058`
- `12_finance_report_populated_authorized.png` (تقرير دفتر اليومية ممتلئ بالبيانات للمستخدم المخول) — SHA-256: `162521ad89b6fa9cceeb4b23f84a6ef3fc84b632bc919e1901ed637e4573ab07`
- `13_finance_admin_denied_expected.png` (شاشة الرفض المتوقعة لـ ADMIN غير مخول) — SHA-256: `27bf4e68c50b184a646a35590dbd6e6027196293a1b5fedd90596356257bc9a7`
