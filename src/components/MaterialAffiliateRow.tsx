"use client";

import { useUnits, type Currency } from "@/context/UnitContext";

const AMAZON_HOST: Partial<Record<Currency, string>> = {
  USD: "www.amazon.com",
  GBP: "www.amazon.co.uk",
  CAD: "www.amazon.ca",
  AUD: "www.amazon.com.au",
  EUR: "www.amazon.de",
  INR: "www.amazon.in",
};

export const AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG?.trim() || "sitespeccalc-20";

export function amazonSearchUrl(query: string, currency: Currency) {
  const host = AMAZON_HOST[currency] ?? "www.amazon.com";
  const params = new URLSearchParams({ k: query, tag: AMAZON_AFFILIATE_TAG });
  return `https://${host}/s?${params.toString()}`;
}

export function MaterialAffiliateRow({ query }: { query: string }) {
  const { activeCurrency } = useUnits();
  return (
    <a
      href={amazonSearchUrl(query, activeCurrency)}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className="inline-flex rounded-md border border-amber-400/70 px-2 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-400 hover:text-slate-950"
    >
      Source Spec Material / Tool
    </a>
  );
}
