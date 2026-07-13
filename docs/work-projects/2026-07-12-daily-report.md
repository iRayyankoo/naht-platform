# التقرير اليومي: 2026-07-12 (تأسيس مشاريع العمل)

## ملخص اليوم
- **الهدف الأساسي:** بناء نظام المهام لشركة واحدة وفصل مهام التنفيذ عن قرارات الاعتماد.
- **الإنجازات:**
  - إضافة دورة الاعتماد المتعددة مع سجل النشاط للمهام.
  - بناء واجهة المعاينة (Design Preview) لتصميم Kanban و List Views مع دعم المهام المستقلة والمشاريع.
  - إنشاء `TaskDetailsDrawer` للتعامل السريع مع المهام والتعليقات وسجل النشاط.
  - إضافة هيكلة "مشاريع العمل" (WorkProjects) لتعمل بشكل منفصل بالكامل عن المشاريع العقارية، كي تكون حاوية تنظيمية للمهام الإدارية والتشغيلية.
  - وضع خطة مرفقات آمنة تعتمد على Signed URLs و Bucket خاص.
  - الانتهاء من تحديث Schema وإنشاء Migration الخاصة بالمرحلة الثالثة.

## القرارات المعمارية
- **المشاريع العقارية (`Project`):** تبقى كما هي دون تغيير ولها مساراتها وتقاريرها المستقلة.
- **مشاريع العمل (`WorkProject`):** كيان جديد وظيفته تجميع المهام والفرق العاملة، مع دورة حياة مستقلة.
- **المهام (`Task`):** يمكن أن تكون "مهمة عامة" (`workProjectId = null`) أو تابعة لمشروع عمل.
- **الأدوار والمسؤوليات:**
  - **مالك المشروع (Owner):** المتحكم الأساسي، يمكنه نقل الملكية وإضافة الأعضاء والأرشفة.
  - **منفذ المهمة (Assignee):** الشخص المكلف بتنفيذ العمل الفعلي في المهمة.
  - **المعتمد المحدد (Designated Approver):** الشخص المخول حصرياً (أو SUPER_ADMIN) باعتماد المهمة عند تحولها لـ `PENDING`.
  - **متخذ القرار (`TaskApproval.approverId`):** السجل التاريخي الفعلي لمن ضغط زر "اعتماد" في تلك الدورة بالذات.
- **المرفقات:**
  - يوجد فصل بين مرفقات المشاريع ومرفقات المهام.
  - تقرر استخدام "Private Storage" و "Signed URLs" بدلًا من الروابط العامة.
  - لا توجد Database Transaction مشتركة بين Prisma و Storage، لذا سيتم استخدام `AttachmentStatus` (PENDING, READY, DELETING, FAILED) لمعالجة التزامن وحالات الفشل.

## الملفات المعدلة والمضافة اليوم
- `prisma/schema.prisma`: تمت إضافة Enums وجداول `WorkProject`, `WorkProjectMember`, `WorkProjectActivityLog`, ونماذج المرفقات. إضافة حقول جديدة لـ `Task`.
- `prisma/migrations/20260712130000_phase_3_work_projects/migration.sql`: ملف الـ SQL الناتج لإنشاء الجداول الجديدة دون مساس القديمة.
- `implementation_plan.md`: تم حذفه ونقل محتواه المستقر إلى وثائق المجلد `docs/work-projects/`.
- **واجهة المعاينة:** (تمت داخل `/crm/tasks/design-preview`)
  - `page.tsx`: صفحة المعاينة الأساسية.
  - `components/KanbanBoard.tsx`: لوحة عرض المهام بنظام كانبان.
  - `components/ListView.tsx`: عرض المهام بأسلوب القائمة.
  - `components/TaskDetailsDrawer.tsx`: درج عرض تفاصيل المهمة (مستقل عن Kanban/List).
  - `components/WorkProjectDetailsDrawer.tsx`: درج عرض تفاصيل مشروع العمل.
  - `components/CreateTaskModal.tsx`: نموذج إنشاء المهام مع مراعاة العضوية والمشروع.
  - `components/data.ts`: Mock Data للتجربة.

