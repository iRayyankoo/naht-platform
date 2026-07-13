import { WorkProjectMemberRole } from "@prisma/client";

export function canEditWorkProject(isSuperAdmin: boolean, userMemberRole?: WorkProjectMemberRole | null) {
  if (isSuperAdmin) return true;
  return userMemberRole === "OWNER" || userMemberRole === "MANAGER";
}

export function canTransferWorkProjectOwnership(isSuperAdmin: boolean, currentOwnerId: string, userId: string) {
  if (isSuperAdmin) return true;
  return currentOwnerId === userId;
}

export function canManageWorkProjectMembers(isSuperAdmin: boolean, userMemberRole?: WorkProjectMemberRole | null) {
  if (isSuperAdmin) return true;
  return userMemberRole === "OWNER" || userMemberRole === "MANAGER";
}

export function canCancelWorkProject(isSuperAdmin: boolean, userMemberRole?: WorkProjectMemberRole | null) {
  if (isSuperAdmin) return true;
  return userMemberRole === "OWNER";
}

export function canApproveOrRejectTask(isSuperAdmin: boolean, designatedApproverId: string | null | undefined, userId: string) {
  if (designatedApproverId && designatedApproverId === userId) return true;
  if (isSuperAdmin) return true;
  return false;
}

export function canAssignTaskToSelfAsApprover(isSuperAdmin: boolean, assigneeId: string, approverId: string) {
  if (assigneeId !== approverId) return true; // not same person
  return isSuperAdmin;
}

export function canManageWorkProjectSections(isSuperAdmin: boolean, userMemberRole?: WorkProjectMemberRole | null) {
  if (isSuperAdmin) return true;
  return userMemberRole === "OWNER" || userMemberRole === "MANAGER";
}
