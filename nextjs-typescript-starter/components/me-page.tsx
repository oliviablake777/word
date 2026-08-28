'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthDialog } from '@/components/auth-dialog';
import { ProgressBookCard } from '@/components/book-card';
import {
  ArrowRightIcon,
  BookIcon,
  LogOutIcon,
  SparklesIcon,
  UserIcon,
} from '@/components/icons';
import { BrandMark, MobileShell, PageLoading } from '@/components/mobile-shell';
import { useMockApp } from '@/components/mock-app-provider';
import type { BookRow } from '@/lib/mock-data';

export function MePage({
  books,
  initialAuth,
  redirectTo,
}: {
  books: BookRow[];
  initialAuth?: 'login' | 'register';
  redirectTo?: string;
}) {
  const router = useRouter();
  const { hydrated, user, progressRecords, logout } = useMockApp();
  const [authOpen, setAuthOpen] = useState(Boolean(initialAuth));

  useEffect(() => {
    if (hydrated && !user && initialAuth) setAuthOpen(true);
  }, [hydrated, initialAuth, user]);

  const myProgress = useMemo(() => {
    if (!user) return [];
    return progressRecords
      .filter((item) => item.userId === user.id)
      .map((progress) => ({
        progress,
        book: books.find((book) => book.bookId === progress.bookId),
      }))
      .filter(
        (
          item,
        ): item is {
          progress: (typeof progressRecords)[number];
          book: BookRow;
        } => Boolean(item.book),
      )
      .sort(
        (a, b) =>
          new Date(b.progress.updatedAt).getTime() -
          new Date(a.progress.updatedAt).getTime(),
      );
  }, [books, progressRecords, user]);

  const handleAuthOpenChange = (open: boolean) => {
    setAuthOpen(open);
    if (!open && initialAuth) {
      router.replace('/me', { scroll: false });
    }
  };

  const openBook = (book: BookRow) => {
    router.push('/learn/' + encodeURIComponent(book.bookId));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <MobileShell withTabs>
      {!hydrated ? (
        <PageLoading label="正在读取学习档案" />
      ) : (
        <>
          <header className="flex items-center justify-between px-5 pb-4 pt-5 sm:px-7 sm:pt-7">
            <BrandMark />
            <span className="rounded-full border border-[var(--line-strong)] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              My Space
            </span>
          </header>

          {user ? (
            <div className="px-5 pb-8 sm:px-7">
              <section className="relative mt-3 overflow-hidden rounded-[28px] border border-[var(--ink)] bg-[var(--mint)] p-5 shadow-[4px_4px_0_var(--ink)]">
                <span className="absolute -right-8 -top-10 h-32 w-32 rounded-full border border-[var(--ink)]/15 bg-white/30" />
                <div className="relative flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--pale-yellow)] text-2xl font-black">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#315f56]">
                      Learning account
                    </p>
                    <h1 className="mt-1 truncate text-xl font-black tracking-[-0.03em]">
                      {user.email}
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                      已学习 {myProgress.length} 本单词书
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--ink)] bg-white text-sm font-black transition hover:bg-[var(--ink)] hover:text-white"
                >
                  <LogOutIcon className="h-[18px] w-[18px]" />
                  退出登录
                </button>
              </section>

              <section className="pt-9">
                <div className="mb-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--coral-dark)]">
                    Your progress
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    学习进度
                  </h2>
                </div>

                {myProgress.length > 0 ? (
                  <div className="space-y-3">
                    {myProgress.map(({ book, progress }) => (
                      <ProgressBookCard
                        key={progress.id}
                        book={book}
                        progress={progress}
                        onOpen={openBook}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] bg-[var(--soft)] px-6 py-10 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--ink)] bg-white">
                      <BookIcon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-black">还没有学习记录</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      去首页选一本喜欢的单词书，从第一个单词开始吧。
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white"
                    >
                      去选词书 <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="px-5 pb-8 sm:px-7">
              <section className="relative mt-3 overflow-hidden rounded-[28px] border border-[var(--ink)] bg-[var(--pale-yellow)] px-6 py-10 text-center">
                <span className="absolute -left-7 -top-8 h-24 w-24 rounded-full border border-[var(--ink)] bg-[var(--coral)]" />
                <span className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full border border-[var(--ink)] bg-[var(--mint)]" />
                <div className="relative">
                  <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-[var(--ink)] bg-white shadow-[4px_4px_0_var(--ink)]">
                    <UserIcon className="h-11 w-11" />
                  </span>
                  <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-[var(--coral-dark)]">
                    Save your progress
                  </p>
                  <h1 className="mt-2 text-[30px] font-black leading-tight tracking-[-0.05em]">
                    登录后，学习不会丢
                  </h1>
                  <p className="mx-auto mt-3 max-w-[290px] text-sm font-semibold leading-6 text-[var(--muted)]">
                    自动记录每本词书的学习位置，下次回来从下一个单词继续。
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--ink)] bg-[var(--ink)] px-6 font-black text-white shadow-[3px_3px_0_var(--coral)] transition hover:-translate-y-0.5"
                  >
                    登录 / 注册
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </section>

              <section className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[20px] border border-[var(--line-strong)] bg-white p-4">
                  <SparklesIcon className="h-6 w-6 text-[var(--coral-dark)]" />
                  <p className="mt-4 text-sm font-black">自动续学</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    从上次完成词的下一词开始
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--line-strong)] bg-white p-4">
                  <BookIcon className="h-6 w-6 text-[#39766b]" />
                  <p className="mt-4 text-sm font-black">进度汇总</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    随时查看每本词书的进度
                  </p>
                </div>
              </section>
            </div>
          )}

          <AuthDialog
            open={authOpen}
            onOpenChange={handleAuthOpenChange}
            initialMode={initialAuth ?? 'login'}
            redirectTo={redirectTo}
          />
        </>
      )}
    </MobileShell>
  );
}
