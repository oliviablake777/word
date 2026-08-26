"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpenText,
  ChevronRight,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { clearBrowserAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/books", label: "单词书管理", description: "内容与发布", icon: BookOpenText },
  { href: "/admin-users", label: "管理员管理", description: "成员与权限", icon: UsersRound },
];

function SidebarContent({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearBrowserAuth();
    router.replace("/signin");
    router.refresh();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-[78px] shrink-0 items-center gap-3 px-5">
        <BrandMark className="size-9 rounded-[11px]" />
        <div>
          <p className="font-semibold tracking-wide text-white">词屿</p>
          <p className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-white/35">ADMIN CONSOLE</p>
        </div>
      </div>

      <div className="mx-5 h-px bg-white/[0.07]" />

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6" aria-label="后台导航">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">内容管理</p>
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                active ? "bg-white/[0.09] text-white shadow-sm" : "text-white/52 hover:bg-white/[0.05] hover:text-white/85",
              )}
            >
              <span className={cn("grid size-8 place-items-center rounded-lg transition", active ? "bg-primary text-white" : "bg-white/[0.05] text-white/50 group-hover:text-white/80")}>
                <item.icon className="size-[17px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.label}</span>
                <span className="mt-0.5 block text-[10px] text-white/30">{item.description}</span>
              </span>
              {active ? <ChevronRight className="size-3.5 text-white/45" /> : null}
            </Link>
          );
        })}

        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">系统</p>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white/80">
          <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05]"><Settings className="size-[17px]" /></span>
          <span>系统设置</span>
        </button>
      </nav>

      <div className="m-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#ffb8aa] text-sm font-semibold text-[#6d231d]">
            {email.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white">系统管理员</p>
            <p className="mt-1 truncate text-[10px] text-white/35" title={email}>{email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={logout}
            className="text-white/35 hover:bg-white/10 hover:text-white"
            aria-label="退出登录"
            title="退出登录"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = navigation.find((item) => item.href === pathname);

  return (
    <div className="min-h-screen bg-[#f7f7f9] lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] bg-[#191b25] lg:block">
        <SidebarContent email={email} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="关闭导航遮罩" />
          <aside className="relative h-full w-[282px] bg-[#191b25] shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white" aria-label="关闭导航">
              <X className="size-5" />
            </button>
            <SidebarContent email={email} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="打开导航">
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold text-[#22242e]">{current?.label ?? "管理后台"}</p>
              <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">首页 / {current?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative grid size-9 place-items-center rounded-xl border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="通知">
              <Bell className="size-[17px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-white" />
            </button>
            <div className="ml-1 hidden items-center gap-2 rounded-xl border bg-white px-2.5 py-1.5 sm:flex">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground">安全会话</span>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
