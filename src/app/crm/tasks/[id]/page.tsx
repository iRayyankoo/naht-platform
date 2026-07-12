import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TaskDetailsClient from "./TaskDetailsClient";
import { checkPermission } from "@/lib/rbac-helpers";

const getTaskStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    TODO: "بانتظار البدء",
    IN_PROGRESS: "قيد التنفيذ",
    DONE: "مكتملة",
    CANCELLED: "ملغاة",
  };
  return map[status] || status;
};

const getApprovalStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    NOT_REQUIRED: "غير مطلوب",
    PENDING: "بانتظار الاعتماد",
    APPROVED: "معتمدة",
    REJECTED: "مرفوضة",
  };
  return map[status] || status;
};

const getEventLabel = (type: string) => {
  const map: Record<string, string> = {
    CREATED: "إنشاء المهمة",
    UPDATED: "تحديث التفاصيل",
    ASSIGNED: "إسناد المهمة",
    IN_PROGRESS: "بدء التنفيذ",
    COMMENT_ADDED: "إضافة تعليق",
    SUBMITTED_FOR_APPROVAL: "إرسال للاعتماد",
    RESUBMITTED: "إعادة إرسال للاعتماد",
    APPROVED: "اعتماد المهمة",
    REJECTED: "رفض المهمة",
    COMPLETED: "إكمال المهمة",
    CANCELLED: "إلغاء المهمة",
  };
  return map[type] || type;
};

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const canView = await checkPermission("tasks.view", "View Task Detail");
  if (!canView) return <div className="p-8 text-center text-red-600 font-bold">غير مصرح لك بعرض هذه المهمة</div>;

  const canApprove = await checkPermission("tasks.approve", "Approve Task");

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      comments: { 
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } }
      },
      approvals: {
        orderBy: { approvalRound: 'desc' },
        include: { approver: { select: { name: true } } }
      },
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { name: true } } }
      }
    }
  });

  if (!task) notFound();

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/crm/tasks" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            العودة للمهام
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>
        <div className="text-left">
          <span className="block text-xs text-gray-500 mb-1 font-bold">أنشئت بواسطة</span>
          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">{task.createdBy.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">الحالة</span>
                <span className="text-sm font-bold text-gray-900">{getTaskStatusLabel(task.taskStatus)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">المسؤول</span>
                <span className="text-sm font-bold text-primary">{task.assignedTo?.name || "غير مسند"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">الأولوية</span>
                <span className="text-sm font-bold text-gray-900">{task.priority}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">حالة الاعتماد</span>
                <span className={`text-sm font-bold ${
                  task.approvalStatus === 'APPROVED' ? 'text-green-600' :
                  task.approvalStatus === 'REJECTED' ? 'text-red-600' :
                  task.approvalStatus === 'PENDING' ? 'text-purple-600' : 'text-gray-900'
                }`}>{getApprovalStatusLabel(task.approvalStatus)}</span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <h3 className="font-bold text-gray-900 mb-2">التفاصيل:</h3>
              <p className="whitespace-pre-wrap leading-relaxed">{task.description || "لا توجد تفاصيل إضافية."}</p>
            </div>
          </div>

          {/* Client Interactive Section (Actions, Comments, Reject Modal) */}
          <TaskDetailsClient task={task} currentUser={session.user} canApprove={canApprove} />

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Approvals History */}
          {task.requiresApproval && task.approvals.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                تاريخ الاعتمادات
              </h3>
              <div className="space-y-4">
                {task.approvals.map((app: any) => (
                  <div key={app.id} className={`p-3 rounded-xl border ${
                    app.status === 'APPROVED' ? 'bg-green-50 border-green-100' :
                    app.status === 'REJECTED' ? 'bg-red-50 border-red-100' :
                    'bg-purple-50 border-purple-100'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-900">دورة {app.approvalRound}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                        app.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                        'bg-purple-200 text-purple-800'
                      }`}>{getApprovalStatusLabel(app.status)}</span>
                    </div>
                    {app.approver && <p className="text-xs text-gray-600">بواسطة: {app.approver.name}</p>}
                    {app.decisionComment && (
                      <p className="text-xs text-red-600 mt-2 font-medium">السبب: {app.decisionComment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log / Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              سجل النشاط
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent pr-4 border-r-2 border-gray-100 max-h-[500px] overflow-y-auto">
              {task.activityLogs.map((log: any) => (
                <div key={log.id} className="relative pl-4">
                  <div className="absolute right-[-21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-gray-900">{getEventLabel(log.eventType)}</p>
                  <p className="text-[10px] text-gray-500">{log.actor.name} - {new Date(log.createdAt).toLocaleString("ar-SA")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
