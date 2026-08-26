import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.has("ciyu-admin-auth")) redirect("/signin");

  const rawEmail = cookieStore.get("ciyu-admin-email")?.value || "admin@ciyu.cn";
  let email = rawEmail;
  try {
    email = decodeURIComponent(rawEmail);
  } catch {
    email = "admin@ciyu.cn";
  }

  return <DashboardShell email={email}>{children}</DashboardShell>;
}
