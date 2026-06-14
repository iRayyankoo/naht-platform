import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ServiceForm from "./ServiceForm";
import { deleteService } from "@/actions/cms";

export default async function ServicesCMS() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  const services = await prisma.service.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة الخدمات</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">إضافة خدمة جديدة</h2>
            <ServiceForm />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center">
                  {service.title}
                  {!service.isVisible && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">مخفي</span>}
                  <span className="mr-2 text-gray-400 text-sm">#{service.order}</span>
                </h3>
                <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
                {service.slug && <p className="text-xs text-blue-600 mt-2 dir-ltr text-right">/services/{service.slug}</p>}
              </div>
              <form action={async () => {
                "use server";
                await deleteService(service.id);
              }}>
                <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 px-3 py-1 rounded">حذف</button>
              </form>
            </div>
          ))}
          
          {services.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              لا توجد خدمات مضافة حتى الآن.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
