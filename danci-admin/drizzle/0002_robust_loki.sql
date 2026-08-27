ALTER TABLE "words" DROP CONSTRAINT "words_bookId_books_bookId_fk";
--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_bookId_books_bookId_fk" FOREIGN KEY ("bookId") REFERENCES "public"."books"("bookId") ON DELETE cascade ON UPDATE cascade;