# Naht Platform (ERP, CRM, and CMS)

## Overview
A comprehensive property management, sales, and content management platform for Naht Real Estate. Built with Next.js 15, React, Tailwind CSS, and Prisma (PostgreSQL).

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (via Supabase) + Prisma ORM
- **Styling:** Tailwind CSS + Custom CSS modules
- **Authentication:** NextAuth.js (Session-based)
- **File Storage:** Local for now (Planned Cloudflare R2)

## Current Status After Batch 9

### 1. اعتمادات الدفعات:
* تم اعتماد **Batch 8** (Luxury Homepage Real Estate Showcase Redesign).
* تم اعتماد **Batch 9** (Brand Identity & Theme Control from CRM).
* تم اعتماد **Batch 10** (Footer Management from CRM).
* تم اعتماد **Batch 12** (CMS-first Hardcoded Cleanup).

### 2. الإنجازات في Batch 10 و Batch 12:
* **إدارة الفوتر (Batch 10)**: إضافة تحكم كامل في الفوتر وروابطه من لوحة التحكم `/crm/cms/footer`.
* **إزالة القيم الثابتة (Batch 12)**: 
  - إزالة أرقام التواصل الثابتة وربط واتساب والاتصال بـ `SiteSettings`.
  - ربط `NahtStandard` في الصفحة الرئيسية بالـ CMS.
  - إضافة إدارة محتوى صفحة المشاريع (`/crm/cms/projects`).
  - إصلاح `/crm/cms/projects` باستخدام Safe Fallbacks.
  - تحسين عنوان وتصميم صفحة المشاريع العامة مع إضافة فلاتر متقدمة (النوع، الحالة، المدينة، البحث).
  - تحسين وضوح الـ Select Dropdowns لضمان تجربة مستخدم فخمة.
  - إضافة تحكم `headerCtaText` و `headerCtaUrl` في إعدادات الموقع للتحكم في زر الهيدر العام.

### 3. الإنجازات في Batch 8 و Batch 9:
* **تحديث الصفحة الرئيسية (Batch 8)**: تحسين تصميم الصفحة لتكون Editorial Luxury، مع إضافة `NahtStandard` وتعديل `HeroSection` و `FeaturedProjects` وإضافة زر الشاشة العائمة `StickyMobileCta` للموبايل، وتنعيم الحواف والتصميم.
* **إدارة الهوية البصرية (Batch 9)**: 
  - إضافة صفحة إدارة الهوية البصرية `/crm/cms/brand`.
  - إضافة رابط "الهوية البصرية" في القائمة الجانبية لإدارة المحتوى.
  - إضافة حقول الهوية والألوان والشعار في `SiteSettings` بـ Prisma.
  - استخدام CSS Variables في الموقع العام لتطبيق الهوية دون التأثير على لوحة تحكم الـ CRM.
* **قواعد الأمان**: لم تتأثر الصلاحيات أو أنظمة التتبع أو وظائف הـ CRM بتاتاً بهذا التعديل.

### 4. حالة الميزات الحالية:
* لا يوجد دمج مع `Main / Master`.
* لا يوجد ربط للخدمات الخارجية (Vercel, Supabase, Cloudflare R2, DNS).
* لم يتم البدء في دعم اللغة الإنجليزية أو الاستضافة.

---

## Current Status After Batch 7

### 1. اعتمادات الدفعات:
* تم اعتماد **Batch 7** (إدارة المستخدمين والصلاحيات).

### 2. الإنجازات في Batch 7:
* **تعديل Prisma**: تمت إضافة الحقل `isActive` لجدول `User` للتحكم في حالة الحسابات بدون حذفها.
* **إدارة المستخدمين**: بناء نظام متكامل `/crm/users` يسمح بعرض، إضافة، وتعديل المستخدمين، وتفعيلهم أو تعطيلهم، مع إمكانية تغيير كلمات المرور وتعيين الأدوار (ADMIN, MARKETING, SALES).
* **حماية شاملة للصلاحيات**: 
  - إخفاء روابط القائمة الجانبية تلقائياً بناءً على دور المستخدم.
  - حماية الدخول المباشر للصفحات باستخدام `requireRole` في الـ `Server Components` والـ `Layouts`.
  - حماية العمليات وتحديث البيانات باستخدام `actionRequireRole` في كافة الـ `Server Actions` لضمان استحالة اختراق النظام.
