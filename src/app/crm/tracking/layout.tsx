import { requireRole } from "@/lib/auth-helpers";

export default async function TrackingLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN", "MARKETING"]);
  return <>{children}</>;
}
