# سجل استئناف العمل (NEXT STEPS) - مشاريع العمل

## آخر مرحلة مكتملة
- الانتهاء من التدقيق والفحص الكامل للنظام (Audit).
- تصميم وتوثيق الخطة الهندسية (Phase 3 Foundation).
- تعديل `schema.prisma` لدمج كيانات مشاريع العمل (WorkProject, Members, Logs, Attachments) وتحديث `Task`.
- إنشاء Migration محلية (`20260712130000_phase_3_work_projects`).
- تشغيل الفحوصات الأساسية (Prisma Generate, TypeScript, ESLint) بنجاح.

## ما لم يبدأ بعد (ممنوعات حالية)
- **لم يتم بناء:** `Server Actions` الخاصة بمشاريع العمل.
- **لم يتم بناء:** نظام الرفع الآمن (Signed URLs, Supabase Private Bucket).
- **لم يتم دمج:** واجهة المعاينة `/crm/tasks/design-preview` مع مسار `/crm/tasks` الفعلي.
- **لم يتم تطبيق:** الـ Migration محلياً أو على قواعد بيانات `Staging` أو `Production` (أُنشئت كملف فقط).

## أول مهمة للغد (ترتيب التنفيذ)
1. **الصلاحيات (Permissions Seed):** إضافة صلاحيات مشاريع العمل والمرفقات الجديدة إلى `prisma/seed.ts` بشكل Idempotent وتشغيلها محلياً.
2. **برمجة Server Actions الأساسية:**
   - إنشاء ملف `src/actions/workProjects.ts`.
   - كتابة دالة `createWorkProject` (بالـ Transaction مع المالك).
   - كتابة دالة `getWorkProjects` (مفهرسة حسب العضوية).
3. **تحديث إجراءات المهام الحالية (`actions/tasks.ts`):** 
   - تعديل دالة `createTask` لاحترام `workProjectId` و `designatedApproverId`.
   - تعديل `submitForApproval` لمنع التجاوز.
4. **توصيل الواجهة (Backend Integration):** البدء بربط `WorkProjectDetailsDrawer` بإجراءات الخادم (جلب البيانات الفعلية بدلاً من Mock Data).

## أوامر التحقق (Validation Commands)
تأكد دائماً من سلامة البيئة بتشغيل:
```bash
npx prisma format && npx prisma validate
npx prisma generate
npm run check:ts
```

## الملفات الأساسية المرجعية
- `docs/work-projects/architecture.md`: المعمارية والسياسات الثابتة.
- `prisma/schema.prisma`: المخطط الحالي.

## Definition of Done للمرحلة القادمة (Server Actions)
- جميع الإجراءات مكتوبة باستخدام `requirePermission` وتتحقق من الجلسة `getCurrentUser`.
- لا يُستخدم `userId` مقروء من العميل إطلاقاً كمصدر أمان.
- عملية إنشاء المشروع مرتبطة بإنشاء `OWNER` وسجل نشاط `ActivityLog` داخل `Transaction` واحدة.
- الفحوصات (TS/ESLint) تمر بلا أخطاء جديدة.
