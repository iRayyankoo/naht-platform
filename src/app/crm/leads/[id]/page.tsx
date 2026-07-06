import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { deleteLead, addLeadNote } from "@/actions/leads";
import LeadStatusForm from "./LeadStatusForm";
import LeadAssignForm from "./LeadAssignForm";

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      project: true,
      assignedTo: true,
      notes: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead) notFound();

  if (userRole === "SALES" && lead.assignedToId !== userId && lead.assignedToId !== null) {
    redirect("/crm/leads");
  } else if (userRole !== "ADMIN" && userRole !== "MARKETING" && userRole !== "SALES") {
    redirect("/crm");
  }



  let users: any[] = [];
  if (userRole === "ADMIN") {
    users = await prisma.user.findMany({
      where: { role: { in: ["SALES", "MARKETING", "ADMIN"] } },
      select: { id: true, name: true, role: true },
    });
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      "NEW": "جديد",
      "CONTACTED": "تم التواصل",
      "NO_ANSWER": "لم يتم الرد",
      "INTERESTED": "مهتم",
      "DETAILS_SENT": "تم إرسال التفاصيل",
      "VISIT_SCHEDULED": "تم جدولة زيارة",
      "VISIT_DONE": "تمت الزيارة",
      "NEGOTIATION": "تفاوض",
      "SOLD": "تم البيع",
      "LOST": "خاسر",
      "UNQUALIFIED": "غير مؤهل",
      "DUPLICATE": "مكرر",
      "POSTPONED": "مؤجل",
    };
    return map[status] || status;
  };

  const statusOptions = Object.keys({
    NEW:1, CONTACTED:1, NO_ANSWER:1, INTERESTED:1, DETAILS_SENT:1, VISIT_SCHEDULED:1, VISIT_DONE:1, NEGOTIATION:1, SOLD:1, LOST:1, UNQUALIFIED:1, DUPLICATE:1, POSTPONED:1
  });

  const getNoteTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      "WHATSAPP_SENT": "تم إرسال واتساب",
      "DETAILS_SENT": "تم إرسال تفاصيل المشروع",
      "VISIT_SCHEDULED": "تم تحديد موعد زيارة",
      "VISITED": "تمت الزيارة",
      "CONTACT_LATER": "العميل طلب التواصل لاحقًا",
      "INTERNAL_NOTE": "ملاحظة داخلية",
    };
    return map[type] || type;
  };

  // --- Timeline Logic ---
  const pipelineStages = [
    { id: "NEW", label: "عميل جديد" },
    { id: "CONTACTED", label: "تم التواصل" },
    { id: "INTERESTED", label: "مهتم" },
    { id: "DETAILS_SENT", label: "إرسال التفاصيل" },
    { id: "VISIT_SCHEDULED", label: "زيارة مجدولة" },
    { id: "VISIT_DONE", label: "تمت الزيارة" },
    { id: "NEGOTIATION", label: "تفاوض" }
  ];

  const getStageDate = (stageId: string) => {
    if (stageId === "NEW") return lead.createdAt;
    const ascNotes = [...lead.notes].reverse();
    if (stageId === "CONTACTED") return ascNotes.find(n => n.noteType === "WHATSAPP_SENT")?.createdAt;
    if (stageId === "DETAILS_SENT") return ascNotes.find(n => n.noteType === "DETAILS_SENT")?.createdAt;
    if (stageId === "VISIT_SCHEDULED") return ascNotes.find(n => n.noteType === "VISIT_SCHEDULED")?.createdAt;
    if (stageId === "VISIT_DONE") return ascNotes.find(n => n.noteType === "VISITED")?.createdAt;
    return null;
  };

  let currentIndex = pipelineStages.findIndex(s => s.id === lead.status);
  let isEndState = false;
  let endStateLabel = "";
  let endStateColor = "bg-gray-100 text-gray-500 border-gray-200";

  if (currentIndex === -1) {
    if (["SOLD", "LOST", "UNQUALIFIED", "DUPLICATE", "POSTPONED"].includes(lead.status)) {
      isEndState = true;
      currentIndex = pipelineStages.length;
      endStateLabel = getStatusLabel(lead.status);
      if (lead.status === "SOLD") endStateColor = "bg-green-100 text-green-700 border-green-500";
      else endStateColor = "bg-red-100 text-red-700 border-red-500";
    } else if (lead.status === "NO_ANSWER") {
      currentIndex = 0; // Treated conceptually similar to NEW in pipeline
    }
  }

  // --- Activity Log Logic ---
  const activities = [
    {
      id: "creation",
      title: "تم إنشاء العميل",
      desc: lead.message ? `رسالة: ${lead.message}` : null,
      user: "النظام",
      date: lead.createdAt,
      type: "SYSTEM"
    },
    ...lead.notes.map(n => ({
      id: n.id,
      title: getNoteTypeLabel(n.noteType),
      desc: n.content,
      user: n.user?.name || "مجهول",
      date: n.createdAt,
      type: "NOTE"
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link href="/crm/leads" className="text-gray-500 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm border border-gray-100">
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <div className="flex items-center space-x-3 space-x-reverse">
            <h1 className="text-2xl font-bold text-gray-900">ملف العميل: {lead.name}</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-bold rounded-full border border-gray-200">
              {getStatusLabel(lead.status)}
            </span>
          </div>
        </div>
        
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Summary Card & Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">ملخص العميل</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">الجوال:</span> <a href={`tel:${lead.phone}`} className="font-bold text-primary dir-ltr">{lead.phone}</a></div>
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">البريد:</span> <a href={`mailto:${lead.email}`} className="font-medium text-gray-900">{lead.email || "-"}</a></div>
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">المشروع:</span> <span className="font-medium text-gray-900">{lead.project?.name || "-"}</span></div>
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">الحالة:</span> <span className="font-bold text-gray-900">{getStatusLabel(lead.status)}</span></div>
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">المسؤول:</span> <span className="font-medium text-gray-900">{lead.assignedTo?.name || "غير معين"}</span></div>
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">المصدر:</span> <span className="font-medium text-gray-900">{lead.utmSource || lead.source || "-"}</span></div>
              <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">تاريخ التسجيل:</span> <span className="font-medium text-gray-900" dir="ltr">{new Date(lead.createdAt).toLocaleDateString('ar-SA')}</span></div>
            </div>
            <div className="mt-6 space-y-2">
              <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-[#25D366] text-white py-2 rounded-md text-sm font-bold hover:bg-[#1ebd5b]">
                مراسلة واتساب
              </a>
              <a href={`tel:${lead.phone}`} className="w-full block text-center bg-gray-100 text-gray-800 py-2 rounded-md text-sm font-bold hover:bg-gray-200">
                اتصال
              </a>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">تحديث الحالة</h3>
            <LeadStatusForm 
              leadId={lead.id} 
              currentStatus={lead.status} 
              statusOptions={statusOptions.map(st => ({ value: st, label: getStatusLabel(st) }))} 
            />
          </div>

          {/* Assignment (Admin Only) */}
          {userRole === "ADMIN" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">تعيين موظف</h3>
              <LeadAssignForm 
                leadId={lead.id} 
                currentAssignee={lead.assignedToId} 
                users={users} 
              />
            </div>
          )}
          
        </div>

        {/* Right Column: Timeline, Info & Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lead Progress Journey (Timeline) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6">مسار العميل</h3>
            <div className="relative">
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex items-start min-w-max px-2">
                  {pipelineStages.map((stage, idx) => {
                    const isCompleted = currentIndex > idx;
                    const isCurrent = currentIndex === idx && !isEndState;
                    const isFuture = currentIndex < idx && !isEndState;
                    const stageDate = getStageDate(stage.id);

                    return (
                      <div key={stage.id} className="relative flex flex-col items-center w-32 shrink-0">
                        {/* Connecting Line */}
                        {idx !== pipelineStages.length - 1 && (
                          <div className={`absolute top-4 rtl:right-1/2 rtl:left-[-50%] ltr:left-1/2 ltr:right-[-50%] w-full h-[2px] ${
                            isCompleted ? "bg-primary" : "bg-gray-200"
                          }`} style={{ zIndex: 0 }}></div>
                        )}
                        
                        {/* Circle */}
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white ${
                          isCompleted ? "border-primary text-primary" : 
                          isCurrent ? "border-primary ring-4 ring-primary/20 text-primary" : 
                          "border-gray-200 text-gray-300"
                        }`}>
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Label */}
                        <div className="mt-3 text-center">
                          <p className={`text-xs font-bold ${isCurrent || isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                            {stage.label}
                          </p>
                          {stageDate && (
                            <p className="text-[10px] text-gray-500 mt-1" dir="ltr">
                              {stageDate.toLocaleDateString('ar-SA')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* End State Node (if applicable) */}
                  {isEndState && (
                    <div className="relative flex flex-col items-center w-32 shrink-0">
                       <div className={`absolute top-4 rtl:right-[50%] rtl:w-[50%] h-[2px] bg-primary`} style={{ zIndex: 0 }}></div>
                       <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${endStateColor}`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                       </div>
                       <div className="mt-3 text-center">
                          <p className={`text-xs font-bold text-gray-900`}>{endStateLabel}</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Marketing & UTM Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">معلومات التسويق (Marketing & UTM)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 text-xs">
              <div><span className="text-gray-500 block mb-1">Source</span><span className="font-medium text-gray-900">{lead.utmSource || "-"}</span></div>
              <div><span className="text-gray-500 block mb-1">Medium</span><span className="font-medium text-gray-900">{lead.utmMedium || "-"}</span></div>
              <div><span className="text-gray-500 block mb-1">Campaign</span><span className="font-medium text-gray-900">{lead.utmCampaign || "-"}</span></div>
              <div><span className="text-gray-500 block mb-1">Term / Content</span><span className="font-medium text-gray-900">{lead.utmTerm || lead.utmContent || "-"}</span></div>
              <div><span className="text-gray-500 block mb-1">Device Type</span><span className="font-medium text-gray-900">{lead.deviceType || "-"}</span></div>
              <div className="col-span-3"><span className="text-gray-500 block mb-1">Landing Page</span><span className="font-medium text-blue-600 underline"><a href={lead.landingPageUrl || "#"} target="_blank">{lead.landingPageUrl || "-"}</a></span></div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">سجل النشاطات</h3>
            
            {/* Add Note Form */}
            {(userRole === "ADMIN" || userRole === "SALES") && (
              <form action={async (formData: FormData) => {
                "use server";
                await addLeadNote(lead.id, formData.get("noteType") as string, formData.get("content") as string);
              }} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-800 mb-3">إضافة ملاحظة جديدة</h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/3">
                    <select name="noteType" required className="w-full border-gray-300 rounded-md p-2 text-sm shadow-sm">
                      <option value="WHATSAPP_SENT">تم إرسال واتساب</option>
                      <option value="DETAILS_SENT">تم إرسال تفاصيل المشروع</option>
                      <option value="VISIT_SCHEDULED">تم تحديد موعد زيارة</option>
                      <option value="VISITED">تمت الزيارة</option>
                      <option value="CONTACT_LATER">العميل طلب التواصل لاحقًا</option>
                      <option value="INTERNAL_NOTE">ملاحظة داخلية</option>
                    </select>
                  </div>
                  <div className="w-full md:w-2/3 flex gap-2">
                    <input type="text" name="content" className="flex-1 border-gray-300 rounded-md p-2 text-sm shadow-sm" placeholder="اكتب الملاحظات أو التفاصيل..." />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-primary-dark whitespace-nowrap">
                      حفظ
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Timeline List */}
            <div className="relative border-r-2 border-gray-100 mr-3 pr-6 space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="relative">
                  {/* Timeline dot */}
                  <span className={`absolute -right-[31px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${
                    activity.type === "SYSTEM" ? "bg-gray-400" : "bg-primary"
                  }`}></span>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{activity.title}</h5>
                      <span className="text-xs text-gray-500 font-medium">بواسطة: {activity.user}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap" dir="ltr">
                      {activity.date.toLocaleString('ar-SA')}
                    </span>
                  </div>
                  {activity.desc && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 mt-2">
                      {activity.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
          </div>

        </div>
      </div>

      {/* ── Advanced Actions (Admin Only) ─────────────────────────────── */}
      {userRole === "ADMIN" && (
        <div className="mt-8 border border-red-100 rounded-xl p-5 bg-red-50/40">
          <h3 className="text-sm font-bold text-red-700 mb-1">إجراءات متقدمة</h3>
          <p className="text-xs text-red-500 mb-4">استخدم هذا الخيار فقط عند الحاجة. لا يمكن التراجع عن الحذف.</p>
          <form action={async () => {
            "use server";
            await deleteLead(lead.id);
          }}>
            <button
              type="submit"
              className="text-sm border border-red-300 text-red-600 hover:bg-red-100 bg-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              حذف العميل
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
