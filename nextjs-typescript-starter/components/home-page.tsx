'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { BookCard, RecentBookCard } from '@/components/book-card';
import { ArrowRightIcon, SparklesIcon } from '@/components/icons';
import { BrandMark, MobileShell, PageLoading } from '@/components/mobile-shell';
import { useMockApp } from '@/components/mock-app-provider';
import type { BookRow } from '@/lib/mock-data';

export function HomePage({
  books,
  booksError,
}: {
  books: BookRow[];
  booksError?: string;
}) {
  const router = useRouter();
  const { hydrated, user, progressRecords } = useMockApp();

  const recent = useMemo(() => {
    if (!user) return null;
    const progress = progressRecords
      .filter((item) => item.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0];
    if (!progress) return null;
    const book = books.find((item) => item.bookId === progress.bookId);
    return book ? { book, progress } : null;
  }, [books, progressRecords, user]);

  const openBook = (book: BookRow) => {
    const target = '/learn/' + encodeURIComponent(book.bookId);
    if (user) {
      router.push(target);
      return;
    }
    router.push(
      '/me?auth=login&redirect=' + encodeURIComponent(target),
    );
  };

  return (
    <MobileShell withTabs>
      {!hydrated ? (
        <PageLoading label="正在准备你的词书" />
      ) : (
        <>
          <header className="px-5 pb-3 pt-5 sm:px-7 sm:pt-7">
            <div className="flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                onClick={() => router.push('/me')}
                className="grid h-10 min-w-10 place-items-center rounded-full border border-[var(--ink)] bg-white px-3 text-sm font-black shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
                aria-label={user ? '进入我的页面' : '登录'}
              >
                {user ? user.email.charAt(0).toUpperCase() : '登录'}
              </button>
            </div>
          </header>

          <section className="relative mx-5 mt-4 overflow-hidden rounded-[28px] border border-[var(--ink)] bg-[var(--pale-yellow)] px-5 py-7 sm:mx-7">
            <span className="absolute -right-5 -top-5 h-24 w-24 rounded-full border border-[var(--ink)] bg-[var(--coral)]/80" />
            <span className="absolute -bottom-8 right-20 h-20 w-20 rounded-full border border-[var(--ink)] bg-[var(--mint)]" />
            <div className="relative max-w-[290px]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)] bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]">
                <SparklesIcon className="h-3.5 w-3.5" />
                Daily vocabulary
              </span>
              <h1 className="mt-5 text-[34px] font-black leading-[1.08] tracking-[-0.06em] text-[var(--ink)]">
                {user ? '今天也来学几个新单词吧' : '选一本词书，开始你的单词旅程'}
              </h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--muted)]">
                每次只学一个，轻松一点，记得更久。
              </p>
            </div>
          </section>

          {recent && (
            <section className="px-5 pt-8 sm:px-7">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--coral-dark)]">
                    Pick up where you left off
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    最近学习
                  </h2>
                </div>
              </div>
              <RecentBookCard
                book={recent.book}
                progress={recent.progress}
                onOpen={openBook}
              />
            </section>
          )}

          <section className="px-5 pb-6 pt-8 sm:px-7">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--coral-dark)]">
                  Explore
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  全部单词书
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--muted)]">
                {books.length} 本
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </div>
            {booksError ? (
              <div
                role="alert"
                className="rounded-[20px] border border-[var(--line-strong)] bg-white p-5 text-center"
              >
                <p className="text-sm font-bold text-[var(--muted)]">
                  {booksError}
                </p>
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="mt-4 rounded-full border border-[var(--ink)] bg-[var(--pale-yellow)] px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)]"
                >
                  重新加载
                </button>
              </div>
            ) : books.length > 0 ? (
              <div className="space-y-3">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} onOpen={openBook} />
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-[var(--line-strong)] bg-white/70 px-5 py-10 text-center">
                <p className="text-base font-black text-[var(--ink)]">
                  暂无单词书
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                  数据库中还没有可展示的内容
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </MobileShell>
  );
}
