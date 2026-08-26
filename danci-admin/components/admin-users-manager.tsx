"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Crown,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminStatus = "正常" | "已停用";
type AdminRole = "超级管理员" | "内容管理员" | "只读成员";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin: string;
  joined: string;
  color: string;
};

const initialAdmins: AdminUser[] = [
  { id: 1, name: "林墨", email: "admin@ciyu.cn", role: "超级管理员", status: "正常", lastLogin: "刚刚", joined: "2025.03.12", color: "bg-[#ffddd5] text-[#a8392d]" },
  { id: 2, name: "陈晓舟", email: "xiaozhou@ciyu.cn", role: "内容管理员", status: "正常", lastLogin: "今天 09:42", joined: "2025.08.20", color: "bg-[#dfe8ff] text-[#4a64a5]" },
  { id: 3, name: "顾青", email: "guqing@ciyu.cn", role: "内容管理员", status: "正常", lastLogin: "昨天 18:06", joined: "2026.01.05", color: "bg-[#dcf2e8] text-[#26715b]" },
  { id: 4, name: "周屿", email: "zhouyu@ciyu.cn", role: "只读成员", status: "正常", lastLogin: "8月22日", joined: "2026.04.16", color: "bg-[#eee3f8] text-[#7b4b9d]" },
  { id: 5, name: "苏禾", email: "suhe@ciyu.cn", role: "只读成员", status: "已停用", lastLogin: "7月30日", joined: "2026.05.08", color: "bg-[#f2f0eb] text-[#766d5c]" },
];

const emptyDraft = { name: "", email: "", role: "内容管理员" as AdminRole, status: "正常" as AdminStatus };

