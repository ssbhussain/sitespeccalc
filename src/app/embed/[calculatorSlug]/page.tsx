import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorEngine } from "@/components/calculators/CalculatorEngine";
import { MASTERS } from "@/data/catalog";
import { isEmbedCalculatorSlug } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return MASTERS.map((item) => ({ calculatorSlug: item.calculatorSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ calculatorSlug: string }>;
}): Promise<Metadata> {
  const { calculatorSlug } = await params;
  const page = MASTERS.find((item) => item.calculatorSlug === calculatorSlug);
  if (!page) return {};
  return {
    title: { absolute: `${page.metaTitle} | SiteSpecCalc` },
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/calculators/${page.cluster}/${page.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function EmbedCalculatorPage({
  params,
}: {
  params: Promise<{ calculatorSlug: string }>;
}) {
  const { calculatorSlug } = await params;
  if (!isEmbedCalculatorSlug(calculatorSlug)) notFound();
  const page = MASTERS.find((item) => item.calculatorSlug === calculatorSlug);
  if (!page) notFound();
  const calculatorUrl = `${SITE_URL}/calculators/${page.cluster}/${page.slug}`;

  return (
    <main id="content" className="embed-sheet mx-auto min-h-full max-w-5xl bg-ink px-3 py-4 text-foam">
      <h1 className="font-display text-3xl font-semibold leading-tight">{page.h1}</h1>
      <div className="mt-4">
        <CalculatorEngine page={page} embed />
      </div>
      <footer className="mt-6 border-t border-slate-700 pt-4 text-sm">
        <a href={calculatorUrl} className="font-semibold text-amber-300">
          Interactive Engineering Tool Powered by SiteSpecCalc.com
        </a>
      </footer>
    </main>
  );
}
