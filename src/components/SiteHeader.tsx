"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useUnits, type Currency } from "@/context/UnitContext";

const LINKS = [
  { href: "/calculators/concrete-masonry", label: "Concrete" },
  { href: "/calculators/electrical-solar", label: "Electrical" },
  { href: "/calculators/framing-roofing", label: "Framing" },
  { href: "/calculators/freight-logistics", label: "Freight" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { system, setSystem, currency, setCurrency } = useUnits();
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
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-md border border-slate-600 p-0.5 text-[11px] font-semibold uppercase tracking-wide" role="group" aria-label="Unit system">
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
          {system === "metric" ? (
            <select
              aria-label="Display currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
              className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-100"
            >
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
              <option value="INR">INR ₹</option>
            </select>
          ) : (
            <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:inline">USD $</span>
          )}
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
        {system === "imperial" ? "Imperial units: feet, inches, cubic yards, pounds, AWG, US dollars." : "Metric units: meters, millimeters, cubic meters, kilograms, square millimeters, and the selected currency."}
      </p>
    </header>
  );
}
