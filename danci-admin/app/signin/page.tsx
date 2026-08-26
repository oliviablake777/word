import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SigninForm } from "@/components/signin-form";
import { getCurrentAdmin, hasAnyAdmin } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

export default async function SigninPage() {
  if (!(await hasAnyAdmin())) redirect("/signup");
  if (await getCurrentAdmin()) redirect("/books");

  return (
    <AuthShell title="欢迎回来" description="使用管理员账号登录，继续维护词屿内容。">
      <SigninForm />
    </AuthShell>
  );
}
