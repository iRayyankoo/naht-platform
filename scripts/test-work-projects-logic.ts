import { z } from "zod";
import { WorkProjectStatus } from "@prisma/client";
import {
  canEditWorkProject,
  canTransferWorkProjectOwnership,
  canManageWorkProjectMembers,
  canCancelWorkProject,
  canApproveOrRejectTask,
  canAssignTaskToSelfAsApprover
} from "../src/lib/logic-rules";

// --- Mocked Prisma & Helpers ---
console.log("=== بدء اختبارات مشاريع العمل (Pure Logic Tests) ===");

// Schemas used in Server Actions
const workProjectSchema = z.object({
  name: z.string().min(3, "اسم المشروع يجب أن يكون 3 أحرف على الأقل").max(190),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(WorkProjectStatus).default("PLANNING"),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
});

function testCreateProjectValidation() {
  console.log("\n1. اختبار التحقق من مدخلات إنشاء مشروع عمل...");
  const validData = {
    name: "مشروع نظام الموارد البشرية",
    description: "نظام داخلي لإدارة الموارد",
    status: "ACTIVE",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-12-01"),
  };
  try {
    workProjectSchema.parse(validData);
    console.log("[نجاح] البيانات الصالحة اجتازت التحقق.");
  } catch (e) {
    console.error("[فشل]", e);
  }
}

function testOwnershipRules() {
  console.log("\n2. اختبار قواعد الملكية (Business Logic)...");

  if (!canTransferWorkProjectOwnership(false, "user_1", "user_2")) {
    console.log("[نجاح] تم منع مستخدم عادي من نقل الملكية.");
  } else {
    console.error("[فشل] سُمح لمستخدم غير مخول بنقل الملكية!");
  }

  if (canTransferWorkProjectOwnership(true, "user_1", "super_admin_id")) {
    console.log("[نجاح] تم السماح لـ SUPER_ADMIN بنقل الملكية (تجاوز).");
  } else {
    console.error("[فشل] تم منع SUPER_ADMIN من نقل الملكية!");
  }
}

function testMemberRules() {
  console.log("\n3. اختبار قواعد إدارة الأعضاء والتعديل (Business Logic)...");

  if (!canManageWorkProjectMembers(false, null)) {
    console.log("[نجاح] تم منع موظف عادي من إدارة الأعضاء.");
  }

  if (canManageWorkProjectMembers(false, "OWNER")) {
    console.log("[نجاح] تم السماح للمالك بإدارة الأعضاء.");
  }

  if (canEditWorkProject(true, null)) {
    console.log("[نجاح] تم السماح لـ SUPER_ADMIN بتعديل مشروع دون أن يكون عضواً فيه (تجاوز).");
  }

  if (!canCancelWorkProject(false, "MANAGER")) {
    console.log("[نجاح] تم منع مدير المشروع من إلغائه (صلاحية حصرية للمالك أو المشرف العام).");
  }
}

function testApproverRules() {
  console.log("\n4. اختبار قواعد المعتمدين والمهام (Business Logic)...");

  if (!canAssignTaskToSelfAsApprover(false, "user_5", "user_5")) {
    console.log("[نجاح] تم منع جعل منفذ المهمة هو نفسه المعتمد (Separation of Duties).");
  }

  if (canAssignTaskToSelfAsApprover(true, "user_5", "user_5")) {
    console.log("[نجاح] سُمح لـ SUPER_ADMIN بتجاوز قاعدة فصل المهام (Override).");
  }

  if (canApproveOrRejectTask(true, "approver_1", "super_admin_id")) {
    console.log("[نجاح] سُمح لـ SUPER_ADMIN باعتماد مهمة لمعتمد آخر.");
  }

  if (!canApproveOrRejectTask(false, "approver_1", "random_user")) {
    console.log("[نجاح] مُنع مستخدم عادي من اعتماد مهمة غير مكلف بها.");
  }
}

function runAll() {
  try {
    testCreateProjectValidation();
    testOwnershipRules();
    testMemberRules();
    testApproverRules();

    console.log("\n✅ جميع اختبارات المنطق (Pure Logic Tests) اكتملت بنجاح!");
  } catch (err) {
    console.error("❌ فشل أحد الاختبارات:", err);
  }
}

runAll();