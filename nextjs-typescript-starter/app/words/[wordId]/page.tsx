import { WordDetailPage } from '@/components/word-detail-page';
import { getBookByBookId } from '@/lib/books.server';
import { getWordById } from '@/lib/words.server';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: { wordId: string };
}) {
  const wordId = decodeURIComponent(params.wordId);

  try {
    const word = await getWordById(wordId);
    const book = word?.bookId ? await getBookByBookId(word.bookId) : null;
    return <WordDetailPage wordId={wordId} word={word} book={book} />;
  } catch (error) {
    console.error(
      'Failed to load word detail:',
      error instanceof Error ? error.message : error,
    );
    return (
      <WordDetailPage
        wordId={wordId}
        word={null}
        book={null}
        loadError="单词详情加载失败，请稍后重试。"
      />
    );
  }
}
