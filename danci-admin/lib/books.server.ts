import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import type { BookListItem } from "@/lib/book-types";

const bookSelection = {
  id: books.id,
  title: books.title,
  wordCount: books.wordCount,
  coverUrl: books.coverUrl,
  bookId: books.bookId,
  tags: books.tags,
};

export async function listBooks(): Promise<BookListItem[]> {
  return db
    .select(bookSelection)
    .from(books)
    .orderBy(asc(books.title), asc(books.id));
}

export async function getBookById(id: number): Promise<BookListItem | null> {
  const [book] = await db
    .select(bookSelection)
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  return book ?? null;
}
