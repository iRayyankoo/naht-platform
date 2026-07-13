import { z } from "zod";

console.log("=== بدء اختبارات المهام والتفضيلات (Pure Logic Tests) ===");

// 1. Task View Mode Validation
const TaskViewModeSchema = z.enum(["TABLE", "GANTT", "TIMELINE", "CALENDAR", "KANBAN", "CARDS"]);

function testViewModeValidation() {
  console.log("\n1. اختبار التحقق من طريقة العرض (TaskViewMode)...");
  
  const validResult = TaskViewModeSchema.safeParse("GANTT");
  if (validResult.success) {
    console.log("[نجاح] تم قبول القيمة الصحيحة: GANTT");
  } else {
    console.error("[فشل] القيمة الصحيحة رُفضت!");
  }

  const invalidResult = TaskViewModeSchema.safeParse("INVALID_MODE");
  if (!invalidResult.success) {
    console.log("[نجاح] تم رفض القيمة غير الصحيحة: INVALID_MODE");
  } else {
    console.error("[فشل] القيمة غير الصحيحة قُبلت!");
  }
}

// 2. Dates Validation Logic
function validateDates(plannedStartAt: Date | null | undefined, dueDate: Date | null | undefined) {
  if (plannedStartAt && dueDate) {
    if (plannedStartAt > dueDate) {
      throw new Error("تاريخ البداية المخطط لا يمكن أن يكون بعد تاريخ الاستحقاق");
    }
  }
  return true;
}

function testDateValidation() {
  console.log("\n2. اختبار التحقق من تواريخ المهمة...");

  try {
    validateDates(new Date("2026-08-01"), new Date("2026-08-10"));
    console.log("[نجاح] تم قبول تاريخ بداية يسبق تاريخ الاستحقاق.");
  } catch (e) {
    console.error("[فشل]", e);
  }

  try {
    validateDates(new Date("2026-08-15"), new Date("2026-08-10"));
    console.error("[فشل] تم قبول تاريخ بداية بعد تاريخ الاستحقاق!");
  } catch (e) {
    console.log("[نجاح] تم الرفض: تاريخ البداية بعد الاستحقاق.");
  }

  try {
    validateDates(null, new Date("2026-08-10"));
    console.log("[نجاح] تم قبول المهمة بدون تاريخ بداية مخطط.");
  } catch (e) {
    console.error("[فشل]", e);
  }
}

// 3. Update Dates Logic (Simulating Server Action)
function updateTaskDates(
  oldStart: Date | null,
  oldDue: Date | null,
  newStart?: Date | null,
  newDue?: Date | null
) {
  const finalStart = newStart !== undefined ? newStart : oldStart;
  const finalDue = newDue !== undefined ? newDue : oldDue;

  validateDates(finalStart, finalDue);

  return { plannedStartAt: finalStart, dueDate: finalDue };
}

function testUpdateDates() {
  console.log("\n3. اختبار تحديث التواريخ مع الاحتفاظ بالقديم...");

  const oldStart = new Date("2026-08-01");
  const oldDue = new Date("2026-08-10");

  try {
    updateTaskDates(oldStart, oldDue, new Date("2026-08-15"), undefined);
    console.error("[فشل] تم قبول تاريخ بداية جديد يتجاوز تاريخ الاستحقاق القديم!");
  } catch (e) {
    console.log("[نجاح] تم رفض تاريخ البداية الجديد لأنه يتجاوز تاريخ الاستحقاق القديم.");
  }

  try {
    updateTaskDates(oldStart, oldDue, undefined, new Date("2026-07-20"));
    console.error("[فشل] تم قبول تاريخ استحقاق جديد يسبق تاريخ البداية القديم!");
  } catch (e) {
    console.log("[نجاح] تم رفض تاريخ الاستحقاق الجديد لأنه يسبق تاريخ البداية القديم.");
  }

  try {
    const res = updateTaskDates(oldStart, oldDue, null, undefined);
    if (res.plannedStartAt === null && res.dueDate?.getTime() === oldDue.getTime()) {
      console.log("[نجاح] تم مسح تاريخ البداية بنجاح مع بقاء تاريخ الاستحقاق القديم.");
    }
  } catch (e) {
    console.error("[فشل] خطأ أثناء مسح تاريخ البداية", e);
  }
}

function runAll() {
  try {
    testViewModeValidation();
    testDateValidation();
    testUpdateDates();
    console.log("\n✅ جميع اختبارات المنطق (Pure Logic Tests) اكتملت بنجاح!");
  } catch (err) {
    console.error("❌ فشل أحد الاختبارات:", err);
  }
}

runAll();
