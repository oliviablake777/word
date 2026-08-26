import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow-[4px_4px_0_rgba(17,17,17,0.16)]",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute -right-2 -top-3 size-7 rounded-full border border-white/35" />
      <span className="text-lg font-semibold leading-none">词</span>
    </div>
  );
}
