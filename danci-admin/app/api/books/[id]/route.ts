import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { books, words } from "@/db/schema";
import { getBookById } from "@/lib/books.server";
import { validateBookInput } from "@/lib/books.validation";
import { getCurrentAdmin } from "@/lib/auth.server";
import {
  getDatabaseErrorCode,
  isSameOriginRequest,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function authorizeAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "请先登录", status: 401 } as const;
  return { admin } as const;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: "单词书 ID 无效" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
  }

  const validation = validateBookInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (!(await getBookById(id))) {
    return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  }

  try {
    const [book] = await db
      .update(books)
      .set(validation.data)
      .where(eq(books.id, id))
      .returning({
        id: books.id,
        title: books.title,
        wordCount: books.wordCount,
        coverUrl: books.coverUrl,
        bookId: books.bookId,
        tags: books.tags,
      });

    revalidatePath("/books");
    return NextResponse.json({ book });
  } catch (error) {
    if (getDatabaseErrorCode(error) === "23505") {
      return NextResponse.json({ error: "该 bookId 已存在" }, { status: 409 });
    }
    console.error("Failed to update book", error);
    return NextResponse.json({ error: "更新单词书失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: "单词书 ID 无效" }, { status: 400 });
  }

  try {
    const deletedWords = await db.transaction(async (tx) => {
      const [target] = await tx
        .select({ id: books.id, bookId: books.bookId })
        .from(books)
        .where(eq(books.id, id))
        .limit(1);

      if (!target) return null;

      const [wordTotal] = await tx
        .select({ value: count() })
        .from(words)
        .where(eq(words.bookId, target.bookId));

      await tx.delete(books).where(eq(books.id, target.id));
      return wordTotal?.value ?? 0;
    });

    if (deletedWords === null) {
      return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
    }

    revalidatePath("/books");
    return NextResponse.json({ success: true, deletedWords });
  } catch (error) {
    console.error("Failed to delete book", error);
    return NextResponse.json({ error: "删除单词书失败" }, { status: 500 });
  }
}
