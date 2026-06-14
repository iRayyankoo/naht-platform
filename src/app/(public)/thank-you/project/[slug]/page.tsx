import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProjectThankYouPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const project = await prisma.project.findUnique({
    where: { slug }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary bg-opacity-10">
          <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">طلبك قيد المعالجة!</h2>
        <p className="mt-2 text-sm text-gray-600">
          شكراً لاهتمامك بمشروع <span className="font-bold text-primary">{project?.name || "نحت العقارية"}</span>. تم إرسال بياناتك لفريق المبيعات وسنتواصل معك قريباً لتزويدك بكافة التفاصيل.
        </p>
        <div className="mt-8 space-y-4">
          <Link href={`/projects/${slug}`} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            العودة للمشروع
          </Link>
          <Link href="/projects" className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            استعراض مشاريع أخرى
          </Link>
        </div>
      </div>
    </div>
  );
}
