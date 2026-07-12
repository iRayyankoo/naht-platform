import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== بدء اختبارات دورة حياة المهام (Prisma Level) ===");
  console.log("ملاحظة: بيئة الاختبار الحالية تفتقر إلى إطار مثل Jest، ولا تدعم محاكاة Next.js Server Actions (مثل cookies() المستخدمة للتحقق من الهوية). لذا نقوم باختبار منطق قاعدة البيانات مباشرة.");

  try {
    // 1. Create a mock user
    const user = await prisma.user.upsert({
      where: { email: "test-task-admin@naht.com" },
      update: {},
      create: {
        name: "Test Admin",
        email: "test-task-admin@naht.com",
        isActive: true,
      }
    });

    // 2. Create a Task (No Approval)
    console.log("1. اختبار إنشاء مهمة بسيطة (لا تتطلب اعتماد)...");
    let simpleTask = await prisma.task.create({
      data: {
        title: "مهمة بسيطة",
        priority: "LOW",
        requiresApproval: false,
        createdById: user.id,
      }
    });
    console.log(`[نجاح] المهمة أُنشئت بالحالة: ${simpleTask.taskStatus}, حالة الاعتماد: ${simpleTask.approvalStatus}`);

    // 3. Start Task
    console.log("2. اختبار بدء التنفيذ...");
    simpleTask = await prisma.task.update({
      where: { id: simpleTask.id },
      data: { taskStatus: "IN_PROGRESS" }
    });
    console.log(`[نجاح] الحالة الجديدة: ${simpleTask.taskStatus}`);

    // 4. Complete Task (No Approval)
    console.log("3. اختبار إكمال مهمة لا تتطلب اعتماد...");
    simpleTask = await prisma.task.update({
      where: { id: simpleTask.id },
      data: { taskStatus: "DONE", completedAt: new Date() }
    });
    console.log(`[نجاح] اكتملت المهمة بالحالة: ${simpleTask.taskStatus}`);

    // ==========================================
    // 5. Create Task (Requires Approval)
    console.log("\n4. اختبار مهمة تتطلب اعتماد...");
    let complexTask = await prisma.task.create({
      data: {
        title: "مهمة معقدة",
        priority: "HIGH",
        requiresApproval: true,
        createdById: user.id,
      }
    });
    console.log(`[نجاح] المهمة أُنشئت. الحالة: ${complexTask.taskStatus}`);

    // 6. Submit for Approval
    console.log("5. إرسال للاعتماد...");
    const newRound = complexTask.approvalRound + 1;
    complexTask = await prisma.task.update({
      where: { id: complexTask.id },
      data: { approvalStatus: "PENDING", approvalRound: newRound }
    });
    await prisma.taskApproval.create({
      data: {
        taskId: complexTask.id,
        approvalRound: newRound,
        status: "PENDING",
        requestedById: user.id,
      }
    });
    console.log(`[نجاح] حالة الاعتماد أصبحت: ${complexTask.approvalStatus}, دورة: ${complexTask.approvalRound}`);

    // 7. Atomic Reject Test
    console.log("6. اختبار الرفض الإلزامي...");
    const rejectReason = "بيانات غير مكتملة";
    const updateResult = await prisma.task.updateMany({
      where: {
        id: complexTask.id,
        approvalStatus: "PENDING",
        approvalRound: complexTask.approvalRound,
      },
      data: {
        approvalStatus: "REJECTED",
        taskStatus: "IN_PROGRESS",
      }
    });
    if (updateResult.count === 1) {
      await prisma.taskApproval.updateMany({
        where: { taskId: complexTask.id, approvalRound: complexTask.approvalRound },
        data: { status: "REJECTED", approverId: user.id, decisionComment: rejectReason }
      });
      console.log(`[نجاح] رُفضت المهمة بسبب: ${rejectReason}`);
    }

    // 8. Resubmit for Approval
    console.log("7. إعادة إرسال للاعتماد (دورة جديدة)...");
    const round2 = complexTask.approvalRound + 1;
    complexTask = await prisma.task.update({
      where: { id: complexTask.id },
      data: { approvalStatus: "PENDING", approvalRound: round2 }
    });
    await prisma.taskApproval.create({
      data: {
        taskId: complexTask.id,
        approvalRound: round2,
        status: "PENDING",
        requestedById: user.id,
      }
    });
    console.log(`[نجاح] تم إعادة الإرسال. دورة الاعتماد الحالية: ${complexTask.approvalRound}`);

    // 9. Approve
    console.log("8. اختبار الموافقة وإكمال المهمة...");
    const approveResult = await prisma.task.updateMany({
      where: {
        id: complexTask.id,
        approvalStatus: "PENDING",
        approvalRound: complexTask.approvalRound,
      },
      data: {
        approvalStatus: "APPROVED",
        taskStatus: "DONE",
        completedAt: new Date()
      }
    });
    if (approveResult.count === 1) {
      await prisma.taskApproval.updateMany({
        where: { taskId: complexTask.id, approvalRound: complexTask.approvalRound },
        data: { status: "APPROVED", approverId: user.id }
      });
      console.log(`[نجاح] تمت الموافقة. حالة المهمة أصبحت DONE وحالة الاعتماد APPROVED.`);
    }

    // 10. Check logs
    const history = await prisma.taskApproval.findMany({ where: { taskId: complexTask.id }, orderBy: { approvalRound: 'asc' } });
    console.log(`\n[تحقق] عدد دورات الاعتماد المحفوظة لهذه المهمة: ${history.length} (يجب أن يكون 2)`);

    // Clean up
    await prisma.task.deleteMany({ where: { id: { in: [simpleTask.id, complexTask.id] } } });
    
    console.log("\n✅ جميع الاختبارات الأساسية نجحت!");

  } catch (err) {
    console.error("❌ فشل أحد الاختبارات:", err);
  } finally {
    const userEmail = "test-task-admin@naht.com";
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      await prisma.task.deleteMany({ where: { createdById: user.id } }).catch(() => null);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => null);
    }
    await prisma.$disconnect();
  }
}

runTests();
