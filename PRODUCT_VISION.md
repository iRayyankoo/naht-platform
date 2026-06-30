# PRODUCT_VISION.md
## رؤية المنتج المعمارية والاستراتيجية (Product Vision & Strategy)

### 1. Product Vision (رؤية المنتج)
المنتج هو منصة لإدارة علاقات العملاء وإدارة المحتوى (Generic CRM Platform) قابلة للتخصيص والبيع لعدة شركات، وليس نظاماً خاصاً بشركة "نحت" فقط. الهدف هو بناء منصة قوية ومرنة يمكن استنساخها وتقديمها كمنتج متكامل للعملاء.

### 2. Current Strategy (الاستراتيجية الحالية المعتمدة)
المسار المعماري المعتمد هو **White-label Single-Tenant**. 
هذا يعني أن كل شركة/عميل سيحصل على:
- **Deployment مستقل:** استضافة وخادم مخصص.
- **Database مستقلة:** قاعدة بيانات معزولة بالكامل.
- **Environment variables مستقلة:** إعدادات بيئة مخصصة.
- **Branding مستقل:** شعارات وألوان وهوية بصرية خاصة بالشركة.
- **CMS content مستقل:** محتوى الموقع والصفحات مخصص بالكامل.
- **Tracking pixels مستقلة:** تتبع الحملات والإحصائيات منفصل تماماً.

### 3. Why Not Multi-Tenant Now (لماذا لم نختر مسار الـ SaaS Multi-Tenant الآن؟)
- **لا يوجد `tenantId` حالياً:** النظام غير مبني لربط البيانات بالشركات.
- **لا يوجد `Organization model`:** لا يوجد كيان تنظيمي.
- **تغيير Prisma الآن خطر:** تعديل المخطط (Schema) يشكل خطراً كبيراً على استقرار النظام.
- **يحتاج تعديل كل Query:** لضمان العزل الصحيح وعدم تداخل بيانات الشركات.
- **يحتاج عزل بيانات قوي:** يتطلب بناء سياسات صارمة ومعقدة (RLS).
- **قد يكسر النظام الحالي:** الذي يعمل حالياً بكفاءة عالية.
- **غير ضروري في مرحلة البيع الأولى:** نموذج (White-label) يفي بالغرض ويسهل البيع الفوري وتوسيع العملاء.

### 4. Product Layers (طبقات النظام)
ينقسم النظام إلى الطبقات التالية:

**A) Core Platform:**
- Auth
- Users
- Roles
- Permissions
- Leads
- Campaigns
- Tracking
- CMS
- Settings
- Dashboard
- Files

**B) Optional Modules:**
- Real Estate Module
- Projects
- Units
- Maps
- Maintenance
- Vendors
- Careers
- QR
- Reports
- WhatsApp Integration

**C) Client Configuration:**
- Company name
- Logo
- Colors
- Domain
- Contact info
- Social links
- SEO
- Tracking pixels
- Lead statuses
- Custom labels

### 5. Naht as First Client (نحت كأول عميل)
شركة نحت هي النسخة العملية الأولى (First Implementation) للمنتج:
- **Brand:** نحت الأصول العقارية
- **Industry:** Real Estate
- **Modules enabled:** Real Estate, CRM, CMS, Campaigns, Tracking, Map
- **الهدف:** أن تكون نحت دراسة حالة ناجحة (Case Study) قابلة للتكرار مع شركات أخرى.

### 6. Naming Principle (قواعد التسمية)
- لا نستخدم اسم `Naht` في المكونات الجديدة إلا إذا كانت خاصة فعلاً بنحت.
- الكود الجديد يكون **Generic**.
- النصوص الخاصة بالشركة تكون في CMS أو Settings أو Config.
- "العقار" يكون Module مستقلاً وليس Core ثابت على المدى الطويل.

### 7. Development Rules Going Forward (قواعد التطوير المستقبلية)
- أي ميزة جديدة يجب تحديد هل هي Core أو Module أو Client Config.
- لا نضيف Hardcoded Naht جديد أبداً.
- لا نضيف Hardcoded Real Estate جديد داخل الـ Core.
- لا نغير Prisma إلا بعد خطة مستقلة منفصلة.
- لا نبدأ Multi-Tenant قبل جاهزية كاملة.
- أي تعديل تصميمي يجب أن يخدم المنتج العام وليس لنحت فقط.

### 8. Roadmap (خارطة طريق تدريجية)
- **Phase 1:** Product Vision Documentation (اكتملت بهذه الوثيقة).
- **Phase 2:** Remove hardcoded Naht fallbacks تدريجياً.
- **Phase 3:** Branding & Configuration cleanup.
- **Phase 4:** Generic UI Layout System.
- **Phase 5:** Real Estate Module separation plan.
- **Phase 6:** White-label deployment checklist.
- **Phase 7:** Optional SaaS Multi-Tenant study لاحقاً.

### 9. What Not To Change Now (ما لا يجب تغييره حالياً)
- لا تغيير Prisma
- لا تغيير DB
- لا tenantId
- لا refactor كبير
- لا تغيير Auth
- لا تغيير Production
- لا Merge
- لا Push
- لا تطبيق تصميم الآن

### 10. Final Decision (القرار النهائي)
> **The product direction is White-label Single-Tenant Generic CRM Platform, with Naht as the first configured client implementation.**
