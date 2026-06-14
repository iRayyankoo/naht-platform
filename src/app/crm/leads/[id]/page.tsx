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

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

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

  // Fetch all sales/marketing users for assignment if admin
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
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center">
              <svg className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {lead.assignedTo?.name || "غير معين"}
            </span>
          </div>
        </div>
        
        {userRole === "ADMIN" && (
          <form action={async () => {
            "use server";
            await deleteLead(lead.id);
          }}>
            <button type="submit" className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium">
              حذف العميل
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Actions & Details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Update */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">تحديث حالة العميل</h3>
            <LeadStatusForm 
              leadId={lead.id} 
              currentStatus={lead.status} 
              statusOptions={statusOptions.map(st => ({ value: st, label: getStatusLabel(st) }))} 
            />
          </div>

          {/* Assignment (Admin Only) */}
          {userRole === "ADMIN" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">تعيين العميل لموظف</h3>
              <LeadAssignForm 
                leadId={lead.id} 
                currentAssignee={lead.assignedToId} 
                users={users} 
              />
            </div>
          )}

          {/* Contact Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">بيانات الاتصال</h3>
            <div className="space-y-4 text-sm">
              <div><span className="text-gray-500 block">الجوال:</span> <a href={`tel:${lead.phone}`} className="font-bold text-primary dir-ltr inline-block">{lead.phone}</a></div>
              <div><span className="text-gray-500 block">البريد:</span> <a href={`mailto:${lead.email}`} className="font-bold text-primary">{lead.email || "غير متوفر"}</a></div>
              <div><span className="text-gray-500 block">التواصل المفضل:</span> <span className="font-medium text-gray-900">{lead.preferredContactMethod || "غير محدد"}</span></div>
              <div><span className="text-gray-500 block">الوقت المفضل:</span> <span className="font-medium text-gray-900">{lead.preferredContactTime || "غير محدد"}</span></div>
            </div>
            <div className="mt-6">
              <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-[#25D366] text-white py-2 rounded-md text-sm font-bold hover:bg-[#1ebd5b]">
                تواصل عبر واتساب
              </a>
            </div>
          </div>
          
        </div>

        {/* Right Column: Lead Info, UTM & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">تفاصيل الطلب</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><span className="text-gray-500 block mb-1">تاريخ التسجيل:</span> <span className="font-medium text-gray-900" dir="ltr">{new Date(lead.createdAt).toLocaleString('ar-SA')}</span></div>
              <div><span className="text-gray-500 block mb-1">المشروع المهتم به:</span> <span className="font-medium text-gray-900">{lead.project?.name || "غير محدد"}</span></div>
              <div><span className="text-gray-500 block mb-1">نوع العقار:</span> <span className="font-medium text-gray-900">{lead.propertyType || "غير محدد"}</span></div>
              <div><span className="text-gray-500 block mb-1">الميزانية التقريبية:</span> <span className="font-medium text-gray-900">{lead.budget || "غير محدد"}</span></div>
              <div><span className="text-gray-500 block mb-1">المدينة:</span> <span className="font-medium text-gray-900">{lead.city || "غير محدد"}</span></div>
              <div><span className="text-gray-500 block mb-1">الحي:</span> <span className="font-medium text-gray-900">{lead.district || "غير محدد"}</span></div>
              <div className="col-span-2">
                <span className="text-gray-500 block mb-1">رسالة العميل:</span> 
                <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-md">{lead.message || "لا توجد رسالة."}</p>
              </div>
            </div>
          </div>

          {/* Tracking & UTM */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">بيانات التتبع (Tracking & UTM)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4 text-xs">
              <div><span className="text-gray-500 block">utm_source</span><span className="font-medium text-gray-900 break-all">{lead.utmSource || "-"}</span></div>
              <div><span className="text-gray-500 block">utm_medium</span><span className="font-medium text-gray-900 break-all">{lead.utmMedium || "-"}</span></div>
              <div><span className="text-gray-500 block">utm_campaign</span><span className="font-medium text-gray-900 break-all">{lead.utmCampaign || "-"}</span></div>
              <div><span className="text-gray-500 block">utm_content</span><span className="font-medium text-gray-900 break-all">{lead.utmContent || "-"}</span></div>
              <div><span className="text-gray-500 block">utm_term</span><span className="font-medium text-gray-900 break-all">{lead.utmTerm || "-"}</span></div>
              <div><span className="text-gray-500 block">Device</span><span className="font-medium text-gray-900 break-all">{lead.deviceType || "-"} / {lead.platform || "-"}</span></div>
              <div className="col-span-2 md:col-span-3"><span className="text-gray-500 block">Landing Page</span><span className="font-medium text-blue-600 break-all underline"><a href={lead.landingPageUrl || "#"} target="_blank">{lead.landingPageUrl || "-"}</a></span></div>
            </div>
          </div>

          {/* Timeline & Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">سجل المتابعة (Timeline)</h3>
            
            {/* Add Note Form */}
            {(userRole === "ADMIN" || userRole === "SALES") && (
              <form action={async (formData: FormData) => {
                "use server";
                await addLeadNote(lead.id, formData.get("noteType") as string, formData.get("content") as string);
              }} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">نوع الإجراء</label>
                    <select name="noteType" required className="w-full border-gray-300 rounded-md p-2 text-sm shadow-sm">
                      <option value="WHATSAPP_SENT">تم إرسال واتساب</option>
                      <option value="DETAILS_SENT">تم إرسال تفاصيل المشروع</option>
                      <option value="VISIT_SCHEDULED">تم تحديد موعد زيارة</option>
                      <option value="VISITED">تمت الزيارة</option>
                      <option value="CONTACT_LATER">العميل طلب التواصل لاحقًا</option>
                      <option value="INTERNAL_NOTE">ملاحظة داخلية</option>
                    </select>
                  </div>
                  <div className="w-2/3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">التفاصيل / الملاحظة</label>
                    <input type="text" name="content" className="w-full border-gray-300 rounded-md p-2 text-sm shadow-sm" placeholder="اكتب ملاحظاتك هنا..." />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-primary-dark">إضافة للـسجل</button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="relative border-r-2 border-gray-200 mr-4 pr-6 space-y-8">
              {lead.notes.length === 0 ? (
                <p className="text-gray-500 text-sm italic">لا توجد ملاحظات أو إجراءات سابقة.</p>
              ) : (
                lead.notes.map(note => (
                  <div key={note.id} className="relative">
                    <span className="absolute -right-[31px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-white"></span>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block bg-primary bg-opacity-10 text-primary text-xs font-bold px-2 py-1 rounded-full mb-1">
                            {getNoteTypeLabel(note.noteType)}
                          </span>
                          <div className="text-xs text-gray-500 font-medium">بواسطة: {note.user?.name || "مجهول"}</div>
                        </div>
                        <div className="text-xs text-gray-400 font-medium" dir="ltr">
                          {new Date(note.createdAt).toLocaleString('ar-SA')}
                        </div>
                      </div>
                      {note.content && (
                        <p className="text-sm text-gray-800 mt-2">{note.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
