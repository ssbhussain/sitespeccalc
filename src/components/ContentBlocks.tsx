import type { Faq } from "@/lib/types";
import { sanitizeHtml } from "@/lib/content";

export function EngineeringNotes({ html }: { html: string }) {
  return (
    <section className="prose-spec mt-8 rounded-xl border border-slate-700 bg-[#111c31] p-5">
      <h2 className="font-display text-2xl font-semibold text-slate-50">Engineering notes</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    </section>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl font-semibold text-slate-50">Field questions</h2>
      <dl className="mt-4 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border border-slate-700 bg-[#111c31] p-4">
            <dt className="font-semibold text-slate-100">{faq.question}</dt>
            <dd className="mt-2 text-sm leading-6 text-slate-300">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
