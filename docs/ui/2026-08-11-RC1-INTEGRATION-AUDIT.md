# تقرير تدقيق وإغلاق الإصدار المرشح الأول (Release Candidate 1 - RC1 Evidence Verification)

**التاريخ:** 11 أغسطس 2026  
**فرع الإصدار الموحد:** `release/2026-08-naht-platform-demo-rc1`  
**رمز الـ Merge Commit:** `49ac14f828a2a0ff998ae90d8a57e33ed3c17887`  
**رمز commit توثيق الأدلة:** `c614ff73a88295a94828ce27150a0058bcf7eb95`  
**الوسم الأولي المعتمد (Initial Tag):** `naht-platform-demo-rc1-2026-08-11`  
**الوسم الإضافي للأدلة (Evidence Tag):** `naht-platform-demo-rc1-evidence-verified-2026-08-11`  
**مسار حزمة الـ Bundle:** `C:\tmp\naht-platform-demo-rc1-2026-08-11.bundle`  
**بصمة SHA-256 للـ Bundle:** `fe736ccc8977a8532757f6f3e11a3871fd06a4100358b90c39c3f7f20906c8a5`

---

## 1. بيان طبيعة التنفيذ (Scope & Limitations Disclaimer)

> [!IMPORTANT]
> **إقرار طبيعة التنفيذ:**
> 1. كافة الواجهات المستحدثة ضمن مسارات الموارد البشرية (`/crm/hr/*`) والتسويق (`/crm/marketing/*`) هي **واجهات عرض تجريبية قراءة فقط (Read-Only Demo UI)** وتعتمد على `Mock Data` محلي.
> 2. تعتمد وحدات المالية (`/crm/finance/*`) والموقع العام (`/projects`, `/units`) والـ CRM على قواعد البيانات والخدمات السحابية الإنتاجية المربوطة بالجداول المعتمدة.
> 3. **لا توجد Migrations جديدة مكسورة:** اجتياز كافة التغييرات على قاعدة بيانات PostgreSQL محلياً ومعزولاً.

---

## 2. تحليل شارة التطوير (Next.js Dev Overlay - 1 Issue Analysis)

- **السبب الجذري لشارة (1 Issue):**  
  تظهر هذه الشارة في بيئة التطوير المحلية (`next dev`) فقط عبر طبقة Turbopack Dev Overlay بسبب تنبيه الخيار الافتراضي لـ `metadataBase` عند التشغيل على `http://localhost:3000`:
  `⚠ metadataBase property in metadata export is not set for resolving social open graph images, using http://localhost:3000`
- **التأكيد في بيئة الإنتاج (`next build` / `next start`):**  
  عند بناء وتوضيب النسخة للإنتاج عبر `npx next build` يتم تجميع الـ 77 مساراً بنجاح خالية من هذه الشارة تماماً، حيث لا يتم إدراج طبقة الـ Dev Overlay في بيئة الإنتاج الحقيقية.

---

## 3. توثيق دين ESLint المعروف (ESLint Baseline & Clean Code)

- **الدين الفني القديم (Legacy Baseline):** `✖ 116 problems (87 errors, 29 warnings)`  
  *(الأخطاء والتحذيرات القديمة محصورة في ملفات الـ CMS القديمة غير المتأثرة بالدمج مثل `src/app/crm/cms/*`)*
- **الأمر الخام المستخرج منه:** `npx eslint "src/**/*.{ts,tsx}"`
- **الأمر الخام الخاص بالأخطاء فقط:** `npx eslint "src/**/*.{ts,tsx}" --quiet` (`87 errors, 0 warnings`)
- **الملفات الجديدة المدمجة لـ RC1 و `CrmSidebar.tsx`:**  
  `✔ 0 errors, 0 warnings` (نظيفة بنسبة 100%).
- **نسبة الانحراف (Regression):** `0 new errors` (عدم حدوث أي انحراف أو إضافة أخطاء جديدة).

---

## 4. أدلة ومسارات الفحص البصري (Visual QA Evidence Paths)

- **القائمة الجانبية الموحدة (Desktop):**  
  `C:\Users\irayy\.gemini\antigravity-ide\brain\f6c3f56c-d43e-44e6-8349-4287d0d6ee8d\crm_home_desktop_1786444402551.png`
- **دليل الموظفين التجريبي (HR Demo):**  
  `C:\Users\irayy\.gemini\antigravity-ide\brain\f6c3f56c-d43e-44e6-8349-4287d0d6ee8d\employee_directory_filtered_1786444441141.png`
- **لوحة الموارد البشرية (HR Dashboard):**  
  `C:\Users\irayy\.gemini\antigravity-ide\brain\f6c3f56c-d43e-44e6-8349-4287d0d6ee8d\hr_dash_desktop_1786442999874.png`
- **مركز التسويق التجريبي (Marketing Dashboard):**  
  `C:\Users\irayy\.gemini\antigravity-ide\brain\f6c3f56c-d43e-44e6-8349-4287d0d6ee8d\mkt_dash_desktop_1786442923483.png`
- **نموذج إنشاء القيد والتقارير المالية:**  
  مسارات الـ Server الأكيدة: `/crm/finance/journals/new`, `/crm/finance/reports`, `/crm/finance/reports/journals`, `/crm/finance/reports/general-ledger`, `/crm/finance/reports/trial-balance`.
