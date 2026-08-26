"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
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

type BookStatus = "已发布" | "草稿";

type Book = {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  words: number;
  status: BookStatus;
  updated: string;
  color: string;
};

const initialBooks: Book[] = [
  { id: 1, title: "考研核心词汇", subtitle: "历年真题高频词精选", category: "升学考试", level: "进阶", words: 1850, status: "已发布", updated: "今天 10:32", color: "bg-[#ffe7df] text-[#d94e3d]" },
  { id: 2, title: "大学英语四级", subtitle: "CET-4 必备基础词汇", category: "大学英语", level: "中级", words: 3120, status: "已发布", updated: "昨天 16:20", color: "bg-[#e5edff] text-[#5271c8]" },
  { id: 3, title: "雅思高频词库", subtitle: "听说读写场景化记忆", category: "留学考试", level: "进阶", words: 2460, status: "已发布", updated: "8月24日", color: "bg-[#e3f5ed] text-[#25836a]" },
  { id: 4, title: "商务英语表达", subtitle: "会议、邮件与谈判场景", category: "职场英语", level: "中级", words: 980, status: "草稿", updated: "8月22日", color: "bg-[#fff2d6] text-[#ad7916]" },
  { id: 5, title: "每日生活口语", subtitle: "零基础生活场景表达", category: "日常英语", level: "入门", words: 760, status: "已发布", updated: "8月18日", color: "bg-[#f1e7fa] text-[#8854ad]" },
];

const emptyDraft = {
  title: "",
  subtitle: "",
  category: "大学英语",
  level: "中级",
  words: "",
  status: "草稿" as BookStatus,
};

