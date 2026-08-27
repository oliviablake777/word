export type BookInput = {
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags: string[];
};

function normalizeTags(value: unknown) {
  const candidates = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,，]/)
      : [];

  return Array.from(
    new Set(
      candidates
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateBookInput(value: unknown):
  | { ok: true; data: BookInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "请求参数无效" };
  }

  const body = value as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const wordCount = Number(body.wordCount);
  const coverUrl =
    typeof body.coverUrl === "string" ? body.coverUrl.trim() : "";
  const bookId = typeof body.bookId === "string" ? body.bookId.trim() : "";
  const tags = normalizeTags(body.tags);

  if (!title || title.length > 200) {
    return { ok: false, error: "标题长度需要在 1 到 200 个字符之间" };
  }
  if (!Number.isInteger(wordCount) || wordCount < 0) {
    return { ok: false, error: "单词数量必须是大于或等于 0 的整数" };
  }
  if (!coverUrl || coverUrl.length > 2048 || !isHttpUrl(coverUrl)) {
    return { ok: false, error: "请输入有效的 HTTP 或 HTTPS 封面地址" };
  }
  if (!bookId || bookId.length > 200 || /\s/.test(bookId)) {
    return { ok: false, error: "bookId 不能为空、不能包含空格且不能超过 200 个字符" };
  }
  if (!tags.length) {
    return { ok: false, error: "请至少填写一个标签" };
  }
  if (tags.length > 20 || tags.some((tag) => tag.length > 50)) {
    return { ok: false, error: "最多填写 20 个标签，每个标签不能超过 50 个字符" };
  }

  return {
    ok: true,
    data: { title, wordCount, coverUrl, bookId, tags },
  };
}
