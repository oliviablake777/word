'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ProgressBar } from '@/components/book-card';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  RefreshIcon,
  SparklesIcon,
} from '@/components/icons';
import { MobileShell, PageLoading } from '@/components/mobile-shell';
import { useMockApp } from '@/components/mock-app-provider';
import type { BookRow } from '@/lib/mock-data';
import type { LearnableWordRow } from '@/lib/words.server';

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const router = useRouter();
  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full border border-[var(--ink)] bg-[var(--pale-yellow)] shadow-[3px_3px_0_var(--ink)]">
          <span className="text-3xl font-black">?</span>
        </span>
        <h1 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h1>
        <p className="mt-3 max-w-[300px] text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-6 text-sm font-black text-white"
        >
          返回首页 <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </MobileShell>
  );
}

export function LearningPage({
  bookId,
  book,
  words,
  loadError,
}: {
  bookId: string;
  book: BookRow | null;
  words: LearnableWordRow[];
  loadError?: string;
}) {
  const router = useRouter();
  const {
    hydrated,
    user,
    getProgress,
    completeWord,
    resetProgress,
  } = useMockApp();
  const [saving, setSaving] = useState(false);
  const progress = getProgress(bookId);

  useEffect(() => {
    if (!hydrated || user) return;
    const target = '/learn/' + encodeURIComponent(bookId);
    router.replace(
      '/me?auth=login&redirect=' + encodeURIComponent(target),
    );
  }, [bookId, hydrated, router, user]);

  if (!hydrated || !user) {
    return (
      <MobileShell>
        <PageLoading label={hydrated ? '正在前往登录' : '正在读取学习进度'} />
      </MobileShell>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        title="学习内容加载失败"
        description={loadError}
      />
    );
  }

  if (!book) {
    return (
      <EmptyState
        title="没有找到这本词书"
        description="它可能已经下架，或链接中的 bookId 不正确。"
      />
    );
  }

  if (words.length === 0) {
    return (
      <EmptyState
        title="这本词书还没有单词"
        description="内容正在准备中，请稍后再回来看看。"
      />
    );
  }

  const learnedCount = Math.min(progress?.learnedCount ?? 0, words.length);
  const nextWord = words.find(
    (word) =>
      progress?.lastWordRank === null ||
      progress?.lastWordRank === undefined ||
      word.wordRank > progress.lastWordRank,
  );
  const completed = !nextWord;
  const percentage = Math.round((learnedCount / words.length) * 100);

  const handleNext = async () => {
    if (!nextWord || saving) return;
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 460));
    completeWord(
      bookId,
      nextWord.id,
      nextWord.wordRank,
      currentNumber,
      words.length,
    );
    setSaving(false);
  };

  const handleRestart = () => {
    resetProgress(bookId);
  };

  if (completed) {
    return (
      <MobileShell className="bg-[var(--pale-yellow)]">
        <header className="flex items-center px-5 py-5 sm:px-7">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--ink)] bg-white"
            aria-label="返回首页"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <p className="ml-3 text-sm font-black">本轮完成</p>
        </header>
        <div className="flex min-h-[calc(100dvh-82px)] flex-col items-center justify-center px-6 pb-12 text-center">
          <div className="relative">
            <span className="absolute -left-10 top-3 h-4 w-4 rotate-12 rounded-sm border border-[var(--ink)] bg-[var(--coral)]" />
            <span className="absolute -right-12 top-12 h-5 w-5 rounded-full border border-[var(--ink)] bg-[var(--mint)]" />
            <span className="absolute -bottom-4 -left-6 h-3 w-8 -rotate-12 rounded-full border border-[var(--ink)] bg-white" />
            <span className="grid h-32 w-32 place-items-center rounded-full border-2 border-[var(--ink)] bg-white shadow-[6px_6px_0_var(--ink)]">
              <CheckIcon className="h-14 w-14 text-[#357364]" />
            </span>
          </div>
          <p className="mt-9 text-xs font-black uppercase tracking-[0.2em] text-[var(--coral-dark)]">
            Great work
          </p>
          <h1 className="mt-2 text-[38px] font-black leading-tight tracking-[-0.06em]">
            这一轮学完啦！
          </h1>
          <p className="mt-4 max-w-[310px] text-sm font-semibold leading-6 text-[var(--muted)]">
            你已完成《{book.title}》的 {words.length} 个单词。休息一下，或者再来一遍加深记忆。
          </p>
          <div className="mt-8 w-full max-w-[340px] space-y-3">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--ink)] bg-[var(--ink)] font-black text-white shadow-[3px_3px_0_var(--coral)]"
            >
              <RefreshIcon className="h-5 w-5" />
              重新学习
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="h-[52px] w-full rounded-2xl border border-[var(--ink)] bg-white font-black"
            >
              返回首页
            </button>
          </div>
        </div>
      </MobileShell>
    );
  }

  const detail = nextWord.content?.word?.content;
  const headWord =
    nextWord.content?.word?.wordHead ?? nextWord.headWord ?? 'Unknown';
  const translation = detail?.trans?.[0]?.tranCn ?? '暂无释义';
  const example = detail?.sentence?.sentences?.[0];
  const currentNumber = learnedCount + 1;

  return (
    <MobileShell>
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(253,252,247,0.92)] px-5 pb-4 pt-5 backdrop-blur-xl sm:px-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--ink)] bg-white transition hover:-translate-y-0.5"
            aria-label="返回首页"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 px-4 text-center">
            <p className="truncate text-sm font-black">{book.title}</p>
            <p className="mt-0.5 text-[11px] font-bold text-[var(--muted)]">
              {currentNumber} / {words.length}
            </p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--pale-yellow)] text-xs font-black">
            {percentage}%
          </span>
        </div>
        <ProgressBar value={percentage} className="mt-4" />
      </header>

      <div className="flex min-h-[calc(100dvh-108px)] flex-col px-5 pb-7 pt-6 sm:px-7">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--coral-dark)]">
            <SparklesIcon className="h-4 w-4" />
            Word {currentNumber}
          </span>
          <span className="text-xs font-bold text-[var(--muted)]">
            点击单词查看详情
          </span>
        </div>

        <article
          key={nextWord.id}
          className="word-card-enter relative flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[30px] border-2 border-[var(--ink)] bg-white p-6 shadow-[7px_7px_0_var(--ink)]"
        >
          <span className="absolute -right-10 -top-12 h-36 w-36 rounded-full border border-[var(--ink)]/15 bg-[var(--pale-yellow)]" />
          <span className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full border border-[var(--ink)]/10 bg-[var(--mint)]/70" />

          <div className="relative flex flex-1 flex-col items-center justify-center text-center">
            <Link
              href={'/words/' + nextWord.id}
              className="group rounded-2xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
            >
              <h1 className="break-words text-[50px] font-black leading-none tracking-[-0.07em] text-[var(--ink)] transition group-hover:text-[var(--coral-dark)]">
                {headWord}
              </h1>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
                <EyeIcon className="h-4 w-4" />
                详细学习
              </span>
            </Link>

            {(detail?.usphone || detail?.ukphone || detail?.phone) && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {detail?.usphone && (
                  <span className="rounded-full border border-[var(--line-strong)] bg-[var(--soft)] px-3 py-1.5 text-sm font-semibold">
                    <b className="mr-1 text-[var(--coral-dark)]">美</b> /
                    {detail.usphone}/
                  </span>
                )}
                {detail?.ukphone && (
                  <span className="rounded-full border border-[var(--line-strong)] bg-[var(--soft)] px-3 py-1.5 text-sm font-semibold">
                    <b className="mr-1 text-[#357364]">英</b> /{detail.ukphone}/
                  </span>
                )}
                {!detail?.usphone && !detail?.ukphone && detail?.phone && (
                  <span className="rounded-full border border-[var(--line-strong)] bg-[var(--soft)] px-3 py-1.5 text-sm font-semibold">
                    /{detail.phone}/
                  </span>
                )}
              </div>
            )}

            <div className="my-7 h-px w-16 bg-[var(--line-strong)]" />
            <p className="max-w-[320px] text-xl font-black leading-8 text-[var(--ink)]">
              {translation}
            </p>

            {example?.sContent && (
              <div className="mt-7 w-full rounded-[20px] border border-[var(--line-strong)] bg-[var(--soft)] p-4 text-left">
                <p className="text-sm font-bold leading-6 text-[var(--ink)]">
                  {example.sContent}
                </p>
                {example.sCn && (
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                    {example.sCn}
                  </p>
                )}
              </div>
            )}
          </div>
        </article>

        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="mt-6 inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--ink)] bg-[var(--coral)] text-lg font-black text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-65"
        >
          {saving ? '正在保存进度...' : '下一个'}
          {!saving && <ArrowRightIcon className="h-5 w-5" />}
        </button>
      </div>
    </MobileShell>
  );
}
