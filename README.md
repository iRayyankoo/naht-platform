# Naht Real Estate CRM & CMS

نظام إدارة المحتوى وإدارة علاقات العملاء (CRM) لشركة نحت الأصول العقارية. مبني باستخدام `Next.js 14`, `TypeScript`, `Prisma`, و `Tailwind CSS`.

## المتطلبات الأساسية
- Node.js 18 أو أحدث
- قاعدة بيانات PostgreSQL (موصى بـ Supabase للإنتاج) أو SQLite للتطوير المحلي.

## طريقة التشغيل المحلي

1. **تثبيت الحزم**:
   ```bash
   npm install
   ```

2. **إعداد متغيرات البيئة**:
   قم بنسخ ملف `.env.example` إلى ملف جديد باسم `.env`:
   ```bash
   cp .env.example .env
   ```
   املأ البيانات اللازمة (انظر أدناه).

3. **إعداد قاعدة البيانات**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **تشغيل سيرفر التطوير**:
   ```bash
   npm run dev
   ```
   الموقع متاح على `http://localhost:3000`

## أوامر NPM الهامة
- `npm run dev`: لتشغيل خادم التطوير.
- `npm run build`: لتجهيز المشروع لبيئة الإنتاج (Production).
- `npm run start`: لتشغيل المشروع بعد البناء (Build).

## أوامر Prisma الهامة
- `npx prisma generate`: لتوليد أنواع TypeScript بناءً على المخطط (يُنفذ بعد أي تعديل).
- `npx prisma studio`: لفتح واجهة المتصفح لإدارة وعرض محتويات قاعدة البيانات بسهولة.
- `npx prisma migrate dev`: لترحيل التعديلات الجديدة إلى قاعدة البيانات (في بيئة التطوير).
- `npx prisma db push`: لدفع التعديلات محلياً بشكل سريع.
- `npx prisma migrate deploy`: لتطبيق الترحيلات على قاعدة بيانات الإنتاج (Production).

## طريقة البناء للاستضافة (Build)
يُفضل دائماً فحص المشروع محلياً قبل رفعه:
```bash
npm run build
```
إذا تمت العملية بدون أخطاء، فالمشروع جاهز للرفع على Vercel.

## طريقة اختبار المشروع
- **اختبار النماذج:** ادخل لصفحات `http://localhost:3000/contact` وجرب الإرسال، وتأكد من حفظ הـ Lead عبر Prisma Studio.
- **اختبار الواجهة الإدارية:** توجه إلى `http://localhost:3000/crm`. (تحتاج لحساب بصلاحية `ADMIN`).
- **اختبار الخرائط والروبوتات:** توجه لـ `http://localhost:3000/sitemap.xml` و `http://localhost:3000/robots.txt`.

## الدعم والتوثيق
لمزيد من التفاصيل حول هيكلية المشروع، طريقة رفع الملفات، وضبط إعدادات الـ SEO و UTM، يرجى الرجوع إلى ملفات:
- `PROJECT_DOCUMENTATION.md`
- `HANDOVER_SUMMARY.md`
