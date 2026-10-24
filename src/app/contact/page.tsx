import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the SiteSpecCalc desk about a formula, a preset, or a correction.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Contact</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
        <p>
          Formula questions, a wrong preset, and privacy requests go to hello@sitespeccalc.com. Include the page URL, the inputs you used, and the result you expected. The form below only opens your own email program. It is not stored on this site.
        </p>
        <p>
          We cannot seal a drawing or tell you that a slab, a feeder, or a stair is legal on your lot. Take the printed sheet to the engineer, electrician, or inspector who has that authority.
        </p>
      </div>
      <ContactForm />
    </article>
  );
}
