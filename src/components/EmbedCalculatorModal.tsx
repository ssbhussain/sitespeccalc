"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/site";

export function EmbedCalculatorModal({ calculatorSlug }: { calculatorSlug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const src = `${SITE_URL}/embed/${calculatorSlug}`;
  const snippet = `<iframe src="${src}" title="SiteSpecCalc calculator" width="100%" height="920" style="border:0" loading="lazy"></iframe><p>Calculator by <a href="${SITE_URL}">SiteSpecCalc.com</a></p>`;

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
  }

  return (
    <div className="no-print mt-6">
      <button
        type="button"
        onClick={() => {
          setCopied(false);
          setOpen(true);
        }}
        className="rounded-md border border-amber-400 px-4 py-3 text-sm font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950"
      >
        Embed This Calculator on Your Website (Free)
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="embed-calculator-title"
            className="w-full max-w-2xl rounded-xl border border-slate-600 bg-[#0b1220] p-5 shadow-2xl"
          >
            <h2 id="embed-calculator-title" className="font-display text-2xl font-semibold text-slate-50">
              Embed This Calculator on Your Website (Free)
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Paste this HTML where you want the interactive calculator. The footer credit stays on the tool.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-amber-100">
              {snippet}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copySnippet()}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950"
              >
                {copied ? "Copied" : "Copy HTML Embed Code"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
