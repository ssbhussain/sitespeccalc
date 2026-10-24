"use client";

import { Printer } from "lucide-react";
import type { ReactNode } from "react";
import { MaterialAffiliateRow } from "@/components/MaterialAffiliateRow";
import { asNumber } from "@/lib/engineering/format";
import { useUnits } from "@/context/UnitContext";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300"
    >
      <Printer size={18} aria-hidden="true" />
      Print / Save Jobsite Spec Sheet & Shopping List (PDF)
    </button>
  );
}

export function PrintSignoff({ project }: { project: string }) {
  return (
    <section className="print-only mt-6 border border-slate-400 p-4 text-slate-900">
      <h2 className="font-display text-xl font-semibold">Contractor sign-off</h2>
      <p className="mt-2 text-sm">Project: {project}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <p className="border-b border-slate-400 pb-6 text-sm">Prepared by</p>
        <p className="border-b border-slate-400 pb-6 text-sm">Date</p>
        <p className="border-b border-slate-400 pb-6 text-sm">Verified by (PE / electrician / inspector)</p>
        <p className="border-b border-slate-400 pb-6 text-sm">License number</p>
      </div>
      <p className="mt-4 border-b border-slate-400 pb-8 text-sm">Signature</p>
      <p className="mt-3 text-xs">
        This sheet is an estimate for ordering and layout discussion. It is not a sealed design. Confirm the quantities with a licensed local professional and the authority having jurisdiction before you buy or build.
      </p>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs leading-5 text-slate-400">{hint}</span> : null}
    </label>
  );
}

const controlClass =
  "mt-1 w-full rounded-md border border-slate-600 bg-[#0b1220] px-3 py-2 text-base text-slate-50 outline-none focus:border-amber-400";

export function NumberControl({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  const shown = Number.isFinite(value) ? value : min;
  return (
    <div className="mt-1 flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, shown))}
        onChange={(event) => onChange(asNumber(event.target.value, min))}
        className="w-full accent-amber-400"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number(shown.toFixed(4))}
        onChange={(event) => onChange(asNumber(event.target.value, min))}
        className="w-28 rounded-md border border-slate-600 bg-[#0b1220] px-2 py-2 font-mono text-sm text-slate-50"
      />
      <span className="w-10 text-xs font-semibold uppercase text-slate-400">{suffix}</span>
    </div>
  );
}

export function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Stat({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: string }) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${tone ?? "border-slate-700 bg-slate-950/70"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-lg text-amber-200">{value}</p>
      {detail ? <p className="text-xs text-slate-400">{detail}</p> : null}
    </div>
  );
}

export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: { key: string; cells: string[]; highlight?: boolean }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="spec-table w-full min-w-[680px] border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-slate-600 px-2 py-2 font-semibold text-slate-200">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={row.highlight ? "bg-amber-400/10" : undefined}>
              {row.cells.map((cell, index) => (
                <td key={`${row.key}-${index}`} className="border-b border-slate-800 px-2 py-2 font-mono text-slate-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface BomLine {
  item: string;
  net: string;
  waste: string;
  order: string;
  price: ReactNode;
  total: string;
  search: string;
}

export function BomTable({ lines }: { lines: BomLine[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="spec-table w-full min-w-[920px] border-collapse text-left text-sm">
        <caption className="px-3 py-3 text-left font-display text-xl font-semibold text-slate-50">
          Bill of materials and shopping list
        </caption>
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
            <th className="px-3 py-2">Item</th>
            <th className="px-3 py-2">Net</th>
            <th className="px-3 py-2">Waste</th>
            <th className="px-3 py-2">Order</th>
            <th className="px-3 py-2">Unit price</th>
            <th className="px-3 py-2">Line total</th>
            <th className="px-3 py-2">Source Spec Material / Tool</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.item} className="border-t border-slate-800">
              <td className="px-3 py-2 text-slate-100">{line.item}</td>
              <td className="px-3 py-2 font-mono text-slate-200">{line.net}</td>
              <td className="px-3 py-2 font-mono text-slate-300">{line.waste}</td>
              <td className="px-3 py-2 font-mono text-amber-100">{line.order}</td>
              <td className="px-3 py-2">{line.price}</td>
              <td className="px-3 py-2 font-mono text-slate-50">{line.total}</td>
              <td className="px-3 py-2">
                <MaterialAffiliateRow query={line.search} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-3 text-xs leading-5 text-slate-400">
        Source links open a product search on the Amazon storefront for the selected currency. SiteSpecCalc may earn a commission. The link does not change the quantities above.
      </p>
    </div>
  );
}

export function MoneyField({
  label,
  usd,
  onChange,
}: {
  label: string;
  usd: number;
  onChange: (usd: number) => void;
}) {
  const { moneyToDisplay, displayToMoney, activeCurrency, fractionDigits } = useUnits();
  const shown = moneyToDisplay(usd);
  const step = fractionDigits === 0 ? "1" : fractionDigits === 3 ? "0.001" : "0.01";
  return (
    <span className="inline-flex items-center gap-1">
      <input
        aria-label={label}
        type="number"
        min={0}
        step={step}
        value={Number.isFinite(shown) ? Number(shown.toFixed(fractionDigits)) : 0}
        onChange={(event) => onChange(Math.max(0, displayToMoney(asNumber(event.target.value, 0))))}
        className="w-32 rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-slate-50"
      />
      <span className="text-[10px] uppercase text-slate-500">{activeCurrency}</span>
    </span>
  );
}

export function DiagramFrame({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <figure className="rounded-xl border border-slate-700 bg-[#0b1220] p-3 text-slate-100 print:text-slate-900">
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <span>{title}</span>
        <span className="text-amber-300">Live scaled blueprint</span>
      </figcaption>
      {children}
      {note ? <p className="mt-2 text-xs leading-5 text-slate-400">{note}</p> : null}
    </figure>
  );
}

export function FormulaPanel({ children }: { children: ReactNode }) {
  return (
    <details className="mt-6 rounded-xl border border-slate-700 bg-[#111c31] p-4">
      <summary className="cursor-pointer font-semibold text-slate-100">Show the deterministic formula</summary>
      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{children}</div>
    </details>
  );
}
