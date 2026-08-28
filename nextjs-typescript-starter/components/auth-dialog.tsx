'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  ArrowRightIcon,
  CloseIcon,
  LockIcon,
  MailIcon,
} from '@/components/icons';
import { useMockApp } from '@/components/mock-app-provider';

type AuthMode = 'login' | 'register';

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = 'login',
  redirectTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthMode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { login, register } = useMockApp();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError('');
    setNotice('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => emailInputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [initialMode, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) return null;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const fillDemoAccount = () => {
    setEmail('demo@wordisland.com');
    setPassword('12345678');
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError('');
    setNotice('');

    const result =
      mode === 'login'
        ? await login(email, password)
        : await register(email, password);

    setPending(false);
    if (!result.ok) {
      setError(result.message ?? '提交失败，请稍后重试');
      return;
    }

    if (mode === 'register') {
      setMode('login');
      setPassword('');
      setNotice(result.message ?? '注册成功，请登录');
      return;
    }

    onOpenChange(false);
    const target =
      redirectTo &&
      redirectTo.startsWith('/') &&
      !redirectTo.startsWith('//')
        ? redirectTo
        : '/me';
    router.push(target);
    router.refresh();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(20,25,22,0.48)] px-0 backdrop-blur-sm sm:items-center sm:px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <section
        aria-labelledby="auth-dialog-title"
        aria-modal="true"
        role="dialog"
        className="relative w-full max-w-[430px] rounded-t-[28px] border border-[var(--ink)] bg-[var(--pale-yellow)] p-5 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(14,19,16,0.18)] sm:rounded-[28px] sm:p-7"
      >
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[var(--ink)]/20 sm:hidden" />
        <button
          type="button"
          aria-label="关闭"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink)] bg-[var(--paper)] transition hover:-translate-y-0.5 sm:right-5 sm:top-5"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <header className="pr-12">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--coral-dark)]">
            Word Island Account
          </p>
          <h2
            id="auth-dialog-title"
            className="text-[28px] font-black tracking-[-0.05em] text-[var(--ink)]"
          >
            {mode === 'login' ? '欢迎回来' : '创建学习账号'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {mode === 'login'
              ? '登录后继续上一次的学习进度。'
              : '只需邮箱和密码，马上开始积累单词。'}
          </p>
        </header>

        <div className="mt-5 grid grid-cols-2 rounded-full border border-[var(--ink)] bg-[var(--paper)] p-1">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => switchMode(item)}
              className={`h-10 rounded-full text-sm font-black transition ${
                mode === item
                  ? 'bg-[var(--ink)] text-white'
                  : 'text-[var(--muted)]'
              }`}
            >
              {item === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[var(--ink)]">
              邮箱
            </span>
            <span className="relative block">
              <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
              <input
                ref={emailInputRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-[52px] w-full rounded-2xl border border-[var(--ink)] bg-[var(--paper)] py-3 pl-12 pr-4 text-base font-semibold outline-none transition placeholder:font-normal placeholder:text-[var(--muted)]/65 focus:shadow-[3px_3px_0_var(--ink)]"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-[var(--ink)]">
              密码
            </span>
            <span className="relative block">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 8 位"
                className="h-[52px] w-full rounded-2xl border border-[var(--ink)] bg-[var(--paper)] py-3 pl-12 pr-4 text-base font-semibold outline-none transition placeholder:font-normal placeholder:text-[var(--muted)]/65 focus:shadow-[3px_3px_0_var(--ink)]"
              />
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-[#ba3f32] bg-[#fff0eb] px-3 py-2.5 text-sm font-semibold text-[#982f24]"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-xl border border-[#3d735d] bg-[#e7f5ec] px-3 py-2.5 text-sm font-semibold text-[#285541]"
            >
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-black text-white shadow-[3px_3px_0_var(--coral)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-65"
          >
            {pending
              ? mode === 'login'
                ? '登录中...'
                : '注册中...'
              : mode === 'login'
                ? '登录并继续'
                : '完成注册'}
            {!pending && <ArrowRightIcon className="h-5 w-5" />}
          </button>
        </form>

        {mode === 'login' && (
          <button
            type="button"
            onClick={fillDemoAccount}
            className="mt-4 w-full text-center text-xs font-bold text-[var(--muted)] underline decoration-dashed underline-offset-4 hover:text-[var(--ink)]"
          >
            使用演示账号：demo@wordisland.com / 12345678
          </button>
        )}
      </section>
    </div>
  );
}
