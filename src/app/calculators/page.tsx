import type { Metadata } from "next";
import Link from "next/link";
import { MASTERS } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Calculators",
  description: "Concrete, electrical, framing, and freight calculators with live SVG blueprints.",
};

export default function CalculatorsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold">Calculators</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        Four master engines and the cluster hubs that hold the preset jobs. Every number on a page comes from the same functions as the master calculator.
      </p>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {MASTERS.map((master) => (
          <li key={master.slug}>
            <Link href={`/calculators/${master.cluster}/${master.slug}`} className="block rounded-xl border border-slate-700 p-4 hover:border-amber-400">
              <h2 className="font-display text-2xl">{master.h1}</h2>
              <p className="mt-2 text-sm text-slate-400">{master.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        <li><Link className="text-amber-300" href="/calculators/concrete-masonry">Concrete hub</Link></li>
        <li><Link className="text-amber-300" href="/calculators/electrical-solar">Electrical hub</Link></li>
        <li><Link className="text-amber-300" href="/calculators/framing-roofing">Framing hub</Link></li>
        <li><Link className="text-amber-300" href="/calculators/freight-logistics">Freight hub</Link></li>
      </ul>
    </div>
  );
}
