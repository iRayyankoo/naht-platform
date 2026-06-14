import { requireRole } from "@/lib/auth-helpers";

export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN", "MARKETING"]);
  return <>{children}</>;
}
