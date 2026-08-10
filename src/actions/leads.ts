"use server";

import { revalidatePath } from "next/cache";
import { actionRequireRole } from "@/lib/auth-helpers";
import { leadService, LeadActionResult } from "@/services/lead-service";

export async function updateLeadStatus(
  id: string,
  newStatus: string
): Promise<LeadActionResult> {
  const user = await actionRequireRole(["ADMIN", "SALES"]);
  const result = await leadService.updateLeadStatus(user, id, newStatus);

  if (result.success) {
    revalidatePath(`/crm/leads/${id}`);
    revalidatePath("/crm/leads");
  }
  return result;
}

export async function assignLead(
  id: string,
  assignedToId: string | null
): Promise<LeadActionResult> {
  const user = await actionRequireRole(["ADMIN"]);
  const result = await leadService.assignLead(user, id, assignedToId);

  if (result.success) {
    revalidatePath(`/crm/leads/${id}`);
    revalidatePath("/crm/leads");
  }
  return result;
}

export async function addLeadNote(
  leadId: string,
  noteType: string,
  content: string
): Promise<LeadActionResult> {
  const user = await actionRequireRole(["ADMIN", "SALES"]);
  const result = await leadService.addLeadNote(user, leadId, noteType, content);

  if (result.success) {
    revalidatePath(`/crm/leads/${leadId}`);
    revalidatePath("/crm/leads");
  }
  return result;
}

export async function deleteLead(id: string): Promise<LeadActionResult> {
  const user = await actionRequireRole(["ADMIN"]);
  const result = await leadService.deleteLead(user, id);

  if (result.success) {
    revalidatePath("/crm/leads");
  }
  return result;
}