* **قواعد SALES**: موظف المبيعات محصور في رؤية العملاء المعينين له فقط والعملاء غير المعينين (لاستلامهم)، ولا يستطيع فتح روابط العملاء الآخرين.
* **قواعد الأمان الاحترازية**: 
  - يمنع النظام دخول أي حساب معطل `isActive = false`.
  - يمنع النظام تعطيل، أو تغيير دور، أو حذف آخر `ADMIN` لتجنب الإغلاق الذاتي للنظام.

### 3. حالة الميزات الحالية:
* **لوحة التحكم والتتبع**: تعمل بشكل كامل حسب الصلاحيات.
* **المحتوى التجريبي**: يعمل بشكل ممتاز.
* **الفرع**: ما زال العمل محصوراً على الفرع `ui-refinements`.
* **الخدمات الخارجية**: لم يتم الدمج مع `Main / Master`، ولم يتم ربط (Vercel, Supabase, R2, DNS).

---

## Current Status After Batch 6
### 1. اعتمادات الدفعات:
* تم اعتماد **Batch 5** (تحسينات الفلاتر الشاملة وإدارة الصور الرئيسية للمشاريع).
* تم اعتماد **Batch 6** بنجاح.

### 2. الإنجازات في Batch 6:
* **تطوير Dashboard**: إنشاء لوحة قيادة متكاملة `/crm` تعرض بيانات حيّة من قاعدة البيانات للإحصائيات (العملاء الجدد، إجمالي الطلبات، نقرات الواتساب/الاتصال) وجداول بآخر العملاء والطلبات.
* **إضافة ContactPageContent**: إنشاء جدول جديد في Prisma مختص بإدارة محتوى صفحة "تواصل معنا" (النصوص، زر الإرسال، خلفية الهيرو، و SEO).
* **إدارة محتوى تواصل معنا**: تصميم وبناء صفحة `/crm/cms/contact` للتحكم في كافة نصوص الصفحة وصورها.
* **إدارة طلبات تواصل معنا**: تصميم وبناء صفحة مخصصة `/crm/requests/contact` للتحكم المباشر في العملاء القادمين من نموذج التواصل.

### 3. حالة الميزات الحالية:
* **الفلاتر (Filters)**: تعمل بشكل سليم في جميع صفحات CRM المعتمدة، مع إضافة خيار البحث النصي `searchPlaceholder`.
* **رفع الصور والوسائط**: مكونات `UploadButton` و `ImageUpload` تعمل بشكل ممتاز في الـ CMS.
* **Toast Notifications**: إشعارات حفظ وتعديل البيانات تظهر بشكل سليم في جميع أجزاء النظام.
* **Featured Projects**: الصفحة الرئيسية تقرأ وتتحكم في المشاريع المميزة.
* **Tracking و النماذج**: استقبال العملاء، والـ UTM Tracking، وتتبع `form_submit` يعمل بشكل ممتاز ولم يتأثر بالتعديلات الأخيرة.

### 4. المهام المعلقة (لم يتم تنفيذها بعد):
* **الصلاحيات (Roles/Permissions)**
* **اللغة الإنجليزية (English Localization)**
* **الاستضافة (Hosting)**
* **ربط Vercel**
* **ربط Supabase / Cloudflare R2**
* **تغيير DNS**

---

## Current Status After Batch 4 Revision (Revision 2)

### Where We Are Now
We have successfully completed all core features up to **Batch 4 (Revision 2)**. The platform is currently fully functional locally on the `ui-refinements` branch. We have deliberately paused before entering Phase 7 (Hosting & Deployment) to ensure all features meet the premium standard required.

### Branch Status
- **Current Branch:** `ui-refinements`
- **State:** Stable, tested, and backed up.

### What Has Been Accomplished:

