import type { ReactNode } from "react";

const PLACEHOLDER = "0000000000000000";

function adsenseEnabled() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
  return client.length > 0 && !client.includes(PLACEHOLDER);
}

function SlotFrame({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children?: ReactNode;
}) {
  return (
    <aside className={`ad-slot no-print relative overflow-hidden rounded-lg border border-dashed border-slate-600 bg-slate-950/50 ${className}`} aria-label="Advertisement" data-ad-slot={label}>
      <span className="pointer-events-none absolute left-2 top-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Advertisement
      </span>
      {children}
      {adsenseEnabled() ? (
        <span className="sr-only">Google AdSense client configured. Reserved space stays fixed to protect layout shift.</span>
      ) : null}
    </aside>
  );
}

export function TopLeaderboardAd() {
  return <SlotFrame label="top-leaderboard" className="mb-6 min-h-[60px] w-full md:min-h-[90px]" />;
}

export function InContentMidCalculatorAd() {
  return <SlotFrame label="in-content-mid" className="my-6 min-h-[250px] w-full" />;
}

export function StickySidebarAd() {
  return (
    <div className="no-print sticky top-24">
      <SlotFrame label="sticky-sidebar" className="hidden min-h-[600px] w-full lg:block" />
    </div>
  );
}
