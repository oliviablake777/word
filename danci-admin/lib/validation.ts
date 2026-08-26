const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CredentialsInput = {
  email: string;
  password: string;
};

export type AdminInput = CredentialsInput & {
  name: string;
};

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateCredentials(value: unknown):
  | { ok: true; data: CredentialsInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "请求参数无效" };
  }

  const body = value as Record<string, unknown>;
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return { ok: false, error: "请输入有效的邮箱地址" };
  }
  if (password.length < 8 || password.length > 128) {
    return { ok: false, error: "密码长度需要在 8 到 128 位之间" };
  }

  return { ok: true, data: { email, password } };
}

export function validateAdminInput(value: unknown):
  | { ok: true; data: AdminInput }
  | { ok: false; error: string } {
  const credentials = validateCredentials(value);
  if (!credentials.ok) return credentials;

  const body = value as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "姓名长度需要在 2 到 100 个字符之间" };
  }

  return { ok: true, data: { ...credentials.data, name } };
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function getDatabaseErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }
  return "";
}