export function BooksManager() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部状态");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = localStorage.getItem("ciyu-books");
      if (saved) {
        try { setBooks(JSON.parse(saved)); } catch { /* keep starter data */ }
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("ciyu-books", JSON.stringify(books));
  }, [books, hydrated]);

  const filteredBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery = !keyword || `${book.title}${book.subtitle}${book.category}`.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "全部状态" || book.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [books, query, statusFilter]);

  const totalWords = books.reduce((sum, book) => sum + book.words, 0);
  const published = books.filter((book) => book.status === "已发布").length;

  function openCreate() {
    setEditingBook(null);
    setDraft(emptyDraft);
    setDialogOpen(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    setDraft({ title: book.title, subtitle: book.subtitle, category: book.category, level: book.level, words: String(book.words), status: book.status });
    setDialogOpen(true);
  }

  function saveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.subtitle.trim() || Number(draft.words) < 1) return;
    if (editingBook) {
      setBooks((current) => current.map((book) => book.id === editingBook.id ? { ...book, ...draft, words: Number(draft.words), updated: "刚刚" } : book));
    } else {
      const colors = ["bg-[#ffe7df] text-[#d94e3d]", "bg-[#e5edff] text-[#5271c8]", "bg-[#e3f5ed] text-[#25836a]"];
      setBooks((current) => [{ id: Date.now(), ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim(), words: Number(draft.words), updated: "刚刚", color: colors[current.length % colors.length] }, ...current]);
    }
    setDialogOpen(false);
  }

  function removeBook() {
    if (!deleteBook) return;
    setBooks((current) => current.filter((book) => book.id !== deleteBook.id));
    setDeleteBook(null);
  }

  const statCards = [
    { label: "单词书总数", value: books.length, unit: "本", icon: BookOpen, color: "bg-[#feeae5] text-primary", note: "全部词书" },
    { label: "已收录词汇", value: totalWords.toLocaleString("zh-CN"), unit: "词", icon: Sparkles, color: "bg-[#e8eefc] text-[#536fb9]", note: "持续增长中" },
    { label: "已发布", value: published, unit: "本", icon: CheckCircle2, color: "bg-[#e3f4ec] text-[#237a60]", note: `发布率 ${books.length ? Math.round((published / books.length) * 100) : 0}%` },
    { label: "待完善", value: books.length - published, unit: "本", icon: CircleDashed, color: "bg-[#fff1da] text-[#a87519]", note: "草稿内容" },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" /> CONTENT LIBRARY</div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#20222b] sm:text-[28px]">单词书管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">管理词书内容、词汇规模与发布状态。</p>
        </div>
        <Button onClick={openCreate} size="lg" className="h-10 rounded-xl px-4 shadow-lg shadow-primary/15">
          <Plus className="size-4" /> 新建单词书
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_1px_2px_rgba(16,24,40,0.03)] ring-1 ring-black/[0.055]">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${stat.color}`}><stat.icon className="size-5" /></div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-[#22242d]">{stat.value}<span className="ml-1 text-xs font-normal text-muted-foreground">{stat.unit}</span></p>
                <p className="mt-1 text-[10px] text-muted-foreground/75">{stat.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_1px_3px_rgba(16,24,40,0.04)] ring-1 ring-black/[0.055]">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#262832]">词书列表</h2>
            <p className="mt-1 text-xs text-muted-foreground">共 {filteredBooks.length} 条记录</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-[230px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索词书名称或分类" className="h-9 rounded-xl bg-[#fafafa] pl-9" aria-label="搜索单词书" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-xl border bg-white px-3 text-xs text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" aria-label="筛选发布状态">
              <option>全部状态</option><option>已发布</option><option>草稿</option>
            </select>
          </div>
        </div>

        {filteredBooks.length ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
                <TableHead className="h-11 pl-5 text-xs text-muted-foreground">单词书</TableHead>
                <TableHead className="text-xs text-muted-foreground">分类</TableHead>
                <TableHead className="text-xs text-muted-foreground">难度</TableHead>
                <TableHead className="text-xs text-muted-foreground">词汇量</TableHead>
                <TableHead className="text-xs text-muted-foreground">状态</TableHead>
                <TableHead className="text-xs text-muted-foreground">更新时间</TableHead>
                <TableHead className="pr-5 text-right text-xs text-muted-foreground">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id} className="group h-[72px]">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${book.color}`}><BookOpen className="size-[17px]" /></div>
                      <div><p className="font-medium text-[#262832]">{book.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{book.subtitle}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{book.category}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-white font-normal text-muted-foreground">{book.level}</Badge></TableCell>
                  <TableCell className="text-sm font-medium">{book.words.toLocaleString("zh-CN")}</TableCell>
                  <TableCell>
                    <Badge className={book.status === "已发布" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                      <span className={`size-1.5 rounded-full ${book.status === "已发布" ? "bg-emerald-500" : "bg-amber-500"}`} />{book.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{book.updated}</span></TableCell>
                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`管理${book.title}`} />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => openEdit(book)}><Pencil className="size-4" /> 编辑词书</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteBook(book)}><Trash2 className="size-4" /> 删除词书</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted"><Search className="size-5 text-muted-foreground" /></div><p className="mt-4 text-sm font-medium">没有找到匹配的单词书</p><p className="mt-1 text-xs text-muted-foreground">尝试更换关键词或筛选条件</p></div>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
          <span>显示 {filteredBooks.length} / {books.length} 条</span>
          <span className="hidden sm:inline">数据会自动保存在当前设备</span>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingBook ? "编辑单词书" : "新建单词书"}</DialogTitle>
            <DialogDescription>{editingBook ? "更新词书的基础信息和发布状态。" : "创建一本新的单词书，稍后可继续完善内容。"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveBook} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="book-title">词书名称</Label><Input id="book-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="例如：托福核心词汇" className="h-10" required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="book-subtitle">简介</Label><Input id="book-subtitle" value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} placeholder="一句话说明词书用途" className="h-10" required /></div>
              <div className="space-y-2"><Label htmlFor="book-category">分类</Label><Input id="book-category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-10" required /></div>
              <div className="space-y-2"><Label htmlFor="book-words">词汇量</Label><Input id="book-words" type="number" min="1" value={draft.words} onChange={(event) => setDraft({ ...draft, words: event.target.value })} placeholder="1000" className="h-10" required /></div>
              <div className="space-y-2"><Label htmlFor="book-level">难度</Label><select id="book-level" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })} className="h-10 w-full rounded-lg border bg-white px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option>入门</option><option>中级</option><option>进阶</option></select></div>
              <div className="space-y-2"><Label htmlFor="book-status">状态</Label><select id="book-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as BookStatus })} className="h-10 w-full rounded-lg border bg-white px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option>草稿</option><option>已发布</option></select></div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button type="submit">{editingBook ? "保存修改" : "创建词书"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteBook)} onOpenChange={(open) => !open && setDeleteBook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600"><Trash2 className="size-5" /></AlertDialogMedia>
            <AlertDialogTitle>删除“{deleteBook?.title}”？</AlertDialogTitle>
            <AlertDialogDescription>删除后该词书将从列表中移除，此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={removeBook}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