**Batch 1 (Admin & Sidebar Refinement):**
- Rebuilt the CRM sidebar (`CrmSidebar.tsx`) to be robust, modern, and expandable.
- Implemented smooth transitions, proper active states, and categorized navigation (Sales, Marketing, Content, Settings).

**Batch 2 (Leads System & UI):**
- Redesigned the Leads table to display more context (Source, Temperature, Next Action).
- Refined the individual Lead details page (`/crm/leads/[id]`) to act as a proper CRM dashboard (showing follow-ups, timeline, and internal notes).
- Ensured seamless status transitions.

**Batch 3 (Public Forms & CRM Requests):**
- Polished all public-facing forms (Contact, Maintenance, Vendors, Careers, Opportunity).
- Unified form layouts with clear indicators for required fields, better spacing, and loading states.
- Created and linked dedicated CRM detail pages for all request types (e.g., `/crm/requests/maintenance/[id]`).
- Fixed Next.js 15 routing issues (`await params.id`) to ensure no runtime errors when accessing details.

**Batch 4 (Premium Public Website Redesign):**
- **Revision 1 & 2:** Redesigned the homepage to match the luxury aesthetics of top-tier real estate developers.
- **Hero Section:** Dark overlay, massive typography, transparent header on scroll, and a smart media background.
- **Featured Projects:** Massive portfolio-style layout for the top project, with a sleek grid for the rest. Added a fallback to show latest projects if none are marked as featured.
- **About Brief:** Grayscale imagery that regains color on hover, set against a deep dark background.
- **Project Types (Communities):** Replaced generic SaaS icons with deep, abstract image cards representing communities.
- **Stats & Why Choose Us:** Elegant serif numbers and subtle background numbering.
- **Navbar:** Transparent on the top of the homepage, solid white elsewhere.

### Latest Feature: Smart Hero Slider
The Hero section background is now fully controllable via the CMS (`/crm/cms/homepage`) without any Prisma schema modifications.
- **How to edit:** Go to `/crm/cms/homepage` and look for the "الوسائط" (Media) field.
- **Single Image:** Paste a single image URL.
- **Video:** Paste a single URL ending in `.mp4`. It will auto-play muted in the background.
- **Slider:** Paste multiple image URLs (each on a new line or separated by commas). The Hero will automatically turn into a smooth, auto-playing slider.

### Status of Features
- **Featured Projects:** Working perfectly. Uses a fallback mechanism.
- **Tracking & Forms:** Untouched and fully operational. `TrackedButton` and `TrackedForm` continue to send precise UTM parameters and click events to the CRM.
- **CRM:** Fully operational.

### Important Note on Deliberate Omissions
As per strict user instructions:
- **No Supabase/Vercel/Cloudflare R2** integration has been initialized yet.
- **No DNS** changes have been made.
- **No merging** into `main` or `master`.
- **No Prisma** schema modifications were made for the slider (we creatively used the existing `heroBackgroundImage` string field).

## Current Status After Batch 10

**Batch 10 (Footer Management from CRM) is complete and approved:**
- Created dedicated CMS page `/crm/cms/footer` for footer management.
- Footer is now completely dynamic and controllable from the CRM.
- Implemented `FooterLink` model in Prisma to allow adding, editing, showing/hiding, reordering, and setting external targets for footer links.
- Implemented footer settings inside `SiteSettings` for company name, description, footer logo, copyright text, and global toggles for showing/hiding sections.
- The footer fully integrates with the Brand Identity CSS Variables established in Batch 9.
- Tracking, UTM, Lead Forms, WhatsApp integration, and Role Permissions were completely unaffected.
- No merge with Main/Master, and no external services were linked.

### Core Architecture Principle: CMS-first / Admin-first
Moving forward, the platform is governed by the **CMS-first / Admin-first** principle.
This means the platform must be sustainable and manageable entirely from the CRM dashboard as much as possible. We should not have to return to the source code except for absolute necessity.
Any texts, links, logos, colors, contact details, general sections, or settings that might change in the future **MUST** be dynamic from the CRM, with safe fallbacks hardcoded in the application.
