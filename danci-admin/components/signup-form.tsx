"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Info, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("姓名至少需要 2 个字符");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("请输入有效的邮箱地址");
    if (password.length < 8) return setError("密码至少需要 8 位");
    if (password !== confirmPassword) return setError("两次输入的密码不一致");

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as { error?: string; code?: string };

      if (!response.ok) {
        if (result.code === "SETUP_COMPLETED") {
          router.replace("/signin");
          router.refresh();
          return;
        }
        setError(result.error || "注册失败，请稍后重试");
        return;
      }

      router.replace("/books");
      router.refresh();
    } catch {
      setError("无法连接服务器，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    { id: "name", label: "姓名", type: "text", placeholder: "请输入系统管理员姓名", value: name, setValue: setName, icon: UserRound, autoComplete: "name" },
    { id: "email", label: "邮箱", type: "email", placeholder: "name@company.com", value: email, setValue: setEmail, icon: Mail, autoComplete: "email" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-xs font-bold tracking-wide text-black">{field.label}</Label>
          <div className="relative">
            <field.icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/50" />
            <Input
              id={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(event) => field.setValue(event.target.value)}
              className="h-11 rounded-none border-black/60 bg-[#fff9dc] pl-10 text-black shadow-none placeholder:text-black/35 focus-visible:border-black focus-visible:ring-black/15"
              required
            />
          </div>
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-xs font-bold tracking-wide text-black">密码</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/50" />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="至少 8 位"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-none border-black/60 bg-[#fff9dc] px-10 text-black placeholder:text-black/35 focus-visible:border-black focus-visible:ring-black/15"
              required
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black" aria-label="切换密码显示">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-xs font-bold tracking-wide text-black">确认密码</Label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="再次输入"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11 rounded-none border-black/60 bg-[#fff9dc] text-black placeholder:text-black/35 focus-visible:border-black focus-visible:ring-black/15"
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-2 border border-black/30 bg-[#fff7d3] p-3 text-xs leading-5 text-black/55">
        <Info className="mt-0.5 size-4 shrink-0 text-black" />
        <span>该入口仅在数据库中没有管理员时开放，注册完成后将永久关闭。</span>
      </div>
      {error && <p role="alert" className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="h-11 w-full rounded-none border border-black bg-black font-bold text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:bg-black/85">
        {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {submitting ? "正在创建账号..." : "创建系统管理员"}
      </Button>
    </form>
  );
}
