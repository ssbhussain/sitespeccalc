import Link from "next/link";
import { TopLeaderboardAd } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { PresetBrowser } from "@/components/PresetBrowser";
import { MASTERS } from "@/data/catalog";
import { PRESETS } from "@/data/presets";
import { CLUSTER_META, SITE_URL } from "@/lib/site";

const engines = [
  {
    href: "/calculators/concrete-masonry/concrete-slab-rebar-calculator",
    title: "Slab, rebar, and bags",
    copy: "Cubic yards, cubic meters, 60 lb and 80 lb bags, rebar sticks, chairs, and a scaled grid.",
  },
  {
    href: "/calculators/electrical-solar/wire-size-voltage-drop-calculator",
    title: "Wire size and voltage drop",
    copy: "AWG and mm² for copper or aluminum, with end voltage, percent drop, and I²R loss.",
  },
  {
    href: "/calculators/framing-roofing/stair-stringer-layout-calculator",
    title: "Stair stringer layout",
    copy: "Equal risers to the sixteenth, total run, 2x12 length, and an IRC pass or warning.",
  },
  {
    href: "/calculators/framing-roofing/roof-pitch-rafter-calculator",
    title: "Roof pitch and rafters",
    copy: "Pitch angle, rafter length, plumb and seat cuts, squares, bundles, and sheathing.",
  },
];

export default function HomePage() {
  const items = PRESETS.map((preset) => ({
    href: `/calculators/${preset.cluster}/${preset.slug}`,
    title: preset.h1,
    cluster: preset.cluster,
    clusterLabel: CLUSTER_META[preset.cluster].title,
    summary: preset.summary,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SiteSpecCalc",
    url: SITE_URL,
    description: "Visual engineering calculators for concrete, electrical, framing, and material delivery.",
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      <section className="blueprint-grid border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">NEC · IRC · ACI references</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-none text-slate-50 sm:text-6xl">
            Jobsite math you can scale, print, and take to the yard.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            SiteSpecCalc runs four deterministic calculators in the browser. Change a dimension and the blueprint, the bill of materials, and the side-by-side comparison move with it. Imperial units cover feet, inches, cubic yards, pounds, and AWG. Metric covers meters, millimeters, cubic meters, kilograms, and square millimeters.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/calculators/concrete-masonry/concrete-slab-rebar-calculator" className="rounded-md bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950">
              Open the slab calculator
            </Link>
            <Link href="/engineering-disclaimer" className="rounded-md border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-100">
              Read the engineering disclaimer
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <TopLeaderboardAd />
        <div className="grid gap-4 md:grid-cols-2">
          {engines.map((engine) => (
            <Link key={engine.href} href={engine.href} className="rounded-xl border border-slate-700 bg-[#111c31] p-5 hover:border-amber-400">
              <h2 className="font-display text-2xl font-semibold">{engine.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{engine.copy}</p>
            </Link>
          ))}
        </div>
        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Same formula every time</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Volumes, voltage drop, riser counts, and rafter lengths are TypeScript functions. Nothing on a click calls a language model. The optional OpenAI script is an offline seed tool for new pages, not part of the calculator.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Code limits, labeled</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Stair pages flag risers outside 4 to 7.75 inches and treads under 10 inches. Wire pages color the drop at 3 and 5 percent. Slab pages cite the IRC minimum thickness and keep PSI as a specification you price yourself.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{MASTERS.length} engines, {PRESETS.length} presets</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Each preset opens the matching calculator with its own dimensions, a comparison table, engineering notes, and FAQ schema. Freight pages reuse those engines for truck loads, pallets, and spool weight.
            </p>
          </div>
        </section>
        <PresetBrowser items={items} />
      </div>
    </div>
  );
}
