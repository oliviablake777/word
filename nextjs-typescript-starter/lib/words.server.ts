import 'server-only';

import { asc, eq } from 'drizzle-orm';

import { getDatabase } from '@/db';
import { words } from '@/db/schema';
import type { WordRow } from '@/lib/mock-data';

export type LearnableWordRow = WordRow & {
  bookId: string;
  wordRank: number;
};

function toLearningContent(content: WordRow['content']) {
  const word = content?.word;
  const detail = word?.content;

  if (!word) return null;

  return {
    word: {
      wordHead: word.wordHead,
      wordId: word.wordId,
      content: {
        usphone: detail?.usphone,
        ukphone: detail?.ukphone,
        phone: detail?.phone,
        trans: detail?.trans?.slice(0, 1),
        sentence: detail?.sentence
          ? { sentences: detail.sentence.sentences?.slice(0, 1) }
          : undefined,
      },
    },
  };
}

export async function getWordsByBookId(
  bookId: string,
): Promise<LearnableWordRow[]> {
  const rows = await getDatabase()
    .select({
      id: words.id,
      wordRank: words.wordRank,
      headWord: words.headWord,
      content: words.content,
      bookId: words.bookId,
    })
    .from(words)
    .where(eq(words.bookId, bookId))
    .orderBy(asc(words.wordRank), asc(words.id));

  return rows
    .filter(
      (word): word is typeof word & { bookId: string; wordRank: number } =>
        word.bookId !== null && word.wordRank !== null,
    )
    .map((word) => ({
      ...word,
      id: word.id.toString(),
      content: toLearningContent(word.content),
    }));
}

export async function getWordById(wordId: string): Promise<WordRow | null> {
  if (!/^\d+$/.test(wordId)) return null;

  const [word] = await getDatabase()
    .select({
      id: words.id,
      wordRank: words.wordRank,
      headWord: words.headWord,
      content: words.content,
      bookId: words.bookId,
    })
    .from(words)
    .where(eq(words.id, BigInt(wordId)))
    .limit(1);

  return word ? { ...word, id: word.id.toString() } : null;
}
