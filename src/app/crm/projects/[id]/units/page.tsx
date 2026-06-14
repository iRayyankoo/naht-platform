import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createUnit, deleteUnit, updateUnitStatus, toggleUnitVisibility } from "@/actions/units";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProjectUnitsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const canEdit = userRole === "ADMIN" || userRole === "MARKETING";

  const project = await prisma.project.findUnique({
    where: { id: id },
    include: { units: { orderBy: { createdAt: "desc" } } },
  });

  if (!project) return <div>المشروع غير موجود</div>;

  const handleCreate = async (formData: FormData) => {
    "use server";
    await createUnit(project.id, formData);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          إدارة الوحدات - {project.name}
        </h1>
        <Link href="/crm/projects" className="text-sm text-gray-500 hover:text-gray-900">
          العودة للمشاريع
        </Link>
      </div>

      {canEdit && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">إضافة وحدة جديدة</h2>
          <form action={handleCreate} className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-7 items-end">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">رقم الوحدة</label>
              <input type="text" name="unitNum" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">النوع</label>
              <input type="text" name="type" placeholder="شقة/فيلا" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">المساحة</label>
              <input type="number" name="area" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">الغرف</label>
              <input type="number" name="rooms" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">الحالة</label>
              <select name="status" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2">
                <option value="AVAILABLE">متاحة</option>
                <option value="SOLD">مباعة</option>
                <option value="RESERVED">محجوزة</option>
              </select>
            </div>
            <div className="sm:col-span-1 flex items-center h-full pb-2">
              <input type="checkbox" name="isVisible" value="true" defaultChecked className="h-4 w-4 text-primary border-gray-300 rounded mr-2" />
              <label className="mr-2 text-sm text-gray-700">مرئية</label>
            </div>
            <div className="sm:col-span-1">
              <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                إضافة
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الوحدة</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المساحة</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الغرف</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرؤية</th>
              {canEdit && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {project.units.map((unit) => (
              <tr key={unit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.unitNum}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.area} م²</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.rooms}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {canEdit ? (
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateUnitStatus(unit.id, project.id, formData.get("status") as string);
                    }} className="flex items-center space-x-2 space-x-reverse">
                      <select name="status" defaultValue={unit.status} className="text-sm border-gray-300 rounded-md border p-1">
                        <option value="AVAILABLE">متاحة</option>
                        <option value="SOLD">مباعة</option>
                        <option value="RESERVED">محجوزة</option>
                      </select>
                      <button type="submit" className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">حفظ</button>
                    </form>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                      unit.status === 'SOLD' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {unit.status === 'AVAILABLE' ? 'متاحة' : unit.status === 'SOLD' ? 'مباعة' : 'محجوزة'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {canEdit ? (
                    <form action={async () => {
                      "use server";
                      await toggleUnitVisibility(unit.id, project.id, !unit.isVisible);
                    }}>
                      <button type="submit" className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${unit.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {unit.isVisible ? 'ظاهرة' : 'مخفية'}
                      </button>
                    </form>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${unit.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {unit.isVisible ? 'ظاهرة' : 'مخفية'}
                    </span>
                  )}
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2 space-x-reverse">
                    {userRole === "ADMIN" && (
                      <form action={async () => {
                        "use server";
                        await deleteUnit(unit.id, project.id);
                      }}>
                        <button type="submit" className="text-red-600 hover:text-red-900">حذف</button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {project.units.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-6 py-10 text-center text-gray-500 text-sm">
                  لا توجد وحدات في هذا المشروع.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
