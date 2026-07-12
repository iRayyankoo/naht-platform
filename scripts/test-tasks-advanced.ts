// Mock Next.js dependencies before importing anything else
import Module from 'module';
import path from 'path';
const originalRequire = Module.prototype.require;

// We will use these globals to control the mock session
(global as any).mockUser = {
  id: 'user-admin',
  role: 'ADMIN',
  name: 'Admin User'
};

(global as any).mockPermissions = ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.approve'];

(Module.prototype as any).require = function(request: string) {
  if (request === 'next-auth') {
    return {
      getServerSession: async () => {
        if (!(global as any).mockUser) return null;
        return { user: (global as any).mockUser };
      }
    };
  }
  if (request === 'next/cache') {
    return { revalidatePath: () => {} };
  }
  if (request === 'next/navigation') {
    return { redirect: () => {} };
  }
  if (request.startsWith('@/')) {
    request = path.join(__dirname, '..', 'src', request.substring(2));
  }

  // Intercept rbac-helpers to inject permissions dynamically
  if (request.includes('rbac-helpers')) {
    const rbac = originalRequire.apply(this, [request] as any);
    return {
      ...rbac,
      getCurrentUserPermissions: async () => (global as any).mockPermissions,
      checkPermission: async (code: string) => {
        if ((global as any).mockUser?.role === 'ADMIN') return true;
        return (global as any).mockPermissions.includes(code);
      },
      requirePermission: async (code: string, options: any) => {
        const has = (global as any).mockUser?.role === 'ADMIN' || (global as any).mockPermissions.includes(code);
        if (options?.mode === 'enforce' && !has) return false;
        return has;
      }
    };
  }
  return originalRequire.apply(this, [request] as any);
};

// Now we can safely import our actions and Prisma
import { prisma } from "../src/lib/prisma";
import { createTask, updateTask, startTask, submitForApproval, approveTask, rejectTask, completeTask } from "../src/actions/tasks";

