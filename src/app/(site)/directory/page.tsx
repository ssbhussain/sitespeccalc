import type { Metadata } from "next";
import Link from "next/link";
import { MASTERS } from "@/data/catalog";
import { getPresetCatalog } from "@/lib/content";
import { CLUSTER_META, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Engineering Specs and Calculators",
  description:
    "HTML directory of every SiteSpecCalc calculator and programmatic engineering spec, grouped by trade.",
  alternates: { canonical: `${SITE_URL}/directory` },
};

export default async function DirectoryPage() {
  const presets = await getPresetCatalog();
  const clusters = Object.keys(CLUSTER_META) as (keyof typeof CLUSTER_META)[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">Crawl directory</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">All 120+ Engineering Specs & Calculators</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
        Every calculator and programmatic spec on SiteSpecCalc, grouped by trade. Each link is one click from this page and two clicks from the homepage.
      </p>
      <div className="mt-8 space-y-10">
        {clusters.map((cluster) => {
          const meta = CLUSTER_META[cluster];
          const masters = MASTERS.filter((item) => item.cluster === cluster);
          const pages = presets
            .filter((item) => item.cluster === cluster)
            .slice()
            .sort((a, b) => a.h1.localeCompare(b.h1));
          const seen = new Set(masters.map((item) => item.slug));
          const rest = pages.filter((item) => !seen.has(item.slug));
          return (
            <section key={cluster}>
              <h2 className="font-display text-2xl font-semibold">
                <Link href={`/calculators/${cluster}`} className="hover:text-amber-300">
                  {meta.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-slate-400">{meta.description}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {masters.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/calculators/${item.cluster}/${item.slug}`} className="text-sm font-semibold text-amber-200 hover:text-amber-300">
                      {item.h1}
                    </Link>
                  </li>
                ))}
                {rest.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/calculators/${item.cluster}/${item.slug}`} className="text-sm text-slate-200 hover:text-amber-300">
                      {item.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
