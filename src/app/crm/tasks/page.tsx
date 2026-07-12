import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FilterBar from "@/components/crm/FilterBar";
import { checkPermission } from "@/lib/rbac-helpers";

// Helper for Arabic translation
const getTaskStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    TODO: "بانتظار البدء",
    IN_PROGRESS: "قيد التنفيذ",
    DONE: "مكتملة",
    CANCELLED: "ملغاة",
  };
  return map[status] || status;
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    LOW: "عادية",
    MEDIUM: "متوسطة",
    HIGH: "عالية",
  };
  return map[priority] || priority;
};

export default async function TasksPage({ searchParams }: { searchParams: { status?: string, priority?: string, assignee?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const canView = await checkPermission("tasks.view", "View Tasks List");
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-red-600 mb-2">ليس لديك صلاحية لعرض المهام</h3>
      </div>
    );
  }

  const params = await Promise.resolve(searchParams);
  const statusFilter = typeof params.status === 'string' ? params.status : (Array.isArray(params.status) ? params.status[0] : undefined);
  const priorityFilter = typeof params.priority === 'string' ? params.priority : (Array.isArray(params.priority) ? params.priority[0] : undefined);
  const assigneeFilter = typeof params.assignee === 'string' ? params.assignee : (Array.isArray(params.assignee) ? params.assignee[0] : undefined);

  const tasks = await prisma.task.findMany({
    where: {
      ...(statusFilter && { taskStatus: statusFilter }),
      ...(priorityFilter && { priority: priorityFilter }),
      ...(assigneeFilter && { assignedToId: assigneeFilter }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } }
    },
  });

  const allUsersForFilter = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true }
  });

  const filterFields = [
    {
      key: "status",
      label: "الحالة",
      options: [
        { value: "TODO", label: "بانتظار البدء" },
        { value: "IN_PROGRESS", label: "قيد التنفيذ" },
        { value: "DONE", label: "مكتملة" },
        { value: "CANCELLED", label: "ملغاة" },
      ]
    },
    {
      key: "priority",
      label: "الأولوية",
      options: [
        { value: "HIGH", label: "عالية" },
        { value: "MEDIUM", label: "متوسطة" },
        { value: "LOW", label: "عادية" }
      ]
    },
    {
      key: "assignee",
      label: "المسؤول",
      options: allUsersForFilter.filter(u => u.name).map(u => ({ value: u.id, label: u.name || "غير معروف" }))
    }
  ];

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة المهام</h1>
          <p className="text-sm text-gray-500 mt-1">تتبع المهام ومسؤوليات فريق العمل والاعتمادات</p>
        </div>
        <Link
          href="/crm/tasks/new"
          className="inline-flex items-center px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm"
        >
          إنشاء مهمة جديدة
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar fields={filterFields} />

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="text-gray-300 text-6xl mb-4">📋</div>
           <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مهام مطابقة</h3>
           <p className="text-gray-500 text-sm max-w-md">جرّب تغيير الفلاتر المحددة أعلاه، أو قم بإنشاء مهمة جديدة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
             <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3 gap-3">
                   <Link href={`/crm/tasks/${task.id}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-tight">
                     {task.title}
                   </Link>
                   <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${
                      task.priority === "HIGH" ? "bg-red-50 text-red-600 border border-red-100" :
                      task.priority === "MEDIUM" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                   }`}>
                     {getPriorityLabel(task.priority)}
                   </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{task.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-5 mt-auto pt-4 border-t border-gray-50">
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">الحالة</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                         task.taskStatus === "DONE" ? "text-green-600" :
                         task.taskStatus === "IN_PROGRESS" ? "text-blue-600" :
                         task.taskStatus === "CANCELLED" ? "text-gray-500" : "text-gray-700"
                      }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${
                           task.taskStatus === "DONE" ? "bg-green-500" :
                           task.taskStatus === "IN_PROGRESS" ? "bg-blue-500" :
                           task.taskStatus === "CANCELLED" ? "bg-gray-400" : "bg-gray-400"
                         }`}></span>
                         {getTaskStatusLabel(task.taskStatus)}
                      </span>
                   </div>
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">المسؤول</span>
                      <span className="block text-xs font-bold text-gray-700 truncate">
                         {task.assignedTo?.name || "غير مسند"}
                      </span>
                   </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50/50 p-2.5 rounded-lg">
                   <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      {task._count.comments} تعليق
                   </div>
                   <Link href={`/crm/tasks/${task.id}`} className="text-primary font-bold hover:underline">
                      عرض التفاصيل
                   </Link>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
