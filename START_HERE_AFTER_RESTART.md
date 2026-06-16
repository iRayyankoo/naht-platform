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
