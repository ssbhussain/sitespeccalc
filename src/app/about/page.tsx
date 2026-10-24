import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "How SiteSpecCalc checks slab, wire, stair, and rafter math against published NEC, IRC, and ACI limits.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">About SiteSpecCalc</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
        <p>
          SiteSpecCalc is a set of jobsite calculators for concrete volume, conductor size, stair layout, and common rafters. Every result is a deterministic function in the page. Moving a slider does not call a remote model, and the site is built to run from the preset file in this repository when Supabase is not configured.
        </p>
        <p>
          The editorial check is a comparison of those functions with published limits: IRC R311.7 for risers and treads, IRC R506 for slab-on-ground thickness, the NEC informational notes for 3 percent branch-circuit and 5 percent feeder voltage drop, the 75°C ampacity column, and ACI cover practice for slabs cast against earth. Metric lengths follow the metre and the millimetre as defined for everyday construction conversion, which is the ISO 80000 quantity system the unit badge refers to. That badge is not an accredited ISO 9001 certificate.
        </p>
        <p>
          Preset pages prefill the same engines. A 20 by 20 garage page and the master slab calculator share one volume function, so the diagram, the bag count, and the FAQ cannot drift apart. Freight pages reuse that math for truck loads, pallets, and delivery weight instead of inventing a second set of formulas.
        </p>
        <p>
          What the desk does not do: soil bearing, frost depth, snow, wind, seismic, ampacity derating for ambient temperature or bundling, utility service rules, or a sealed drawing. Those stay with the licensed civil or structural engineer, the electrician, and the inspector who can see the site. Read the <Link className="text-amber-300" href="/engineering-disclaimer">engineering disclaimer</Link> before you order material.
        </p>
        <p>
          Prices are planning numbers you can edit, stored as US dollars. The header currency converts those dollars with a fixed snapshot from 24 October 2026, so the page does not call a live exchange feed. Switching currency or pounds versus kilograms does not change volumes, bag counts, wire size, riser height, or rafter length. Ready-mix, bag, wire, and lumber prices still move by market and by region.
        </p>
      </div>
    </article>
  );
}
