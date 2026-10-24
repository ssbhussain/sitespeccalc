"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface BrowserItem {
  href: string;
  title: string;
  cluster: string;
  clusterLabel: string;
  summary: string;
}

export function PresetBrowser({ items }: { items: BrowserItem[] }) {
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("all");
  const clusters = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) map.set(item.cluster, item.clusterLabel);
    return [...map.entries()];
  }, [items]);
  const filtered = items.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase().trim());
    const matchesCluster = cluster === "all" || item.cluster === cluster;
    return matchesQuery && matchesCluster;
  });

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold">Preset jobs</h2>
          <p className="mt-1 text-sm text-slate-400">{filtered.length} indexable calculator pages with the inputs already filled.</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search garage, EV, stringer, 6/12..."
          aria-label="Search presets"
          className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm sm:max-w-xs"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCluster("all")} className={`rounded-full px-3 py-1 text-xs font-semibold ${cluster === "all" ? "bg-amber-400 text-slate-950" : "border border-slate-600 text-slate-300"}`}>
          All
        </button>
        {clusters.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setCluster(id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${cluster === id ? "bg-amber-400 text-slate-950" : "border border-slate-600 text-slate-300"}`}>
            {label}
          </button>
        ))}
      </div>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {filtered.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block rounded-xl border border-slate-700 bg-[#111c31] p-4 hover:border-amber-400">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">{item.clusterLabel}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-slate-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
