import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
  if ((await cookies()).has("ciyu-admin-auth")) redirect("/books");
  return (
    <AuthShell title="创建管理员账号" description="填写基础信息，注册后即可进入管理后台。">
      <SignupForm />
    </AuthShell>
  );
}
