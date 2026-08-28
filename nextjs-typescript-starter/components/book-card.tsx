'use client';

import { useState } from 'react';
import Image from 'next/image';

import { ArrowRightIcon, BookIcon, ClockIcon } from '@/components/icons';
import {
  parseBookTags,
  type BookRow,
  type LearningProgressRow,
} from '@/lib/mock-data';

export function ProgressBar({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div
      aria-label={'学习进度 ' + safeValue + '%'}
      className={
        'h-2 overflow-hidden rounded-full border border-[var(--ink)]/15 bg-white/60 ' +
        className
      }
    >
      <div
        className="h-full rounded-full bg-[var(--coral)] transition-[width] duration-500"
        style={{ width: safeValue + '%' }}
      />
    </div>
  );
}

function Cover({
  book,
  sizes = '92px',
}: {
  book: BookRow;
  sizes?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(book.coverUrl) && failedUrl !== book.coverUrl;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[14px] border border-[var(--ink)] bg-[var(--soft)]">
      {showImage ? (
        <Image
          src={book.coverUrl!}
          alt={book.title + '封面'}
          fill
          sizes={sizes}
          className="object-cover"
          unoptimized
          priority={false}
          onError={() => setFailedUrl(book.coverUrl)}
        />
      ) : (
        <div className="grid h-full place-items-center">
          <BookIcon className="h-8 w-8 text-[var(--muted)]" />
        </div>
      )}
    </div>
  );
}

export function BookCard({
  book,
  onOpen,
}: {
  book: BookRow;
  onOpen: (book: BookRow) => void;
}) {
  const tags = parseBookTags(book.tags).slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => onOpen(book)}
      className="group flex w-full items-center gap-4 rounded-[20px] border border-[var(--line-strong)] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
    >
      <div className="h-[112px] w-[84px] shrink-0">
        <Cover book={book} sizes="84px" />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.15em] text-[var(--coral-dark)]">
              Word Book
            </p>
            <h3 className="line-clamp-2 text-lg font-black leading-6 tracking-[-0.025em] text-[var(--ink)]">
              {book.title}
            </h3>
          </div>
          <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line-strong)] transition group-hover:bg-[var(--ink)] group-hover:text-white">
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
          共 {book.wordCount} 个单词
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--line-strong)] bg-[var(--soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export function RecentBookCard({
  book,
  progress,
  onOpen,
}: {
  book: BookRow;
  progress: LearningProgressRow;
  onOpen: (book: BookRow) => void;
}) {
  const percentage =
    book.wordCount === 0
      ? 0
      : Math.min(100, Math.round((progress.learnedCount / book.wordCount) * 100));

  return (
    <button
      type="button"
      onClick={() => onOpen(book)}
      className="group relative w-full overflow-hidden rounded-[24px] border border-[var(--ink)] bg-[var(--mint)] p-4 text-left shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
    >
      <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full border border-[var(--ink)]/10 bg-white/25" />
      <div className="relative flex gap-4">
        <div className="h-[126px] w-[94px] shrink-0 rotate-[-2deg] transition group-hover:rotate-0">
          <Cover book={book} sizes="94px" />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)] bg-[var(--paper)] px-2.5 py-1 text-[11px] font-black">
            <ClockIcon className="h-3.5 w-3.5" />
            继续上次学习
          </span>
          <h3 className="mt-3 truncate text-xl font-black tracking-[-0.04em] text-[var(--ink)]">
            {book.title}
          </h3>
          <div className="mt-3 flex items-center justify-between text-xs font-bold">
            <span>
              已学 {progress.learnedCount} / {book.wordCount}
            </span>
            <span>{percentage}%</span>
          </div>
          <ProgressBar value={percentage} className="mt-2" />
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[var(--ink)]">
            继续学习 <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

export function ProgressBookCard({
  book,
  progress,
  onOpen,
}: {
  book: BookRow;
  progress: LearningProgressRow;
  onOpen: (book: BookRow) => void;
}) {
  const percentage =
    book.wordCount === 0
      ? 0
      : Math.min(100, Math.round((progress.learnedCount / book.wordCount) * 100));

  return (
    <button
      type="button"
      onClick={() => onOpen(book)}
      className="w-full rounded-[20px] border border-[var(--line-strong)] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-[var(--ink)]">
            {book.title}
          </p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            {progress.completedAt ? '已完成本轮学习' : '继续积累，每天进步一点'}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--pale-yellow)] px-2.5 py-1 text-xs font-black">
          {percentage}%
        </span>
      </div>
      <ProgressBar value={percentage} className="mt-4" />
      <div className="mt-3 flex items-center justify-between text-xs font-bold text-[var(--muted)]">
        <span>
          {progress.learnedCount} / {book.wordCount} 个单词
        </span>
        <span className="inline-flex items-center gap-1 text-[var(--ink)]">
          {progress.completedAt ? '再学一遍' : '继续'}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}
