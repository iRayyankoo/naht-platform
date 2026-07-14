"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Building2, UserPlus, Shield, UserCog, UserMinus, ShieldAlert } from "lucide-react";
import { AddMemberModal } from "@/components/crm/organization/modals/AddMemberModal";
import { AssignManagerModal } from "@/components/crm/organization/modals/AssignManagerModal";
import { assignDepartmentMember, assignDepartmentManager, removeDepartmentManager, updateDepartmentMembershipRole, endDepartmentMembership } from "@/actions/org-departments";
import { ChangeRoleModal } from "@/components/crm/organization/modals/ChangeRoleModal";
import { EndMembershipModal } from "@/components/crm/organization/modals/EndMembershipModal";

interface DepartmentDetailsData {
  id: string;
  name: string;
  code: string;
  manager: { id: string; name: string } | null;
  members: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    isPrimary: boolean;
    membershipRole: string;
    status: string;
  }[];
}

interface DepartmentPermissions {
  canAssign: boolean;
  canAssignManager: boolean;
  canManageMembers: boolean;
}

export default function DepartmentDetailsClient({ 
  data, 
  permissions,
  currentUserId 
}: { 
  data: DepartmentDetailsData; 
  permissions: DepartmentPermissions;
  currentUserId: string;
}) {
  const [isAssignManagerModalOpen, setIsAssignManagerModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentDetailsData["members"][0] | null>(null);
  const [endingMember, setEndingMember] = useState<DepartmentDetailsData["members"][0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-gray-500 gap-2 mb-4">
        <Link href="/crm/organization/departments" className="hover:text-primary transition-colors">
          الأقسام
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{data.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <p className="text-gray-500 mt-1">الرمز: {data.code}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">أعضاء القسم ({data.members.length})</h2>
              {permissions.canAssign && (
                <button 
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  إضافة عضو
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-900">الاسم</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-900">الدور</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-900">النوع</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-900">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        لا يوجد أعضاء في هذا القسم
                      </td>
                    </tr>
                  ) : (
                    data.members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/crm/organization/members/${member.userId}`} className="font-medium text-primary hover:underline">
                            {member.userName}
                          </Link>
                          <div className="text-sm text-gray-500">{member.userEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          {member.membershipRole === "OBSERVER" ? (
                            <span className="text-gray-600">مراقب</span>
                          ) : (
                            <span className="font-medium text-gray-900">عضو</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {member.isPrimary ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              أساسي
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              إضافي
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {member.status === "ACTIVE" ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {permissions.canManageMembers && member.userId !== currentUserId && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingMember(member)} className="p-1 text-gray-400 hover:text-primary transition-colors" title="تغيير الدور">
                                <UserCog className="w-4 h-4" />
                              </button>
                              {!member.isPrimary && (
                                <button onClick={() => setEndingMember(member)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="إنهاء العضوية">
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              مدير القسم
            </h3>
            
            {data.manager ? (
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/crm/organization/members/${data.manager.id}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                    {data.manager.name}
                  </Link>
                </div>
                {permissions.canAssignManager && (
                  <button 
                    onClick={() => setIsAssignManagerModalOpen(true)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    تغيير
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-600">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="font-medium text-sm">لا يوجد مدير</span>
                </div>
                {permissions.canAssignManager && (
                  <button 
                    onClick={() => setIsAssignManagerModalOpen(true)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    تعيين مدير
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignManagerModal 
        isOpen={isAssignManagerModalOpen}
        onClose={() => setIsAssignManagerModalOpen(false)}
        departmentId={data.id}
        currentManagerId={data.manager?.id}
        onAssignManager={assignDepartmentManager}
        onRemoveManager={removeDepartmentManager}
      />

      <AddMemberModal 
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        departmentId={data.id}
        onAddMember={assignDepartmentMember}
      />

      {editingMember && (
        <ChangeRoleModal 
          isOpen={true}
          onClose={() => setEditingMember(null)}
          userId={editingMember.userId}
          departmentId={data.id}
          currentRole={editingMember.membershipRole}
          isPrimary={editingMember.isPrimary}
          onChangeRole={updateDepartmentMembershipRole}
        />
      )}

      {endingMember && (
        <EndMembershipModal 
          isOpen={true}
          onClose={() => setEndingMember(null)}
          userId={endingMember.userId}
          departmentId={data.id}
          isPrimary={endingMember.isPrimary}
          onEndMembership={endDepartmentMembership}
        />
      )}
    </div>
  );
}
