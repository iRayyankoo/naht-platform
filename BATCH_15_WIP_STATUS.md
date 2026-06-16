# BATCH_15_WIP_STATUS

## Pause Status - Before Continuing Tomorrow

1. **آخر مرحلة معتمدة رسميًا:**
   Batch 14: Real estate products display enhancement

2. **آخر Backup رسمي:**
   naht-platform-backup-after-batch-14-real-estate-products-stable

3. **حالة Batch 15 (تحديث):**
   قيد الاختبار النهائي ولم يتم اعتماده بعد. تم الانتهاء من التنفيذ بالكامل وبانتظار اعتماد المستخدم.

4. **الهدف النهائي قبل الاعتماد:**
   تحويل قسم الخريطة في الصفحة الرئيسية إلى Geographic Map باستخدام Leaflet / React Leaflet و Latitude / Longitude، مع إبقاء Image Map كخيار احتياطي.

5. **المكتبات المضافة:**
* leaflet
* react-leaflet
* @types/leaflet

6. **ما تم إنجازه:**
* إضافة حقول mapLat و mapLng للمنتجات.
* إضافة mapMode و mapCenterLat و mapCenterLng و mapZoom لإعدادات الصفحة الرئيسية.
* إنشاء GeographicMap.tsx.
* ربط InteractiveMap بين وضع geographic و image.
* إضافة تحكم CMS لنوع الخريطة والمركز والزووم.
* إضافة حقول Lat/Lng داخل CRM المنتج.
* تحديث فيلا Demo بالإحداثيات:
  Latitude: 24.7136
  Longitude: 46.6753
* تشغيل prisma db push بنجاح.
* تشغيل prisma generate بنجاح بعد إيقاف السيرفر.
* إصلاح تحذير React key باستخدام slug.
* npm run build ناجح.

7. **المشكلة التي كانت موجودة وتم حلها:**
   React key warning بسبب عدم وجود id في select، وتم استخدام slug كمفتاح ثابت.

8. **المطلوب عند الرجوع بكرة:**
* تشغيل السيرفر محليًا فقط للاختبار.
* اختبار الصفحة الرئيسية.
* التأكد أن الخريطة الجغرافية تظهر.
* التأكد أن فيلا Demo تظهر في الرياض.
* اختبار Marker و Popup و زر عرض التفاصيل.
* اختبار الفلاتر.
* اختبار mapMode = geographic و mapMode = image من CMS.
* اختبار الجوال.
* إذا كل شيء سليم، يتم اعتماد Batch 15 ثم Commit + Documentation + Backup رسمي.

9. **أوامر الاستكمال المقترحة بكرة:**
```bash
cd "c:\Users\Rayyan Naht\Desktop\Naht-ERP\6-naht-platform"
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
```
ملاحظة: لا يتم تشغيل npm run dev إلا وقت الاختبار فقط.

10. **إضافة ميزة إعدادات العلامات (Pins Settings):**
* تم أخذ نسخة احتياطية محلية باسم `naht-platform-wip-backup-before-pins-settings` قبل التنفيذ.
* تم تحديث `schema.prisma` وإضافة حقول الألوان `pinColorAvailable` إلخ، وشعار العلامة `pinLogoUrl` و `pinLogoSize`.
* تم تحديث `MapManagerClient.tsx` ليتضمن لوحة تحكم ألوان وشعار العلامات مع Preview.
* تم ربط الألوان والشعار في `GeographicMap.tsx` و `InteractiveMap.tsx`.

11. **إضافة إعدادات ألوان الخريطة (Map Style Settings):**
* تم أخذ نسخة احتياطية محلية باسم `naht-platform-wip-backup-before-batch-15-map-style-settings` قبل التنفيذ.
* تمت إضافة حقول CSS Filters للـ `TileLayer` في قاعدة البيانات.
* تم توفير قوالب جاهزة (Presets) مثل Light, Warm, Muted وغيرها بالإضافة إلى تحكم يدوي متقدم في السطوع والتباين والتشبع.
* تم تطبيق الـ CSS Filters بطريقة معزولة باستخدام فئة `custom-tile-layer` بحيث لا تؤثر إطلاقاً على ألوان الـ Pins أو الـ Popup.

12. **إضافة ميزة Live Map Preview:**
* تم أخذ نسخة احتياطية محلية باسم `naht-platform-wip-backup-before-batch-15-live-map-preview` قبل التنفيذ.
* تمت إضافة معاينة مباشرة للخريطة داخل صفحة `/crm/projects-map`.
* التعديلات على إعدادات الخريطة (الألوان، العلامات، الزووم، نوع الخريطة) تنعكس فوراً على الـ Preview دون الحاجة للحفظ.
* الحفظ يتم فقط عند الضغط على زر الحفظ، مما يوفر تجربة تعديل آمنة.

### UI Update (Featured Projects)
- **تم تعديل UI قسم المشاريع المختارة:** تقليل المسافات البيضاء العلوية والسفلية، تحسين ترتيب ومقاسات العناوين، وتحسين محاذاة زر عرض المجموعة كاملة.
- **سبب التعديل:** بناءً على ملاحظة User بأن القسم يحتوي مساحة بيضاء مبالغ فيها وأن توزيع العناصر غير احترافي.
- **الملفات التي تم تعديلها:** src/app/(public)/components/FeaturedProjects.tsx
- **ملاحظة:** التعديل UI (تصميم) فقط في الـ CSS/Classes ولا يغير البيانات أو Prisma أو الخريطة أو CRM بأي شكل من الأشكال.

### Next Phase: Management Staging Review
- **المرحلة القادمة:** Google Cloud Staging / UAT Preview for Management Review
- **الوصف:** دراسة وتجهيز بيئة عرض Staging شبه نهائية للإدارة باستخدام Google Cloud (أو البدائل) دون التأثير على التطوير المحلي أو بدء الإنتاج الفعلي.

### Next Phase: Vercel + Supabase Staging Review
- **المرحلة القادمة:** Vercel + Supabase Staging / UAT Preview for Management Review
- **الوصف:** إعداد مسار وخطّة تنفيذية لرفع نسخة تجريبية Staging للإدارة باستخدام Vercel للعرض و Supabase PostgreSQL لقاعدة البيانات، دون المساس بتطوير SQLite المحلي ودون عمل Production Deployment.

### Current Phase: Staging Preparation
- **الحالة الحالية:** Preparing isolated staging-preview branch for Vercel + Supabase Staging / UAT
- **الوصف:** يتم الآن إنشاء فرع معزول استعداداً لربطه بقاعدة بيانات PostgreSQL للرفع على Vercel، دون التأثير على بيئة التطوير الأصلية (SQLite).
