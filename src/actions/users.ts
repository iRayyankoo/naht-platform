"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { actionRequireRole } from "@/lib/auth-helpers";

export async function createUser(formData: FormData) {
  await actionRequireRole(["ADMIN"]);

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as any;
  const isActive = formData.get("isActive") === "on";

  if (!email || !password || !name) {
    throw new Error("يجب تعبئة جميع الحقول المطلوبة.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("البريد الإلكتروني مسجل مسبقاً.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      isActive,
    },
  });

  revalidatePath("/crm/users");
}

export async function updateUser(id: string, formData: FormData) {
  await actionRequireRole(["ADMIN"]);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("المستخدم غير موجود");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as any;
  const isActive = formData.get("isActive") === "on";

  // Prevent disabling or downgrading the last ADMIN
  if (user.role === "ADMIN" && (role !== "ADMIN" || !isActive)) {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (adminCount <= 1) {
      throw new Error("لا يمكن تعديل أو تعطيل المسؤول الوحيد المتبقي في النظام.");
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      isActive,
    },
  });

  revalidatePath("/crm/users");
  revalidatePath(`/crm/users/${id}/edit`);
}

export async function resetUserPassword(id: string, formData: FormData) {
  await actionRequireRole(["ADMIN"]);

  const password = formData.get("password") as string;
  if (!password || password.length < 6) {
    throw new Error("يجب أن تكون كلمة المرور 6 أحرف على الأقل.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  revalidatePath(`/crm/users/${id}/edit`);
}
