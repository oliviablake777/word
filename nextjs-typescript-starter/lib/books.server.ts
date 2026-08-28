import 'server-only';

import { asc, eq } from 'drizzle-orm';

import { getDatabase } from '@/db';
import { books } from '@/db/schema';
import type { BookRow } from '@/lib/mock-data';

export async function getAllBooks(): Promise<BookRow[]> {
  const rows = await getDatabase()
    .select({
      id: books.id,
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
      bookId: books.bookId,
      tags: books.tags,
    })
    .from(books)
    .orderBy(asc(books.id));

  return rows.map((book) => ({
    ...book,
    id: book.id.toString(),
  }));
}

export async function getBookByBookId(
  bookId: string,
): Promise<BookRow | null> {
  const [book] = await getDatabase()
    .select({
      id: books.id,
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
      bookId: books.bookId,
      tags: books.tags,
    })
    .from(books)
    .where(eq(books.bookId, bookId))
    .limit(1);

  return book ? { ...book, id: book.id.toString() } : null;
}
