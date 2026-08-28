import { LearningPage } from '@/components/learning-page';
import { getBookByBookId } from '@/lib/books.server';
import { getWordsByBookId } from '@/lib/words.server';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: { bookId: string };
}) {
  const bookId = decodeURIComponent(params.bookId);

  try {
    const [book, words] = await Promise.all([
      getBookByBookId(bookId),
      getWordsByBookId(bookId),
    ]);

    return <LearningPage bookId={bookId} book={book} words={words} />;
  } catch (error) {
    console.error(
      'Failed to load learning data:',
      error instanceof Error ? error.message : error,
    );
    return (
      <LearningPage
        bookId={bookId}
        book={null}
        words={[]}
        loadError="学习内容加载失败，请稍后重试。"
      />
    );
  }
}
