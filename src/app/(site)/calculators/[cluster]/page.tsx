import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopLeaderboardAd } from "@/components/AdSlot";
import { mastersForCluster } from "@/data/catalog";
import { getPresetCatalog } from "@/lib/content";
import { CLUSTER_META } from "@/lib/site";

type ClusterParams = { cluster: string };

export function generateStaticParams() {
  return Object.keys(CLUSTER_META).map((cluster) => ({ cluster }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ClusterParams>;
}): Promise<Metadata> {
  const { cluster } = await params;
  if (!(cluster in CLUSTER_META)) return {};
  const meta = CLUSTER_META[cluster as keyof typeof CLUSTER_META];
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function ClusterPage({ params }: { params: Promise<ClusterParams> }) {
  const { cluster } = await params;
  if (!(cluster in CLUSTER_META)) notFound();
  const meta = CLUSTER_META[cluster as keyof typeof CLUSTER_META];
  const masters = mastersForCluster(cluster);
  const masterSlugs = new Set(masters.map((item) => item.slug));
  const presets = (await getPresetCatalog()).filter((preset) => preset.cluster === cluster && !masterSlugs.has(preset.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <TopLeaderboardAd />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">{meta.eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{meta.title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{meta.description}</p>
      {masters.length ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">Master calculators</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {masters.map((master) => (
              <li key={master.slug}>
                <Link href={`/calculators/${master.cluster}/${master.slug}`} className="block rounded-xl border border-slate-700 bg-[#111c31] p-4 hover:border-amber-400">
                  <h3 className="font-display text-xl">{master.h1}</h3>
                  <p className="mt-2 text-sm text-slate-400">{master.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300">
          Freight pages do not invent a fifth formula. They open the slab, wire, stair, or roof calculator on a delivery question: truck loads at 10 cubic yards, bag pallets, rebar pounds, spool weight, and shingle bundles.
        </p>
      )}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">Preset pages</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {presets.map((preset) => (
            <li key={preset.slug}>
              <Link href={`/calculators/${preset.cluster}/${preset.slug}`} className="block rounded-xl border border-slate-700 p-4 hover:border-amber-400">
                <h3 className="font-semibold text-slate-100">{preset.h1}</h3>
                <p className="mt-2 text-sm text-slate-400">{preset.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
