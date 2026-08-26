import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { hasAnyAdmin, requireAdmin } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAnyAdmin())) redirect("/signup");
  const admin = await requireAdmin();

  return <DashboardShell admin={admin}>{children}</DashboardShell>;
}
