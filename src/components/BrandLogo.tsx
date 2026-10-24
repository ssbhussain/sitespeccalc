import Link from "next/link";

export function IconMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="1" />
      <path d="M8 1.5V30.5M16 1.5V30.5M24 1.5V30.5M1.5 8H30.5M1.5 16H30.5M1.5 24H30.5" stroke="#1E293B" strokeWidth="0.6" />
      <path d="M7 6.5V25H25.5" fill="none" stroke="#F8FAFC" strokeWidth="1.7" strokeLinecap="square" />
      <path d="M11 25V27.4M15 25V27.4M19 25V27.4M23 25V27.4M7 21H4.6M7 17H4.6M7 13H4.6M7 9H4.6" stroke="#F8FAFC" strokeWidth="0.8" />
      <path d="M10.5 22.5L22.5 10.5" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
      <path d="M16.5 16.5V22.5" fill="none" stroke="#F59E0B" strokeWidth="1.25" />
      <polygon points="18.2,10.2 21.2,11.1 18.6,13.2 20.6,13.6 15.6,18.4 17.2,14.6 15.2,14.2" fill="#F59E0B" />
    </svg>
  );
}

export function BrandLogo({
  tone = "dark",
  compact = false,
}: {
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  const spec = tone === "dark" ? "text-[#F8FAFC]" : "text-[#0F172A]";
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="SiteSpecCalc home">
      <span className="rounded-md border border-slate-600 bg-[#0F172A] p-0.5">
        <IconMark size={compact ? 32 : 40} />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-[1.65rem] font-bold tracking-tight ${spec}`}>
          SiteSpec<span className="text-[#F59E0B]">Calc</span>
        </span>
        {compact ? null : (
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            NEC • IRC • ISO VERIFIED
          </span>
        )}
      </span>
    </Link>
  );
}
