import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';

import { MockAppProvider } from '@/components/mock-app-provider';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Word Island · 轻松学单词',
    template: '%s · Word Island',
  },
  description: '一个轻量、专注的移动端英语单词学习应用。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fdfcf7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={GeistSans.variable}>
        <MockAppProvider>{children}</MockAppProvider>
      </body>
    </html>
  );
}
