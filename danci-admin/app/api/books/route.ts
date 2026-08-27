import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { listBooks } from "@/lib/books.server";
import { validateBookInput } from "@/lib/books.validation";
import { getCurrentAdmin } from "@/lib/auth.server";
import {
  getDatabaseErrorCode,
  isSameOriginRequest,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorizeAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "请先登录", status: 401 } as const;
  return { admin } as const;
}

export async function GET() {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  return NextResponse.json({ books: await listBooks() });
}

export async function POST(request: Request) {
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

  try {
    const [book] = await db
      .insert(books)
      .values(validation.data)
      .returning({
        id: books.id,
        title: books.title,
        wordCount: books.wordCount,
        coverUrl: books.coverUrl,
        bookId: books.bookId,
        tags: books.tags,
      });

    revalidatePath("/books");
    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    if (getDatabaseErrorCode(error) === "23505") {
      return NextResponse.json({ error: "该 bookId 已存在" }, { status: 409 });
    }
    console.error("Failed to create book", error);
    return NextResponse.json({ error: "创建单词书失败" }, { status: 500 });
  }
}
