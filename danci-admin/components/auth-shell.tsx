import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f1e6] px-5 py-12 text-[#111111]">
      <div className="pointer-events-none absolute left-[7%] top-[9%] hidden h-24 w-24 border border-black/25 lg:block" aria-hidden="true">
        <span className="absolute -bottom-3 -right-3 size-6 border border-black/35 bg-[#f5f1e6]" />
      </div>
      <div className="pointer-events-none absolute bottom-[10%] right-[8%] hidden size-28 rounded-full border border-black/25 lg:block" aria-hidden="true">
        <span className="absolute left-1/2 top-0 h-full w-px bg-black/20" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-black/20" />
      </div>
      <div className="pointer-events-none absolute right-[15%] top-[12%] h-px w-28 bg-black/25" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[16%] left-[13%] h-20 w-px bg-black/25" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-[500px]">
        <div className="mb-4 flex items-center gap-3 px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/55">
          <span className="h-px flex-1 bg-black/30" />
          Ciyu Administration
          <span className="h-px flex-1 bg-black/30" />
        </div>

        <div className="border-2 border-black bg-[#fff1ae] p-6 shadow-[9px_9px_0_#111111] sm:p-9">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3" aria-label="返回词屿首页">
            <BrandMark className="size-10 rounded-none shadow-none" />
            <div className="border-l border-black/30 pl-3 text-left">
              <p className="text-base font-bold tracking-[0.12em]">词屿</p>
              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-black/50">ADMIN CONSOLE</p>
            </div>
          </Link>

          <div className="my-7 h-px bg-black/25" />

          <header className="mb-7 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">Secure Access</p>
            <h1 className="text-[30px] font-bold tracking-[-0.035em] text-black sm:text-[34px]">{title}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/55">{description}</p>
          </header>

          {children}
        </div>

        <div className="mt-5 flex items-center justify-between px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-black/45">
          <span>© 2026 CIYU</span>
          <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-black" /> System Online</span>
        </div>
      </section>
    </main>
  );
}
