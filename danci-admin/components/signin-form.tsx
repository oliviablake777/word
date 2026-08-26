"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Info, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }
    if (password.length < 8) {
      setError("密码至少需要 8 位");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string; code?: string };

      if (!response.ok) {
        if (result.code === "SETUP_REQUIRED") {
          router.replace("/signup");
          router.refresh();
          return;
        }
        setError(result.error || "登录失败，请稍后重试");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-bold tracking-wide text-black">邮箱</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/50" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-none border-black/60 bg-[#fff9dc] pl-10 text-black shadow-none placeholder:text-black/35 focus-visible:border-black focus-visible:ring-black/15"
            aria-invalid={Boolean(error) && !/^\S+@\S+\.\S+$/.test(email)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-bold tracking-wide text-black">密码</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/50" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="请输入登录密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-none border-black/60 bg-[#fff9dc] px-10 text-black shadow-none placeholder:text-black/35 focus-visible:border-black focus-visible:ring-black/15"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 transition hover:text-black"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="h-11 w-full rounded-none border border-black bg-black text-sm font-bold text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:bg-black/85">
        {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {submitting ? "正在登录..." : "登录管理后台"}
      </Button>

      <div className="flex items-start gap-2.5 border border-black/30 bg-[#fff7d3] p-3.5 text-xs leading-5 text-black/55">
        <Info className="mt-0.5 size-4 shrink-0 text-black" />
        <p>登录状态由服务端安全保存，有效期为 7 天。退出登录后当前会话会立即失效。</p>
      </div>
    </form>
  );
}
