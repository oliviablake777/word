import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "词屿 · 管理后台",
  description: "词屿单词书与管理员管理后台",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
