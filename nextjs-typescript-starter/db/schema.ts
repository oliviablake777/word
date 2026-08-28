import {
  bigint,
  integer,
  json,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';

import type { WordContent } from '@/lib/mock-data';

/**
 * Maps the existing public.books table. This file only defines the Drizzle
 * schema; it does not create or migrate database tables.
 */
export const books = pgTable('books', {
  id: bigint('id', { mode: 'bigint' })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  wordCount: integer('wordCount').notNull(),
  coverUrl: text('coverUrl').notNull(),
  bookId: text('bookId').notNull().unique('books_book_id_unique'),
  tags: text('tags').array().notNull(),
});

export const words = pgTable('words', {
  id: bigint('id', { mode: 'bigint' })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  wordRank: integer('wordRank'),
  headWord: text('headWord'),
  content: json('content').$type<WordContent>(),
  bookId: text('bookId').references(() => books.bookId, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Word = typeof words.$inferSelect;
