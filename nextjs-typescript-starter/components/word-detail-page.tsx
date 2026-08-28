'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from '@/components/icons';
import { MobileShell, PageLoading } from '@/components/mobile-shell';
import { useMockApp } from '@/components/mock-app-provider';
import type { BookRow, WordRow } from '@/lib/mock-data';

function DetailSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--line)] px-5 py-7 sm:px-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--coral-dark)]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function WordDetailPage({
  wordId,
  word,
  book,
  loadError,
}: {
  wordId: string;
  word: WordRow | null;
  book: BookRow | null;
  loadError?: string;
}) {
  const router = useRouter();
  const { hydrated, user } = useMockApp();

  useEffect(() => {
    if (!hydrated || user) return;
    const target = '/words/' + encodeURIComponent(wordId);
    router.replace(
      '/me?auth=login&redirect=' + encodeURIComponent(target),
    );
  }, [hydrated, router, user, wordId]);

  if (!hydrated || !user) {
    return (
      <MobileShell>
        <PageLoading label={hydrated ? '正在前往登录' : '正在加载单词'} />
      </MobileShell>
    );
  }

  if (loadError) {
    return (
      <MobileShell>
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-black">单词详情加载失败</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">{loadError}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-7 h-12 rounded-full bg-[var(--ink)] px-6 text-sm font-black text-white"
          >
            重新加载
          </button>
        </div>
      </MobileShell>
    );
  }

  if (!word) {
    return (
      <MobileShell>
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <span className="text-6xl font-black text-[var(--coral)]">404</span>
          <h1 className="mt-4 text-2xl font-black">没有找到这个单词</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            该记录可能不存在，或已从词书中移除。
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-7 h-12 rounded-full bg-[var(--ink)] px-6 text-sm font-black text-white"
          >
            返回首页
          </button>
        </div>
      </MobileShell>
    );
  }

  const content = word.content?.word?.content;
  const headWord = word.content?.word?.wordHead ?? word.headWord ?? 'Unknown';
  const translations = content?.trans?.filter((item) => item.tranCn) ?? [];
  const sentences =
    content?.sentence?.sentences?.filter((item) => item.sContent) ?? [];
  const phrases =
    content?.phrase?.phrases?.filter((item) => item.pContent) ?? [];
  const synonyms = content?.syno?.synos ?? [];
  const relatedWords = content?.relWord?.rels ?? [];
  const memoryMethod = content?.remMethod?.val;

  return (
    <MobileShell>
      <header className="sticky top-0 z-20 flex items-center border-b border-[var(--line)] bg-[rgba(253,252,247,0.92)] px-5 py-4 backdrop-blur-xl sm:px-7">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid h-11 w-11 place-items-center rounded-full border border-[var(--ink)] bg-white"
          aria-label="返回学习页"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 px-4 text-center">
          <h1 className="text-sm font-black">单词详情</h1>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--muted)]">
            {book?.title ?? 'Word Island'}
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--pale-yellow)] text-xs font-black">
          #{word.wordRank ?? '-'}
        </span>
      </header>

      <section className="relative overflow-hidden bg-[var(--pale-yellow)] px-5 py-10 text-center sm:px-7">
        <span className="absolute -left-8 -top-10 h-28 w-28 rounded-full border border-[var(--ink)]/10 bg-[var(--mint)]" />
        <span className="absolute -bottom-12 -right-8 h-32 w-32 rounded-full border border-[var(--ink)]/10 bg-[var(--coral)]/70" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)] bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]">
            <SparklesIcon className="h-3.5 w-3.5" />
            Word detail
          </span>
          <h1 className="mt-6 break-words text-[52px] font-black leading-none tracking-[-0.07em]">
            {headWord}
          </h1>
          {(content?.usphone || content?.ukphone || content?.phone) && (
            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-bold text-[var(--muted)]">
              {content?.usphone && (
                <span>
                  <b className="mr-1 text-[var(--coral-dark)]">美</b> /
                  {content.usphone}/
                </span>
              )}
              {content?.ukphone && (
                <span>
                  <b className="mr-1 text-[#357364]">英</b> /{content.ukphone}/
                </span>
              )}
              {!content?.usphone && !content?.ukphone && content?.phone && (
                <span>/{content.phone}/</span>
              )}
            </div>
          )}
        </div>
      </section>

      <DetailSection eyebrow="Meaning" title="释义">
        {translations.length > 0 ? (
          <div className="space-y-3">
            {translations.map((translation, index) => (
              <div
                key={index}
                className="rounded-[18px] border border-[var(--line-strong)] bg-white p-4"
              >
                <p className="font-black leading-7">{translation.tranCn}</p>
                {translation.tranOther && (
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                    {translation.tranOther}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">暂无释义</p>
        )}
      </DetailSection>

      {sentences.length > 0 && (
        <DetailSection eyebrow="Examples" title="例句">
          <ol className="space-y-3">
            {sentences.map((sentence, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-[18px] border border-[var(--line-strong)] bg-[var(--soft)] p-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--ink)] bg-white text-xs font-black">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-bold leading-6">
                    {sentence.sContent}
                  </p>
                  {sentence.sCn && (
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {sentence.sCn}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </DetailSection>
      )}

      {phrases.length > 0 && (
        <DetailSection eyebrow="Phrases" title="常用短语">
          <div className="divide-y divide-[var(--line)] rounded-[18px] border border-[var(--line-strong)] bg-white px-4">
            {phrases.map((phrase, index) => (
              <div key={index} className="py-3.5">
                <p className="font-black">{phrase.pContent}</p>
                {phrase.pCn && (
                  <p className="mt-1 text-sm text-[var(--muted)]">{phrase.pCn}</p>
                )}
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {synonyms.length > 0 && (
        <DetailSection eyebrow="Synonyms" title="同近词">
          <div className="space-y-3">
            {synonyms.map((group, index) => (
              <div
                key={index}
                className="rounded-[18px] border border-[var(--line-strong)] bg-white p-4"
              >
                <p className="text-xs font-black text-[var(--coral-dark)]">
                  {group.pos ?? '近义表达'}
                </p>
                {group.tran && <p className="mt-1.5 text-sm">{group.tran}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.hwds?.map((item, itemIndex) =>
                    item.w ? (
                      <span
                        key={itemIndex}
                        className="rounded-full border border-[var(--line-strong)] bg-[var(--soft)] px-3 py-1 text-sm font-bold"
                      >
                        {item.w}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {relatedWords.length > 0 && (
        <DetailSection eyebrow="Word family" title="相关词">
          <div className="space-y-3">
            {relatedWords.map((group, index) => (
              <div
                key={index}
                className="rounded-[18px] border border-[var(--line-strong)] bg-white p-4"
              >
                <p className="text-xs font-black text-[#357364]">
                  {group.pos ?? '相关词'}
                </p>
                <div className="mt-3 space-y-2">
                  {group.words?.map((item, itemIndex) =>
                    item.hwd ? (
                      <div
                        key={itemIndex}
                        className="flex items-baseline justify-between gap-3"
                      >
                        <span className="font-black">{item.hwd}</span>
                        <span className="text-right text-sm text-[var(--muted)]">
                          {item.tran}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {memoryMethod && (
        <DetailSection eyebrow="Memory tip" title="记忆方法">
          <div className="rounded-[18px] border border-[var(--ink)] bg-[var(--mint)] p-4 shadow-[3px_3px_0_var(--ink)]">
            <p className="text-sm font-semibold leading-7">{memoryMethod}</p>
          </div>
        </DetailSection>
      )}

      <div className="px-5 pb-9 pt-2 sm:px-7">
        <button
          type="button"
          onClick={() =>
            word.bookId
              ? router.push('/learn/' + encodeURIComponent(word.bookId))
              : router.push('/')
          }
          className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--ink)] bg-[var(--ink)] font-black text-white shadow-[3px_3px_0_var(--coral)]"
        >
          返回单词卡片 <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </MobileShell>
  );
}
