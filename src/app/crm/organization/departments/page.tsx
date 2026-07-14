import { getOrganizationDepartments } from "@/actions/org-departments";
import DepartmentsListClient from "./DepartmentsListClient";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const search = resolvedSearchParams.search || "";
  
  const { total, pages, departments } = await getOrganizationDepartments(page, 10, search);

  const mappedDepartments = departments.map(d => ({
    id: d.id,
    name: d.name,
    code: d.code,
    manager: d.manager ? { id: d.manager.id, name: d.manager.name || "" } : null,
    membersCount: d.membersCount
  }));

  return <DepartmentsListClient data={{ total, pages, departments: mappedDepartments }} currentPage={page} currentSearch={search} />;
}
