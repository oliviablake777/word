export const AUTH_COOKIE = "ciyu-admin-auth";
export const EMAIL_COOKIE = "ciyu-admin-email";

export function setBrowserAuth(email: string, name?: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  document.cookie = `${EMAIL_COOKIE}=${encodeURIComponent(email)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  localStorage.setItem(
    "ciyu-admin-profile",
    JSON.stringify({ email, name: name || "系统管理员" }),
  );
}

export function clearBrowserAuth() {
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${EMAIL_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  localStorage.removeItem("ciyu-admin-profile");
}
