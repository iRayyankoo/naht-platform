import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { units: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
        <Link
          href="/crm/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          إضافة مشروع جديد
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {projects.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              لا توجد مشاريع مضافة حتى الآن.
            </li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <div className="block hover:bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-bold text-xl overflow-hidden relative">
                        {project.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.mainImage} alt={project.name} className="object-cover h-full w-full" />
                        ) : (
                          project.name.charAt(0)
                        )}
                      </div>
                      <div className="ml-4 mr-4">
                        <p className="text-sm font-medium text-primary truncate">
                          {project.name}
                          {project.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                              مميز
                            </span>
                          )}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4 space-x-reverse">
                          <span>{project.city} - {project.neighborhood}</span>
                          <span>&bull;</span>
                          <span>النوع: {project.type}</span>
                          <span>&bull;</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === "AVAILABLE" ? "bg-green-100 text-green-800" :
                            project.status === "SOLD" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {project.status === "AVAILABLE" ? "متاح" : project.status === "SOLD" ? "مباع" : "قريباً"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-sm text-gray-500">
                        {project._count.units} وحدات
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/crm/projects/${project.id}/units`} className="text-secondary hover:text-primary text-sm font-medium">
                          إدارة الوحدات
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href={`/crm/projects/${project.id}/edit`} className="text-secondary hover:text-primary text-sm font-medium">
                          تعديل
                        </Link>
                        {session?.user && (session.user as any).role === "ADMIN" && (
                          <>
                            <span className="text-gray-300">|</span>
                            <form action={async () => {
                              "use server";
                              const { deleteProject } = await import("@/actions/projects");
                              await deleteProject(project.id);
                            }}>
                              <button type="submit" className="text-red-600 hover:text-red-900 text-sm font-medium">حذف</button>
                            </form>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
