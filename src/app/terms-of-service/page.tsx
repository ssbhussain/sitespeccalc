import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for the SiteSpecCalc calculators and preset pages.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Terms of service</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
        <p>
          By using SiteSpecCalc you agree to these terms. If you do not agree, do not use the site. The calculators are free reference tools. They are not a contract for engineering, electrical design, or construction.
        </p>
        <p>
          You may use the pages for your own estimating and for linking or quoting short excerpts with attribution. You may not scrape the site in a way that degrades service, present the output as a stamped drawing, or remove the disclaimer from a copy you redistribute as your own product.
        </p>
        <p>
          Quantities, code notes, and prices are estimates. Local amendments, the utility, and the product manufacturer control the work. See the <Link className="text-amber-300" href="/engineering-disclaimer">engineering disclaimer</Link>. The site is provided as available, without a warranty of fitness for a particular building, and without liability for material you order or work you build from a result.
        </p>
        <p>
          To the extent the law allows a limit, liability for use of the site is limited to zero dollars, because the tools are offered at no charge. Some places do not allow that limit, and in those places the limit is the smallest the law allows.
        </p>
        <p>
          These terms are governed by the laws of the United States that apply to the operator, without regard to conflict-of-law rules. If a provision is unenforceable, the rest remains. We may update the terms by posting a new version on this page.
        </p>
        <p>Questions: hello@sitespeccalc.com.</p>
      </div>
    </article>
  );
}
