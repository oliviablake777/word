"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  BookOpen,
  Hash,
  Layers3,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BookListItem } from "@/lib/book-types";

type BookDraft = {
  title: string;
  wordCount: string;
  coverUrl: string;
  bookId: string;
  tags: string;
};

const emptyDraft: BookDraft = {
  title: "",
  wordCount: "",
  coverUrl: "",
  bookId: "",
  tags: "",
};

function BookCover({
  title,
  coverUrl,
  compact = false,
}: {
  title: string;
  coverUrl: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f1eee5] text-[#7b6d55] ring-1 ring-black/[0.06] ${compact ? "h-14 w-11" : "h-24 w-[72px]"}`}
    >
      <BookOpen className={compact ? "size-4" : "size-6"} />
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={`${title || "单词书"}封面`}
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </div>
  );
}

export function BooksManager({
  initialBooks,
}: {
  initialBooks: BookListItem[];
}) {
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookListItem | null>(null);
  const [deleteBook, setDeleteBook] = useState<BookListItem | null>(null);
  const [draft, setDraft] = useState<BookDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const filteredBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return books;

    return books.filter((book) =>
      `${book.title}${book.bookId}${book.tags.join("")}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [books, query]);

  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);
  const tagCount = new Set(books.flatMap((book) => book.tags)).size;
  const averageWords = books.length ? Math.round(totalWords / books.length) : 0;

  function openCreate() {
    setEditingBook(null);
    setDraft(emptyDraft);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(book: BookListItem) {
    setEditingBook(book);
    setDraft({
      title: book.title,
      wordCount: String(book.wordCount),
      coverUrl: book.coverUrl,
      bookId: book.bookId,
      tags: book.tags.join(", "),
    });
    setError("");
    setDialogOpen(true);
  }

  async function saveBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const wordCount = Number(draft.wordCount);
    if (!draft.title.trim()) {
      setError("请输入单词书标题");
      return;
    }
    if (!Number.isInteger(wordCount) || wordCount < 0) {
      setError("单词数量必须是大于或等于 0 的整数");
      return;
    }
    if (!draft.coverUrl.trim() || !draft.bookId.trim() || !draft.tags.trim()) {
      setError("请完整填写封面 URL、bookId 和标签");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        editingBook ? `/api/books/${editingBook.id}` : "/api/books",
        {
          method: editingBook ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, wordCount }),
        },
      );
      const result = (await response.json()) as {
        book?: BookListItem;
        error?: string;
      };

      if (!response.ok || !result.book) {
        setError(result.error || "保存失败，请稍后重试");
        return;
      }

      setBooks((current) =>
        editingBook
          ? current.map((book) =>
              book.id === result.book?.id ? result.book : book,
            )
          : [result.book as BookListItem, ...current],
      );
      setDialogOpen(false);
    } catch {
      setError("无法连接服务器，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeBook() {
    if (!deleteBook) return;

    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/books/${deleteBook.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setDeleteError(result.error || "删除失败，请稍后重试");
        return;
      }

      setBooks((current) =>
        current.filter((book) => book.id !== deleteBook.id),
      );
      setDeleteBook(null);
    } catch {
      setDeleteError("无法连接服务器，请稍后重试");
    } finally {
      setDeleting(false);
    }
  }

  const statCards = [
    {
      label: "单词书总数",
      value: books.length.toLocaleString("zh-CN"),
      unit: "本",
      note: "已录入词书",
      icon: BookOpen,
      color: "bg-[#feeae5] text-primary",
    },
    {
      label: "单词总量",
      value: totalWords.toLocaleString("zh-CN"),
      unit: "词",
      note: "按词书录入数量统计",
      icon: Layers3,
      color: "bg-[#e8eefc] text-[#536fb9]",
    },
    {
      label: "平均词量",
      value: averageWords.toLocaleString("zh-CN"),
      unit: "词",
      note: "每本单词书平均值",
      icon: Hash,
      color: "bg-[#e3f4ec] text-[#237a60]",
    },
    {
      label: "标签数量",
      value: tagCount.toLocaleString("zh-CN"),
      unit: "个",
      note: "去重后的全部标签",
      icon: Tags,
      color: "bg-[#fff1da] text-[#a87519]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> CONTENT
            LIBRARY
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#20222b] sm:text-[28px]">
            单词书管理
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            录入和维护单词书信息，并通过 bookId 关联词汇数据。
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="lg"
          className="h-10 rounded-xl px-4 shadow-lg shadow-primary/15"
        >
          <Plus className="size-4" /> 新增单词书
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_1px_2px_rgba(16,24,40,0.03)] ring-1 ring-black/[0.055]"
          >
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-[#22242d]">
                  {stat.value}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {stat.unit}
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/75">
                  {stat.note}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_1px_3px_rgba(16,24,40,0.04)] ring-1 ring-black/[0.055]">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#262832]">词书列表</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              共 {filteredBooks.length} 条记录
            </p>
          </div>
          <div className="relative min-w-[250px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、bookId 或标签"
              className="h-9 rounded-xl bg-[#fafafa] pl-9"
              aria-label="搜索单词书"
            />
          </div>
        </div>

        {filteredBooks.length ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
                <TableHead className="h-11 pl-5 text-xs text-muted-foreground">
                  封面与标题
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  单词数量
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  bookId
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  标签
                </TableHead>
                <TableHead className="pr-5 text-right text-xs text-muted-foreground">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id} className="h-[82px]">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <BookCover
                        title={book.title}
                        coverUrl={book.coverUrl}
                        compact
                      />
                      <div className="min-w-0">
                        <p className="max-w-[280px] truncate font-medium text-[#262832]">
                          {book.title}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          记录编号 #{book.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {book.wordCount.toLocaleString("zh-CN")}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      词
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {book.bookId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[280px] items-center gap-1.5 overflow-hidden">
                      {book.tags.length ? (
                        <>
                          {book.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="bg-white font-normal text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {book.tags.length > 3 ? (
                            <span className="text-xs text-muted-foreground">
                              +{book.tags.length - 3}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">暂无标签</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(book)}
                      >
                        <Pencil className="size-3.5" /> 编辑
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeleteError("");
                          setDeleteBook(book);
                        }}
                      >
                        <Trash2 className="size-3.5" /> 删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div>
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">
                {books.length ? "没有找到匹配的单词书" : "还没有单词书"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {books.length
                  ? "尝试更换搜索关键词"
                  : "点击右上角按钮录入第一本单词书"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
          <span>
            显示 {filteredBooks.length} / {books.length} 条
          </span>
          <span className="hidden sm:inline">数据已保存至 Supabase</span>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingBook ? "编辑单词书" : "新增单词书"}
            </DialogTitle>
            <DialogDescription>
              {editingBook
                ? "修改词书信息；调整 bookId 后，关联单词会同步更新。"
                : "填写词书信息，通过 bookId 与 words 表建立关联。"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveBook} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="book-title">标题</Label>
                <Input
                  id="book-title"
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                  placeholder="例如：人教版小学英语三年级上册"
                  className="h-10"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-word-count">单词数量</Label>
                <Input
                  id="book-word-count"
                  type="number"
                  min="0"
                  step="1"
                  value={draft.wordCount}
                  onChange={(event) =>
                    setDraft({ ...draft, wordCount: event.target.value })
                  }
                  placeholder="130"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-id">bookId</Label>
                <Input
                  id="book-id"
                  value={draft.bookId}
                  onChange={(event) =>
                    setDraft({ ...draft, bookId: event.target.value })
                  }
                  placeholder="PEPXiaoXue6_1"
                  className="h-10 font-mono"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="book-cover-url">封面 URL</Label>
                <Input
                  id="book-cover-url"
                  type="url"
                  value={draft.coverUrl}
                  onChange={(event) =>
                    setDraft({ ...draft, coverUrl: event.target.value })
                  }
                  placeholder="https://example.com/cover.jpg"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="book-tags">标签（逗号分隔）</Label>
                <Input
                  id="book-tags"
                  value={draft.tags}
                  onChange={(event) =>
                    setDraft({ ...draft, tags: event.target.value })
                  }
                  placeholder="小学英语, 人教版, 三年级"
                  className="h-10"
                  required
                />
              </div>
            </div>

            {draft.coverUrl ? (
              <div className="flex items-center gap-3 rounded-xl border bg-[#fafafa] p-3">
                <BookCover title={draft.title} coverUrl={draft.coverUrl} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#262832]">封面预览</p>
                  <p className="mt-1 line-clamp-2 break-all text-[11px] leading-4 text-muted-foreground">
                    {draft.coverUrl}
                  </p>
                </div>
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "正在保存..."
                  : editingBook
                    ? "保存修改"
                    : "创建单词书"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteBook)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteBook(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600">
              <Trash2 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>删除“{deleteBook?.title}”？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作会删除 books 表中的该单词书，并同时删除 words 表中
              bookId 为“{deleteBook?.bookId}”的全部单词数据。删除后无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {deleteError}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={removeBook}
              disabled={deleting}
            >
              {deleting ? "正在删除..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
