import { HomePage } from '@/components/home-page';
import { DatabaseConfigurationError } from '@/db';
import { getAllBooks } from '@/lib/books.server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const books = await getAllBooks();
    return <HomePage books={books} />;
  } catch (error) {
    console.error(
      'Failed to load books:',
      error instanceof Error ? error.message : error,
    );

    const booksError =
      error instanceof DatabaseConfigurationError
        ? '数据库尚未连接，请先配置 DATABASE_URL。'
        : '单词书加载失败，请稍后重试。';

    return <HomePage books={[]} booksError={booksError} />;
  }
}
