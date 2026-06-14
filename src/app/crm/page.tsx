import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">لوحة القيادة</h1>
      </div>

      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">مرحباً بك يا {session?.user?.name}</p>
          <p className="text-sm mt-1 text-center max-w-md">
            تم إعداد بنية لوحة التحكم بنجاح. في المراحل القادمة سيتم إضافة الرسوم البيانية، جداول المشاريع، وإدارة العملاء هنا.
          </p>
        </div>
      </div>
    </div>
  );
}
