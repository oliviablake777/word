import { MePage } from '@/components/me-page';
import { getAllBooks } from '@/lib/books.server';
import type { BookRow } from '@/lib/mock-data';

type SearchParams = {
  auth?: string | string[];
  redirect?: string | string[];
};

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const authValue = Array.isArray(searchParams?.auth)
    ? searchParams?.auth[0]
    : searchParams?.auth;
  const redirectValue = Array.isArray(searchParams?.redirect)
    ? searchParams?.redirect[0]
    : searchParams?.redirect;
  const initialAuth =
    authValue === 'register'
      ? 'register'
      : authValue === 'login'
        ? 'login'
        : undefined;

  let books: BookRow[] = [];
  try {
    books = await getAllBooks();
  } catch (error) {
    console.error(
      'Failed to load books for profile:',
      error instanceof Error ? error.message : error,
    );
  }

  return (
    <MePage
      books={books}
      initialAuth={initialAuth}
      redirectTo={redirectValue ?? undefined}
    />
  );
}
