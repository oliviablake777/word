'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HomeIcon, UserIcon } from '@/components/icons';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--lime)] text-sm font-black shadow-[2px_2px_0_var(--ink)]">
        W
      </span>
      {!compact && (
        <span className="text-lg font-black tracking-[-0.04em] text-[var(--ink)]">
          WORD ISLAND
        </span>
      )}
    </div>
  );
}

export function MobileShell({
  children,
  withTabs = false,
  className = '',
}: {
  children: React.ReactNode;
  withTabs?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-[var(--canvas)] sm:py-5">
      <div
        className={`relative mx-auto min-h-dvh w-full max-w-[480px] overflow-x-hidden border-x border-[var(--line)] bg-[var(--paper)] sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[28px] sm:border sm:shadow-[0_22px_70px_rgba(30,37,33,0.12)] ${className}`}
      >
        <main
          className={
            withTabs
              ? 'min-h-dvh pb-[calc(86px+env(safe-area-inset-bottom))] sm:min-h-[calc(100dvh-2.5rem)]'
              : 'min-h-dvh sm:min-h-[calc(100dvh-2.5rem)]'
          }
        >
          {children}
        </main>
        {withTabs && <BottomTabs />}
      </div>
    </div>
  );
}

function BottomTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: '/', label: '首页', icon: HomeIcon, active: pathname === '/' },
    {
      href: '/me',
      label: '我的',
      icon: UserIcon,
      active: pathname === '/me',
    },
  ];

  return (
    <nav
      aria-label="主导航"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] border-t border-[var(--line)] bg-[rgba(253,252,247,0.94)] px-6 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:bottom-5 sm:rounded-b-[28px]"
    >
      <div className="grid h-[72px] grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.active ? 'page' : undefined}
              className="group relative flex min-h-11 flex-col items-center justify-center gap-1 text-xs font-bold"
            >
              <span
                className={`grid h-8 w-12 place-items-center rounded-full transition ${
                  tab.active
                    ? 'bg-[var(--ink)] text-white'
                    : 'text-[var(--muted)] group-hover:bg-[var(--soft)]'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={
                  tab.active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'
                }
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageLoading({ label = '正在加载' }: { label?: string }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full border border-[var(--ink)]" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-[var(--coral)] border-r-[var(--coral)]" />
        <span className="absolute inset-[22px] rounded-full bg-[var(--lime)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--muted)]">{label}...</p>
    </div>
  );
}
