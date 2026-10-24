import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StickySidebarAd, TopLeaderboardAd } from "@/components/AdSlot";
import { EngineeringNotes, FaqList } from "@/components/ContentBlocks";
import { CalculatorEngine } from "@/components/calculators/CalculatorEngine";
import { CalculatorSchema } from "@/components/CalculatorSchema";
import { MASTERS } from "@/data/catalog";
import { findCalculatorPage, getPresetCatalog } from "@/lib/content";
import { CLUSTER_META, SITE_URL } from "@/lib/site";
import type { Preset } from "@/lib/types";

export async function generateStaticParams() {
  const presets = await getPresetCatalog();
  const rows = [
    ...MASTERS.map((item) => ({ cluster: item.cluster, slug: item.slug })),
    ...presets.map((item) => ({ cluster: item.cluster, slug: item.slug })),
  ];
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.cluster}/${row.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cluster: string; slug: string }>;
}): Promise<Metadata> {
  const { cluster, slug } = await params;
  const page = findCalculatorPage(cluster, slug, await getPresetCatalog());
  if (!page) return {};
  return {
    title: { absolute: `${page.metaTitle} | SiteSpecCalc` },
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/calculators/${cluster}/${slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${SITE_URL}/calculators/${cluster}/${slug}`,
    },
  };
}

function relatedLinks(page: Preset, presets: Preset[]) {
  const same = presets.filter((item) => item.calculator === page.calculator && item.slug !== page.slug).slice(0, 6);
  const other = presets.filter((item) => item.calculator !== page.calculator && item.slug !== page.slug);
  const picked: Preset[] = [...same];
  const seen = new Set(picked.map((item) => item.slug));
  for (const calculator of ["concrete-slab", "wire-size", "stair-stringer", "roof-pitch", "container-pallet"] as const) {
    if (calculator === page.calculator) continue;
    const next = other.find((item) => item.calculator === calculator && !seen.has(item.slug));
    if (!next) continue;
    picked.push(next);
    seen.add(next.slug);
  }
  return picked;
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ cluster: string; slug: string }>;
}) {
  const { cluster, slug } = await params;
  const presets = await getPresetCatalog();
  const page = findCalculatorPage(cluster, slug, presets);
  if (!page || !(page.cluster in CLUSTER_META)) notFound();
  const clusterMeta = CLUSTER_META[page.cluster];
  const url = `${SITE_URL}/calculators/${page.cluster}/${page.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CalculatorSchema
        name={page.h1}
        description={page.metaDescription}
        url={url}
        faqs={page.faqs}
        calculator={page.calculator}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <TopLeaderboardAd />
          <nav className="text-xs text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-300">Home</Link>
            <span> / </span>
            <Link href={`/calculators/${page.cluster}`} className="hover:text-amber-300">{clusterMeta.title}</Link>
            <span> / </span>
            <span className="text-slate-200">{page.h1}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">{page.h1}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{page.summary}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">Formula {page.formulaVersion}</p>
          <div className="mt-6">
            <CalculatorEngine key={`${page.cluster}-${page.slug}`} page={page} />
          </div>
          <EngineeringNotes html={page.engineeringNotesHtml} />
          <section className="mt-6 rounded-xl border border-slate-700 bg-[#111c31] p-5">
            <h2 className="font-display text-2xl font-semibold">Code reference</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">{page.codeReference}</p>
          </section>
          <FaqList faqs={page.faqs} />
          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Explore Related Engineering Calculations</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedLinks(page, presets).map((item) => (
                <li key={item.slug}>
                  <Link href={`/calculators/${item.cluster}/${item.slug}`} className="block rounded-xl border border-slate-700 p-4 text-sm text-slate-200 hover:border-amber-400">
                    {item.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
        <aside className="space-y-4">
          <StickySidebarAd />
          <div className="no-print rounded-xl border border-slate-700 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">More in this cluster</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {relatedLinks(page, presets).map((item) => (
                <li key={item.slug}>
                  <Link href={`/calculators/${item.cluster}/${item.slug}`} className="text-slate-200 hover:text-amber-300">
                    {item.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
