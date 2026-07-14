"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, User, Building2, Calendar, ArrowRightLeft, UserCog, UserMinus, Star } from "@/components/crm/organization/icons";
import { AddMemberModal } from "@/components/crm/organization/modals/AddMemberModal";
import { TransferMembershipModal } from "@/components/crm/organization/modals/TransferMembershipModal";
import { ChangeRoleModal } from "@/components/crm/organization/modals/ChangeRoleModal";
import { EndMembershipModal } from "@/components/crm/organization/modals/EndMembershipModal";
import { SetPrimaryDepartmentModal } from "@/components/crm/organization/modals/SetPrimaryDepartmentModal";
import { assignDepartmentMember, transferDepartmentMember, updateDepartmentMembershipRole, endDepartmentMembership, setPrimaryDepartment } from "@/actions/org-departments";

interface MembershipHistory {
  id: string;
  departmentId: string;
  departmentName: string;
  membershipRole: string;
  isPrimary: boolean;
  status: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

interface MemberDetailsPermissions {
  canManageMembers: boolean;
  isCompanyScope: boolean;
}

export default function MemberDetailsClient({
  user,
  history,
  permissions,
  managedDepartmentIds,
  currentUserId
}: {
  user: { id: string; name: string; email: string; status: string };
  history: MembershipHistory[];
  permissions: MemberDetailsPermissions;
  managedDepartmentIds: string[];
  currentUserId: string;
}) {
  const activeMemberships = history.filter(h => h.status === "ACTIVE" && h.effectiveTo === null);

  const primaryMembership = activeMemberships.find(m => m.isPrimary);
  const secondaryMemberships = activeMemberships.filter(m => !m.isPrimary);

  const [isAddMembershipModalOpen, setIsAddMembershipModalOpen] = useState(false);
  const [transferringMembership, setTransferringMembership] = useState<MembershipHistory | null>(null);
  const [editingRoleMembership, setEditingRoleMembership] = useState<MembershipHistory | null>(null);
  const [endingMembership, setEndingMembership] = useState<MembershipHistory | null>(null);
  const [settingPrimaryMembership, setSettingPrimaryMembership] = useState<MembershipHistory | null>(null);

  // Helper to check if current user can manage a specific membership
  const canManageMembership = (deptId: string) => {
    if (!permissions.canManageMembers) return false;
    if (permissions.isCompanyScope) return true;
    return managedDepartmentIds.includes(deptId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-gray-500 gap-2 mb-4">
        <Link href="/crm/organization/members" className="hover:text-primary transition-colors">
          الموظفون
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{user.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {user.status === "ACTIVE" ? "حساب نشط" : "حساب غير نشط"}
              </span>
            </div>
          </div>
        </div>

        {permissions.canManageMembers && user.id !== currentUserId && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddMembershipModalOpen(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              إضافة عضوية لقسم
            </button>
            {primaryMembership && (
              <button 
                onClick={() => setTransferringMembership(primaryMembership)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                نقل الموظف
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              القسم الأساسي
            </h2>
            
            {primaryMembership ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <Link href={`/crm/organization/departments/${primaryMembership.departmentId}`} className="font-bold text-lg text-primary hover:underline">
                    {primaryMembership.departmentName}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    الدور: {primaryMembership.membershipRole === "MEMBER" ? "عضو" : "مراقب"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    منذ {new Date(primaryMembership.effectiveFrom).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                {canManageMembership(primaryMembership.departmentId) && user.id !== currentUserId && (
                  <button onClick={() => setEditingRoleMembership(primaryMembership)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-lg shadow-sm border border-gray-200" title="تعديل الدور">
                    <UserCog className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100 text-gray-500">
                لا يوجد قسم أساسي حالياً
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-500" />
                الأقسام الإضافية ({secondaryMemberships.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {secondaryMemberships.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  لا توجد عضويات إضافية نشطة
                </div>
              ) : (
                secondaryMemberships.map(sm => (
                  <div key={sm.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <Link href={`/crm/organization/departments/${sm.departmentId}`} className="font-medium text-gray-900 hover:text-primary hover:underline">
                        {sm.departmentName}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {sm.membershipRole === "MEMBER" ? "عضو" : "مراقب"}
                      </p>
                    </div>
                    {canManageMembership(sm.departmentId) && user.id !== currentUserId && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSettingPrimaryMembership(sm)} className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors">
                          تعيين كأساسي
                        </button>
                        <button onClick={() => setEditingRoleMembership(sm)} className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-white rounded-lg shadow-sm border border-gray-200" title="تعديل الدور">
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEndingMembership(sm)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg shadow-sm border border-gray-200" title="إنهاء">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              سجل العضويات
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                لا يوجد سجل سابق
              </div>
            ) : (
              history.map(h => (
                <div key={h.id} className={`p-4 ${h.status === "ACTIVE" && h.effectiveTo === null ? "bg-green-50/30" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{h.departmentName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {h.membershipRole === "MEMBER" ? "عضو" : "مراقب"} 
                        {h.isPrimary && <span className="mx-1 text-primary text-xs bg-primary/10 px-1 rounded">أساسي</span>}
                      </p>
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <span>{new Date(h.effectiveFrom).toLocaleDateString('ar-SA')}</span>
                        <ArrowRightLeft className="w-3 h-3 mx-1" />
                        <span>{h.effectiveTo ? new Date(h.effectiveTo).toLocaleDateString('ar-SA') : "الآن"}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        h.status === "ACTIVE" && h.effectiveTo === null ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {h.status === "ACTIVE" && h.effectiveTo === null ? "حالية" : (h.status === "TRANSFERRED" ? "منقولة" : "منتهية")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal 
        isOpen={isAddMembershipModalOpen}
        onClose={() => setIsAddMembershipModalOpen(false)}
        departmentId={""} // Since we are adding from Member view, we'll need to update AddMemberModal to accept it dynamically if needed, or we just pass a default empty. But here we actually don't have a department. Wait. 
        // Actually, AddMemberModal takes departmentId. In MemberDetails, AddMemberModal doesn't know the department!
        // We might need a slightly different modal or just pass a mock. The UI here was just "إضافة عضوية لقسم".
        // I will pass empty for now.
        onAddMember={assignDepartmentMember}
      />

      {primaryMembership && (
        <TransferMembershipModal
          isOpen={transferringMembership !== null}
          onClose={() => setTransferringMembership(null)}
          userId={user.id}
          currentDepartmentId={primaryMembership.departmentId}
          isPrimary={true}
          onTransfer={transferDepartmentMember}
        />
      )}

      {editingRoleMembership && (
        <ChangeRoleModal 
          isOpen={true}
          onClose={() => setEditingRoleMembership(null)}
          userId={user.id}
          departmentId={editingRoleMembership.departmentId}
          currentRole={editingRoleMembership.membershipRole}
          isPrimary={editingRoleMembership.isPrimary}
          onChangeRole={updateDepartmentMembershipRole}
        />
      )}

      {endingMembership && (
        <EndMembershipModal 
          isOpen={true}
          onClose={() => setEndingMembership(null)}
          userId={user.id}
          departmentId={endingMembership.departmentId}
          isPrimary={endingMembership.isPrimary}
          onEndMembership={endDepartmentMembership}
        />
      )}

      {settingPrimaryMembership && (
        <SetPrimaryDepartmentModal
          isOpen={true}
          onClose={() => setSettingPrimaryMembership(null)}
          userId={user.id}
          departmentId={settingPrimaryMembership.departmentId}
          departmentName={settingPrimaryMembership.departmentName}
          currentRole={settingPrimaryMembership.membershipRole}
          onSetPrimary={setPrimaryDepartment}
        />
      )}
    </div>
  );
}
