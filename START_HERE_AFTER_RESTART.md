# Staging UAT Status - End of Day Snapshot
## Current Status
- **Environment**: Vercel Preview / Staging UAT
- **Branch**: staging-preview
- **Database**: Supabase PostgreSQL Staging
- **Seed**: Successfully executed. Database is populated with comprehensive demo data.
- **Images**: Fixed and visible.
  - **Issue**: The update block in upsert was empty, causing mainImage to remain NULL.
  - **Fix**: Populated the update block in seed.ts with all fields including mainImage and heroBackgroundImage.
  - **Assets**: Replaced SVG placeholders with high-quality JPGs extracted from local DB.
- **Final State**: Staging Preview is fully ready for the initial management presentation. Batch 15 is NOT fully closed yet. Production/Merge/DNS changes are strictly on hold.

## Important Links
- **Vercel Preview**: https://naht-staging-git-staging-preview-ri88s-projects.vercel.app
- **GitHub Repository**: https://github.com/iRayyankoo/naht-platform.git (Branch: staging-preview)
- **Supabase Project**: Naht Platform Staging
- **Admin Access**: See local env variable STAGING_ADMIN_EMAIL

## Recovery & Resumption Commands
`powershell
cd "c:\Users\Rayyan Naht\Desktop\Naht-ERP\6-naht-platform"
git checkout staging-preview
git pull origin staging-preview
npm run dev
npx prisma generate
`

*Note: Running the seed on Supabase requires temporary Environment Variables (DATABASE_URL, DIRECT_URL, STAGING_ADMIN_EMAIL, STAGING_ADMIN_PASSWORD) passed via the terminal, which must never be committed to Git.*

# START HERE AFTER RESTART


## How to continue from another device / طريقة الاستكمال من جهاز آخر

1. نقل مجلد الـ Backup كامل:
   naht-platform-wip-backup-after-batch-15-live-preview-before-restart
2. فك الضغط أو نسخه على الجهاز الجديد.
3. فتح المشروع في VS Code.
4. قراءة الملفات بالترتيب:
   - START_HERE_AFTER_RESTART.md
   - RESUME_FROM_HERE.md
   - PROJECT_HISTORY_AND_STATUS.md
   - BATCH_15_WIP_STATUS.md

5. تشغيل الأوامر التالية:
`ash
npm install
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
`

6. روابط الاختبار:
   - http://localhost:3000/
   - http://localhost:3000/crm/projects-map
   - http://localhost:3000/crm/cms/homepage
   - http://localhost:3000/crm/projects
   - http://localhost:3000/projects

7. ملاحظة مهمة:
   ملف .env غير موجود في الـ Backup لأنه حساس. إذا احتجناه لاحقًا يتم نسخه يدويًا وبشكل آمن من الجهاز الأصلي.

8. ملاحظة Git Recovery:
   إذا احتاج المطور استرجاع التعديلات على نسخة Git نظيفة، يستخدم الملفات التالية:
   - GIT_STATUS.txt
   - GIT_DIFF.patch
   - GIT_DIFF_STAGED.patch
   - UNTRACKED_FILES_LIST.txt

9. القيود:
   - لا Commit.
   - لا Merge.
   - لا Production.
   - لا Vercel.
   - لا Supabase.
   - لا R2.
   - لا DNS.
   إلا بعد موافقة Rayyan.

