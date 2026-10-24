"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  CURRENCY_REGIONS,
  FX_AS_OF,
  currenciesInRegion,
  useUnits,
  type Currency,
  type WeightUnit,
} from "@/context/UnitContext";

const LINKS = [
  { href: "/calculators/concrete-masonry", label: "Concrete" },
  { href: "/calculators/electrical-solar", label: "Electrical" },
  { href: "/calculators/framing-roofing", label: "Framing" },
  { href: "/calculators/freight-logistics", label: "Freight" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { system, setSystem, weight, setWeight, currency, setCurrency } = useUnits();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-700/80 bg-[#0b1220]/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <BrandLogo compact />
        <nav className="ml-4 hidden items-center gap-4 text-sm font-medium text-slate-300 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-amber-300">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-md border border-slate-600 p-0.5 text-[11px] font-semibold uppercase tracking-wide" role="group" aria-label="Length and volume units">
            <button
              type="button"
              aria-pressed={system === "imperial"}
              onClick={() => setSystem("imperial")}
              className={`rounded px-2 py-1 ${system === "imperial" ? "bg-amber-400 text-slate-950" : "text-slate-300"}`}
            >
              Imperial
            </button>
            <button
              type="button"
              aria-pressed={system === "metric"}
              onClick={() => setSystem("metric")}
              className={`rounded px-2 py-1 ${system === "metric" ? "bg-amber-400 text-slate-950" : "text-slate-300"}`}
            >
              Metric
            </button>
          </div>
          <div className="flex rounded-md border border-slate-600 p-0.5 text-[11px] font-semibold uppercase tracking-wide" role="group" aria-label="Weight unit">
            {(["lb", "kg"] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                aria-pressed={weight === unit}
                onClick={() => setWeight(unit as WeightUnit)}
                className={`rounded px-2 py-1 ${weight === unit ? "bg-amber-400 text-slate-950" : "text-slate-300"}`}
              >
                {unit}
              </button>
            ))}
          </div>
          <select
            aria-label={`Display currency. Planning rates from US dollars as of ${FX_AS_OF}. Does not change quantities.`}
            title={`Planning rates from USD, snapshot ${FX_AS_OF}. Volumes, counts, and sizes stay the same.`}
            value={currency}
            onChange={(event) => setCurrency(event.target.value as Currency)}
            className="max-w-[16rem] rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-100"
          >
            {CURRENCY_REGIONS.map((region) => (
              <optgroup key={region} label={region}>
                {currenciesInRegion(region).map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.code} · {entry.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            className="rounded-md border border-slate-600 p-2 text-slate-200 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-slate-800 px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-2 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-slate-200 hover:bg-slate-800">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <p className="sr-only">
        {`Length ${system}. Weight ${weight}. Currency ${currency}. Weight uses 1 lb = 0.45359237 kg. Currency converts US-dollar planning prices and does not change volumes, counts, or geometry.`}
      </p>
    </header>
  );
}
