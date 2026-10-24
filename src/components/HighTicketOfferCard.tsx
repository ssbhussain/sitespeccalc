"use client";

import { amazonSearchUrl } from "@/components/MaterialAffiliateRow";
import { useUnits } from "@/context/UnitContext";
import type { CalculatorId } from "@/lib/types";

const linkClass =
  "inline-flex rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300";
const secondaryClass =
  "inline-flex rounded-md border border-amber-400/70 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-400 hover:text-slate-950";

function partnerHref(configured: string | undefined, search: string, currency: Parameters<typeof amazonSearchUrl>[1]) {
  const url = configured?.trim();
  return url || amazonSearchUrl(search, currency);
}

export function HighTicketOfferCard({ calculator }: { calculator: CalculatorId }) {
  const { activeCurrency } = useUnits();
  const solar = partnerHref(process.env.NEXT_PUBLIC_SOLAR_AFFILIATE_URL, "EcoFlow Renogy solar generator backup kit", activeCurrency);
  const contractor = partnerHref(
    process.env.NEXT_PUBLIC_CONTRACTOR_LEAD_URL,
    calculator === "wire-size" ? "EV charger electrical installation" : "ready mix concrete roofing contractor equipment",
    activeCurrency,
  );
  const freight = partnerHref(process.env.NEXT_PUBLIC_FREIGHT_AFFILIATE_URL, "commercial freight scale pallet jack", activeCurrency);

  if (calculator === "wire-size") {
    return (
      <Offer
        title="DIY Solar & Backup Power Kits"
        body="Compare EcoFlow, Renogy, and A1 Solar Store backup kits, then request certified local EV and electrical installer quotes for the circuit you just sized."
        primaryHref={solar}
        primaryLabel="Compare solar and backup kits"
        secondaryHref={contractor}
        secondaryLabel="Compare Certified Local EV/Electrical Installer Quotes"
      />
    );
  }

  if (calculator === "container-pallet") {
    return (
      <Offer
        title="Compare Instant Commercial Ocean & LTL Freight Rates"
        body="Use the pallet count, cubic meters, and billable weight from this sheet when you request ocean and LTL freight rates."
        primaryHref={freight}
        primaryLabel="Compare Instant Commercial Ocean & LTL Freight Rates"
      />
    );
  }

  return (
    <Offer
      title="Ordering 3+ Cubic Yards or Full Roof Package? Compare Local Ready-Mix & Contractor Quotes"
      body="Take this quantity sheet to a ready-mix plant or framing and roofing contractor and compare local quotes before you order."
      primaryHref={contractor}
      primaryLabel="Compare Local Ready-Mix & Contractor Quotes"
    />
  );
}

function Offer({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <aside className="mt-4 rounded-xl border border-amber-400/40 bg-[#111c31] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">Project quote</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-slate-50">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={primaryHref} target="_blank" rel="sponsored nofollow noopener noreferrer" className={linkClass}>
          {primaryLabel}
        </a>
        {secondaryHref && secondaryLabel ? (
          <a href={secondaryHref} target="_blank" rel="sponsored nofollow noopener noreferrer" className={secondaryClass}>
            {secondaryLabel}
          </a>
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        Partner and product-search links may earn a commission. They do not change the quantities in the table above.
      </p>
    </aside>
  );
}
