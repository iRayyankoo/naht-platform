import { getOrganizationMembers } from "@/actions/org-departments";
import MembersListClient from "./MembersListClient";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const search = resolvedSearchParams.search || "";
  
  const { total, pages, members } = await getOrganizationMembers(page, 10, search);

  const mappedMembers = members.map(m => ({
    id: m.id,
    name: m.name || "",
    email: m.email || "",
    status: m.status,
    memberships: m.memberships
  }));

  return <MembersListClient data={{ total, pages, members: mappedMembers }} currentPage={page} currentSearch={search} />;
}
