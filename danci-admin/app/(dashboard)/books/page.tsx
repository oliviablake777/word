import { BooksManager } from "@/components/books-manager";
import { listBooks } from "@/lib/books.server";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await listBooks();
  return <BooksManager initialBooks={books} />;
}
