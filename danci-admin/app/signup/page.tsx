import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { hasAnyAdmin } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await hasAnyAdmin()) redirect("/signin");

  return (
    <AuthShell title="创建系统管理员" description="系统尚未初始化，请创建唯一的系统管理员账号。">
      <SignupForm />
    </AuthShell>
  );
}