export function AdminUsersManager() {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("全部角色");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = localStorage.getItem("ciyu-admin-users");
      if (saved) {
        try { setAdmins(JSON.parse(saved)); } catch { /* keep starter data */ }
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("ciyu-admin-users", JSON.stringify(admins));
  }, [admins, hydrated]);

  const filteredAdmins = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesQuery = !keyword || `${admin.name}${admin.email}`.toLowerCase().includes(keyword);
      const matchesRole = roleFilter === "全部角色" || admin.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [admins, query, roleFilter]);

  function openCreate() {
    setEditingAdmin(null);
    setDraft(emptyDraft);
    setDialogOpen(true);
  }

  function openEdit(admin: AdminUser) {
    setEditingAdmin(admin);
    setDraft({ name: admin.name, email: admin.email, role: admin.role, status: admin.status });
    setDialogOpen(true);
  }

  function saveAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(draft.email)) return;
    if (editingAdmin) {
      setAdmins((current) => current.map((admin) => admin.id === editingAdmin.id ? { ...admin, ...draft, name: draft.name.trim(), email: draft.email.trim() } : admin));
    } else {
      const colors = ["bg-[#ffddd5] text-[#a8392d]", "bg-[#dfe8ff] text-[#4a64a5]", "bg-[#dcf2e8] text-[#26715b]"];
      setAdmins((current) => [{ id: Date.now(), ...draft, name: draft.name.trim(), email: draft.email.trim(), lastLogin: "尚未登录", joined: "2026.08.26", color: colors[current.length % colors.length] }, ...current]);
    }
    setDialogOpen(false);
  }

  function toggleStatus(admin: AdminUser) {
    setAdmins((current) => current.map((item) => item.id === admin.id ? { ...item, status: item.status === "正常" ? "已停用" : "正常" } : item));
  }

  function removeAdmin() {
    if (!deleteAdmin || deleteAdmin.role === "超级管理员") return;
    setAdmins((current) => current.filter((admin) => admin.id !== deleteAdmin.id));
    setDeleteAdmin(null);
  }

  const activeCount = admins.filter((admin) => admin.status === "正常").length;
  const contentAdmins = admins.filter((admin) => admin.role === "内容管理员").length;
  const statCards = [
    { label: "管理员总数", value: admins.length, note: "包含全部成员", icon: UsersRound, color: "bg-[#feeae5] text-primary" },
    { label: "正常使用", value: activeCount, note: `占比 ${admins.length ? Math.round(activeCount / admins.length * 100) : 0}%`, icon: UserRoundCheck, color: "bg-[#e3f4ec] text-[#237a60]" },
    { label: "内容管理员", value: contentAdmins, note: "可编辑内容", icon: ShieldCheck, color: "bg-[#e8eefc] text-[#536fb9]" },
    { label: "已停用", value: admins.length - activeCount, note: "无法登录", icon: UserRoundX, color: "bg-[#f2f0eb] text-[#756b5c]" },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" /> TEAM & PERMISSIONS</div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#20222b] sm:text-[28px]">管理员管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">管理后台成员、角色与账号使用状态。</p>
        </div>
        <Button onClick={openCreate} size="lg" className="h-10 rounded-xl px-4 shadow-lg shadow-primary/15"><Plus className="size-4" /> 邀请管理员</Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_1px_2px_rgba(16,24,40,0.03)] ring-1 ring-black/[0.055]">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${stat.color}`}><stat.icon className="size-5" /></div>
              <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="mt-1 text-xl font-semibold text-[#22242d]">{stat.value}<span className="ml-1 text-xs font-normal text-muted-foreground">人</span></p><p className="mt-1 text-[10px] text-muted-foreground/75">{stat.note}</p></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_1px_3px_rgba(16,24,40,0.04)] ring-1 ring-black/[0.055]">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><h2 className="text-sm font-semibold text-[#262832]">管理员列表</h2><p className="mt-1 text-xs text-muted-foreground">共 {filteredAdmins.length} 位成员</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-[230px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名或邮箱" className="h-9 rounded-xl bg-[#fafafa] pl-9" aria-label="搜索管理员" />
            </div>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-9 rounded-xl border bg-white px-3 text-xs text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" aria-label="筛选管理员角色">
              <option>全部角色</option><option>超级管理员</option><option>内容管理员</option><option>只读成员</option>
            </select>
          </div>
        </div>

        {filteredAdmins.length ? (
          <Table>
            <TableHeader><TableRow className="bg-[#fafafa] hover:bg-[#fafafa]"><TableHead className="h-11 pl-5 text-xs text-muted-foreground">管理员</TableHead><TableHead className="text-xs text-muted-foreground">角色</TableHead><TableHead className="text-xs text-muted-foreground">状态</TableHead><TableHead className="text-xs text-muted-foreground">最后登录</TableHead><TableHead className="text-xs text-muted-foreground">加入时间</TableHead><TableHead className="pr-5 text-right text-xs text-muted-foreground">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id} className="h-[72px]">
                  <TableCell className="pl-5"><div className="flex items-center gap-3"><div className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold ${admin.color}`}>{admin.name.slice(0, 1)}</div><div><p className="flex items-center gap-1.5 font-medium text-[#262832]">{admin.name}{admin.role === "超级管理员" ? <Crown className="size-3.5 text-amber-500" /> : null}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Mail className="size-3" />{admin.email}</p></div></div></TableCell>
                  <TableCell><Badge variant="outline" className="bg-white font-normal text-muted-foreground">{admin.role}</Badge></TableCell>
                  <TableCell><Badge className={admin.status === "正常" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}><span className={`size-1.5 rounded-full ${admin.status === "正常" ? "bg-emerald-500" : "bg-stone-400"}`} />{admin.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{admin.lastLogin}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{admin.joined}</TableCell>
                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`管理${admin.name}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEdit(admin)}><Pencil className="size-4" /> 编辑资料</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(admin)} disabled={admin.role === "超级管理员"}>{admin.status === "正常" ? <UserRoundX className="size-4" /> : <CheckCircle2 className="size-4" />}{admin.status === "正常" ? "停用账号" : "恢复账号"}</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" disabled={admin.role === "超级管理员"} onClick={() => setDeleteAdmin(admin)}><Trash2 className="size-4" /> 移除管理员</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted"><Search className="size-5 text-muted-foreground" /></div><p className="mt-4 text-sm font-medium">没有找到匹配的管理员</p><p className="mt-1 text-xs text-muted-foreground">尝试更换姓名、邮箱或角色</p></div></div>
        )}
        <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground"><span>显示 {filteredAdmins.length} / {admins.length} 位</span><span className="hidden sm:inline">超级管理员账号不可停用或删除</span></div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl p-5 sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="text-lg">{editingAdmin ? "编辑管理员" : "邀请管理员"}</DialogTitle><DialogDescription>{editingAdmin ? "更新成员的基础资料、角色与账号状态。" : "添加一位新的后台成员，并为其分配合适权限。"}</DialogDescription></DialogHeader>
          <form onSubmit={saveAdmin} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="admin-name">姓名</Label><Input id="admin-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="请输入姓名" className="h-10" required minLength={2} /></div>
              <div className="space-y-2"><Label htmlFor="admin-email">邮箱</Label><Input id="admin-email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="name@ciyu.cn" className="h-10" required /></div>
              <div className="space-y-2"><Label htmlFor="admin-role">角色</Label><select id="admin-role" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as AdminRole })} className="h-10 w-full rounded-lg border bg-white px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option>超级管理员</option><option>内容管理员</option><option>只读成员</option></select></div>
              <div className="space-y-2"><Label htmlFor="admin-status">账号状态</Label><select id="admin-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as AdminStatus })} className="h-10 w-full rounded-lg border bg-white px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option>正常</option><option>已停用</option></select></div>
            </div>
            {!editingAdmin ? <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700"><KeyRound className="mt-0.5 size-4 shrink-0" /><span>创建后系统将模拟发送邀请邮件，成员可使用邮箱完成登录。</span></div> : null}
            <DialogFooter className="mt-5"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button type="submit">{editingAdmin ? "保存修改" : "发送邀请"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteAdmin)} onOpenChange={(open) => !open && setDeleteAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogMedia className="bg-red-50 text-red-600"><Trash2 className="size-5" /></AlertDialogMedia><AlertDialogTitle>移除“{deleteAdmin?.name}”？</AlertDialogTitle><AlertDialogDescription>该成员将无法继续访问管理后台，其历史操作记录仍会保留。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={removeAdmin}>确认移除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