## قاعدة البيانات
- **النماذج الجديدة:** `WorkProject`, `WorkProjectMember`, `WorkProjectActivityLog`, `WorkProjectAttachment`, `TaskAttachment`.
- **Enums الجديدة:** `WorkProjectStatus`, `WorkProjectMemberRole`, `AttachmentStatus`.
- **الحقول الجديدة في Task:** `workProjectId`, `designatedApproverId`.
- **العلاقات العكسية:** تمت إضافتها بشكل سليم إلى نموذج `User`.
- **Migration:**
  - **الاسم:** `20260712130000_phase_3_work_projects`
  - **الحالة:** تم إنشاؤها محلياً فقط. **لم تُطبق** على Staging أو Production. ولا توجد أوامر `DROP` بداخلها.

## واجهة المعاينة (Design Preview)
- **الرابط:** `/crm/tasks/design-preview`
- **المميزات المضافة:**
  - Tabs للتنقل بين أساليب العرض.
  - فلاتر سريعة (مفتوحة، متأخرة، بانتظار الاعتماد).
  - دعم الأدوار التجريبية (مدير vs موظف).
  - ألوان وأيقونات تعكس حالة التأخير (تاريخ الاستحقاق).
  - Drawer يمكن فتحه عبر البطاقة أو الصف مع إمكانية الوصول بلوحة المفاتيح (Accessibility).
  - تعريب كامل للنصوص، مع إصلاح `CreateTaskModal` ليربط المهمة بالمشروع النشط ويعرض الأعضاء بناءً عليه.

## الأمان
- فصل كامل عن المشاريع العقارية لمنع اختلاط الصلاحيات.
- المفتاح `service_role` لـ Supabase لن يكشف للعميل.
- كُشف خلل في الـ `/api/upload` القديم (يقبل الرفع دون جلسة ويتجاوز RLS)، ولهذا تقرر تصميم نقاط رفع آمنة جديدة (`/api/storage/upload-url`، `/api/storage/confirm`، `/api/storage/download`) خاصة بالمشاريع والمهام.
- الالتزام بنظام الصلاحيات (RBAC) وعدم تمرير `actorId` من العميل إطلاقاً.

## الفحوصات المنفذة
- `prisma format`: **نجاح**. (تم تنسيق الملف).
- `prisma validate`: **نجاح**. (الـ Schema سليم).
- `prisma generate`: **نجاح**. (تم توليد العميل).
- `tsc --noEmit`: **نجاح**. (لا يوجد أي خطأ جديد متعلق بتغييرات اليوم، الأخطاء القديمة تمثل تحذيرات `any`).
- `eslint .`: **تم الفحص**. الأخطاء والتحذيرات القديمة تُركت كما هي (332 مشكلة: 249 خطأ، 83 تحذيراً) لعدم توسيع نطاق العمل، التغييرات الجديدة خالية من المشاكل الجوهرية.

## الأعمال المؤجلة (لم تُنفذ اليوم)
- إضافة الصلاحيات إلى بذور النظام (Seed).
- بناء الـ Server Actions الجديدة (إنشاء وتعديل وإدارة مشاريع العمل، رفع وتحديث مرفقات المهام).
- إنشاء Storage Bucket الآمن والـ Route Handlers الخاصة بتوليد Signed URLs.
- دمج `design-preview` مع واجهة `/crm/tasks` الفعلية وربطها بالـ Database.
- اختبارات الـ End-to-End و Smoke Tests.
- تطبيق Migration فعلياً على Staging وتجربة الـ Rollback.
- إزالة واجهة المعاينة نهائياً بعد استقرار الدمج.

## خطوات الاستئناف (تحديث 2026-07-13)
1. إنشاء الصلاحيات الجديدة في `prisma/seed.ts` وجعلها Idempotent.
2. إنشاء مجموعة `Server Actions` الأساسية في `src/actions/workProjects.ts` وتحديثات `actions/tasks.ts`.
3. إنشاء نقطة نهاية الرفع الآمنة `/api/storage/upload-url/route.ts` و`/api/storage/confirm/route.ts`.
4. البدء بتوصيل `WorkProjectDetailsDrawer` بالـ Server Actions.
5. البدء بتوصيل Kanban Board بالبيانات الفعلية للمشروع المختار.
