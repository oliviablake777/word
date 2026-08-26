import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SigninForm } from "@/components/signin-form";

export default async function SigninPage() {
  if ((await cookies()).has("ciyu-admin-auth")) redirect("/books");
  return (
    <AuthShell title="欢迎回来" description="使用管理员账号登录，继续维护词屿内容。">
      <SigninForm />
    </AuthShell>
  );
}
