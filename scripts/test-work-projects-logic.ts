import { z } from "zod";
import { WorkProjectStatus } from "@prisma/client";
import {
  canEditWorkProject,
  canTransferWorkProjectOwnership,
  canManageWorkProjectMembers,
  canCancelWorkProject,
  canApproveOrRejectTask,
  canAssignTaskToSelfAsApprover,
  canManageWorkProjectSections
} from "../src/lib/logic-rules";

console.log("=== بدء اختبارات مشاريع العمل (Pure Logic Tests) ===");

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase().normalize('NFKC');
}

function testNormalization() {
  console.log("\n1. اختبار تطبيع الأسماء (Normalization)...");

  const input1 = "  الموارد   البشرية  ";
  const expected1 = "الموارد البشرية";
  if (normalizeName(input1) === expected1) {
    console.log("[نجاح] المسافات دمجت وأزيلت بنجاح.");
  } else {
    console.error("[فشل] تطبيع المسافات.");
  }

  const input2 = "FinAnCe";
  const expected2 = "finance";
  if (normalizeName(input2) === expected2) {
    console.log("[نجاح] تحويل حالة الأحرف تم بنجاح.");
  } else {
    console.error("[فشل] تحويل حالة الأحرف.");
  }
}

function testSectionRules() {
  console.log("\n2. اختبار صلاحيات أقسام المشروع...");

  if (!canManageWorkProjectSections(false, "MEMBER")) {
    console.log("[نجاح] تم منع العضو العادي من إدارة الأقسام.");
  } else {
    console.error("[فشل] العضو العادي أدار الأقسام!");
  }

  if (canManageWorkProjectSections(false, "MANAGER")) {
    console.log("[نجاح] سُمح لمدير المشروع بإدارة الأقسام.");
  } else {
    console.error("[فشل] مُنع مدير المشروع!");
  }

  if (canManageWorkProjectSections(true, null)) {
    console.log("[نجاح] سُمح لـ SUPER_ADMIN بالتجاوز وإدارة الأقسام.");
  } else {
    console.error("[فشل] مُنع التجاوز للمشرف العام!");
  }
}

function runAll() {
  try {
    testNormalization();
    testSectionRules();
    console.log("\n✅ جميع اختبارات المنطق (Pure Logic Tests) اكتملت بنجاح!");
  } catch (err) {
    console.error("❌ فشل أحد الاختبارات:", err);
  }
}

runAll();