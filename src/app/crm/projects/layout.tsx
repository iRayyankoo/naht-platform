import { requireRole } from "@/lib/auth-helpers";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN", "MARKETING", "SALES"]);
  return <>{children}</>;
}
