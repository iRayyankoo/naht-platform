# Architecture: Task Views & Work Project Sections

## 1. تفضيلات عرض المهام (Task Views)

### \`TaskViewMode\` و \`UserTaskPreference\`
- **\`TaskViewMode\` (Enum):** يحدد طرق العرض المتاحة للمهام (TABLE, GANTT, TIMELINE, CALENDAR, KANBAN, CARDS).
- **\`UserTaskPreference\` (Model):** جدول في قاعدة البيانات لربط كل \`userId\` بطريقة العرض الافتراضية المفضلة (\`defaultViewMode\`).
- **تدفق البيانات:** يقوم \`TasksClientWrapper\` بجلب هذا التفضيل في بداية التحميل، ويحفظ أي تغيير يجريه المستخدم (عبر واجهة التبديل) تلقائيًا باستخدام Server Action \`updateMyTaskViewPreference\`.

## 2. تاريخ البدء المخطط (\`plannedStartAt\`)
- تمت إضافته إلى نموذج الـ \`Task\` كـ \`DateTime\` اختياري.
- يكمل مع \`dueDate\` لتمثيل النطاق الزمني للمهمة (Range).
- في طرق عرض الـ Timeline والـ Gantt:
  - إذا وجد \`plannedStartAt\` و \`dueDate\` مختلفان، تعرض المهمة كشريط أفقي (Bar).
  - إذا كانا متساويين أو وجد تاريخ واحد فقط، تعرض كـ (Milestone).

## 3. أقسام مشروع العمل (Work Project Sections)
- **الغرض:** تقسيم المشاريع الكبيرة إلى أجزاء (مثل "تجهيز الموقع"، "التشطيبات") بدلاً من الإدارة المركزية المفرطة، مع فصلها برمجياً عن قسم الإدارة (Department) ومشروع العقار (Real Estate Project).

### النماذج والهيكلة
- **\`WorkProjectSection\` (Model):** يمثل القسم. يحتوي على \`managerId\`، وحالة (ACTIVE / ARCHIVED).
- **\`WorkProjectSectionMember\` (Model):** يربط الأعضاء المسموح لهم بالعمل على مهام هذا القسم.
- يتم إلحاق المهام بالقسم عبر الحقل الاختياري \`workProjectSectionId\` داخل \`Task\`.

### قواعد العضوية والمدير (الصلاحيات)
- مدير القسم وحده لا يملك إدارة القسم (تعديله أو أرشفته) تلقائيًا بمجرد كونه مديرًا للقسم.
- الإدارة (تعديل الأقسام، الأرشفة، إضافة/إزالة الأعضاء) تتطلب صلاحية `work_projects.edit` ثم أن يكون المستخدم OWNER أو MANAGER في مشروع العمل نفسه (Work Project).
- التجاوز (Override) لهذه القواعد مسموح فقط لـ `SUPER_ADMIN` الحقيقي عبر التحقق الخادمي في جلسة المستخدم.
- لا تعتمد Server Actions على `permissions.isSuperAdmin` القادمة من العميل (Client) كدليل أمان، بل يتم التحقق من الصلاحيات دائمًا في الخادم قبل التنفيذ.

### الأرشفة
- يمكن تغيير حالة القسم إلى \`ARCHIVED\`.
- الأقسام المؤرشفة لا تظهر في قوائم اختيار الأقسام الجديدة، لكن المهام القديمة تحتفظ بروابطها وتاريخها.

## 4. Adapters الحقيقية و Mock Adapters
- لضمان أمان الإنتاج وتسهيل تطوير الواجهات المرئية المتقدمة:
  - تعتمد `/crm/tasks/design-preview` على `mockWorkProjectSectionsAdapter` و Mock Data لا تنفذ عمليات حقيقية في قاعدة البيانات.
  - يعتمد الإنتاج `/crm/tasks` على `RealWorkProjectSectionsAdapter` الذي يستدعي الـ Server Actions الحقيقية (get, create, update, archive).
- يحظر وضع أكواد الـ Mock أو بيانات وهمية داخل مكونات الإنتاج العامة (مثل `TaskDetailsDrawer`).

## 5. ترتيب الـ Migrations
1. `20260713130000_phase_3_work_projects_sections` (تأسيس الأقسام وعلاقتها بالمشاريع والمستخدمين).
2. `20260713133000_phase_4_task_views` (تأسيس التفضيلات و `plannedStartAt`).

## 6. قواعد الأمان (RBAC)
- يتم التحقق من الصلاحيات عبر طبقتين (ClientPermissions في الواجهة لتمكين/تعطيل الأزرار، والتحقق الفعلي عبر `user.id` أو `permissions.isSuperAdmin` داخل الـ Server Actions).
- أي إضافة عضو أو تحديث مهمة يمر على بوابة `getCurrentUser()` لضمان الموثوقية وعدم الاختراق المباشر لقاعدة البيانات.