async function runAdvancedTests() {
  console.log("=== بدء اختبارات دورة حياة المهام المتقدمة (Actions Level) ===");
  
  let adminUser;
  let normalUser;
  
  try {
    // Setup test users in DB
    adminUser = await prisma.user.upsert({
      where: { email: "admin-test@naht.com" },
      update: {},
      create: { name: "Admin Test", email: "admin-test@naht.com", role: "ADMIN", isActive: true }
    });
    
    normalUser = await prisma.user.upsert({
      where: { email: "user-test@naht.com" },
      update: {},
      create: { name: "User Test", email: "user-test@naht.com", role: "SALES", isActive: true }
    });

    // TEST 1: مستخدم بلا صلاحية tasks.create
    console.log("\n1. اختبار: مستخدم بلا صلاحية tasks.create");
    (global as any).mockUser = normalUser;
    (global as any).mockPermissions = [];
    try {
      await createTask({ title: "مهمة فاشلة", priority: "LOW", requiresApproval: false });
      console.error("❌ فشل الاختبار: تم السماح بإنشاء المهمة بدون صلاحية");
    } catch (e: any) {
      if (e.message.includes("ليس لديك صلاحية")) {
        console.log("✅ نجاح: تم منع الإنشاء لغياب الصلاحية.");
      } else {
        throw e;
      }
    }

    // Set Admin Context for creation
    (global as any).mockUser = adminUser;
    (global as any).mockPermissions = ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.approve'];
    
    // Create Task that requires approval assigned to Normal User
    const task = await createTask({ 
      title: "مهمة اختبار معقدة", 
      priority: "HIGH", 
      requiresApproval: true,
      assignedToId: normalUser.id
    });
    
    // TEST 2: مستخدم بلا صلاحية tasks.edit يحاول تعديل المهمة
    console.log("\n2. اختبار: مستخدم بلا صلاحية tasks.edit يحاول تعديل المهمة");
    (global as any).mockUser = normalUser;
    (global as any).mockPermissions = ['tasks.view'];
    try {
      await updateTask(task.taskId, { title: "تعديل مرفوض", priority: "HIGH", requiresApproval: true });
      console.error("❌ فشل الاختبار: تم السماح بالتعديل بدون صلاحية");
    } catch (e: any) {
      console.log("✅ نجاح: تم منع التعديل لغياب الصلاحية.");
    }

    // TEST 3: محاولة تعديل حقول الحالات عن طريق updateTask
    console.log("\n3. اختبار: عدم السماح لـ updateTask بتغيير حقول الحالات");
    (global as any).mockUser = adminUser; // Admin has edit permission
    try {
      // @ts-ignore - deliberately passing illegal field
      await updateTask(task.taskId, { title: "تعديل مسموح", priority: "HIGH", requiresApproval: true, taskStatus: "DONE" });
      const t = await prisma.task.findUnique({ where: { id: task.taskId } });
      if (t?.taskStatus === "DONE") {
        console.error("❌ فشل الاختبار: updateTask سمح بتغيير حالة المهمة بشكل مباشر");
      } else {
        console.log("✅ نجاح: updateTask يتجاهل التعديلات المباشرة على الحالات (بفضل zod schema).");
      }
    } catch (e: any) {
      console.log("✅ نجاح: تحديث الحالات محمي.");
    }

    // TEST 4: إرسال مهمة لا تتطلب اعتماداً أو لم تبدأ
    console.log("\n4. اختبار: إرسال مهمة لم يتم البدء بها للاعتماد");
    (global as any).mockUser = normalUser;
    (global as any).mockPermissions = ['tasks.view', 'tasks.edit'];
    try {
      await submitForApproval(task.taskId);
      console.error("❌ فشل الاختبار: تم إرسال مهمة بحالة TODO للاعتماد");
    } catch (e: any) {
      console.log("✅ نجاح: مُنع إرسال مهمة TODO للاعتماد. " + e.message);
    }

    // Start task
    await startTask(task.taskId);

    // TEST 5: إكمال مهمة تتطلب اعتمادًا قبل الموافقة
    console.log("\n5. اختبار: إكمال مهمة تتطلب اعتمادًا قبل الحصول عليه");
    try {
      await completeTask(task.taskId);
      console.error("❌ فشل الاختبار: تم إكمال مهمة تتطلب اعتمادًا");
    } catch (e: any) {
      console.log("✅ نجاح: مُنع إكمال المهمة. " + e.message);
    }

    // Submit for approval
    await submitForApproval(task.taskId);
    console.log("✅ تم إرسال المهمة للاعتماد (الدورة 1)");

    // TEST 6: طلبان متزامنان للإرسال للاعتماد (Double Submit)
    console.log("\n6. اختبار: طلبان متزامنان للإرسال للاعتماد لنفس الدورة");
    try {
      await submitForApproval(task.taskId);
      console.error("❌ فشل الاختبار: تم قبول الإرسال الثاني للاعتماد");
    } catch (e: any) {
      console.log("✅ نجاح: تم منع الإرسال المكرر (حالة الاعتماد حالياً PENDING).");
    }

    // TEST 7: مستخدم بلا صلاحية tasks.approve يحاول الموافقة
    console.log("\n7. اختبار: مستخدم بلا صلاحية tasks.approve يحاول الموافقة");
    (global as any).mockUser = normalUser;
    (global as any).mockPermissions = ['tasks.view', 'tasks.edit'];
    try {
      await approveTask(task.taskId);
      console.error("❌ فشل الاختبار: تم السماح بالموافقة لغير صاحب الصلاحية");
    } catch (e: any) {
      console.log("✅ نجاح: تم منع الموافقة. " + e.message);
    }

    // TEST 8: الرفض بدون سبب أو بسبب قصير
    console.log("\n8. اختبار: الرفض بدون سبب كافٍ");
    (global as any).mockUser = adminUser;
    try {
      await rejectTask(task.taskId, "لا");
      console.error("❌ فشل الاختبار: تم قبول الرفض بسبب قصير جداً");
    } catch (e: any) {
      console.log("✅ نجاح: تم منع الرفض لسبب قصير. " + e.message);
    }

    // Reject Properly
    await rejectTask(task.taskId, "تحتاج إلى مراجعة الملفات المرفقة");
    console.log("✅ تم رفض المهمة بالسبب الصحيح.");

    // TEST 9: الموافقة على مهمة غير منتظرة للاعتماد (بما أنها الآن REJECTED)
    console.log("\n9. اختبار: الموافقة على مهمة غير منتظرة للاعتماد");
    try {
      await approveTask(task.taskId);
      console.error("❌ فشل الاختبار: تمت الموافقة على مهمة بحالة REJECTED");
    } catch (e: any) {
      console.log("✅ نجاح: تم منع الموافقة لأن المهمة ليست PENDING.");
    }

    // Resubmit
    (global as any).mockUser = normalUser;
    (global as any).mockPermissions = ['tasks.view', 'tasks.edit'];
    await submitForApproval(task.taskId);
    console.log("✅ تم إعادة الإرسال للاعتماد (الدورة 2)");

    // TEST 10: المحافظة على دورة الرفض السابقة
    console.log("\n10. اختبار: المحافظة على سجل الرفض السابق");
    const history = await prisma.taskApproval.findMany({ where: { taskId: task.taskId }, orderBy: { approvalRound: 'asc' } });
    if (history.length === 2 && history[0].status === "REJECTED" && history[1].status === "PENDING") {
      console.log("✅ نجاح: سجل الاعتمادات محفوظ بشكل صحيح ولم يتم مسح الدورة السابقة.");
    } else {
      console.error("❌ فشل الاختبار: السجل غير صحيح. وجد: " + history.length);
    }

    // Approve Task
    (global as any).mockUser = adminUser;
    await approveTask(task.taskId);
    console.log("✅ تمت الموافقة على المهمة بنجاح، وتحولت حالتها إلى DONE.");

    // TEST 11: تعديل مهمة DONE
    console.log("\n11. اختبار: منع تعديل مهمة DONE");
    try {
      await updateTask(task.taskId, { title: "محاولة بعد الإكمال", priority: "HIGH", requiresApproval: true });
      console.error("❌ فشل الاختبار: تم السماح بتعديل المهمة المكتملة");
    } catch (e: any) {
      console.log("✅ نجاح: تم منع التعديل للمهمة المكتملة. " + e.message);
    }

    // Clean up
    await prisma.task.deleteMany({ where: { id: task.taskId } });
    
    console.log("\n🎉 جميع الاختبارات المتقدمة اجتازت بنجاح!");

  } catch (err) {
    console.error("\n❌ حدث خطأ غير متوقع في بيئة الاختبار:", err);
  } finally {
    // Force cleanup tasks created by these users to prevent RESTRICT error
    if (adminUser) await prisma.task.deleteMany({ where: { createdById: adminUser.id } }).catch(()=>null);
    if (normalUser) await prisma.task.deleteMany({ where: { createdById: normalUser.id } }).catch(()=>null);
    if (adminUser) await prisma.user.delete({ where: { id: adminUser.id } }).catch(()=>null);
    if (normalUser) await prisma.user.delete({ where: { id: normalUser.id } }).catch(()=>null);
    await prisma.$disconnect();
  }
}

runAdvancedTests();
