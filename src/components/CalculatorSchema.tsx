import { JsonLd } from "@/components/JsonLd";
import { calculatorJsonLd } from "@/lib/jsonld";
import type { CalculatorId, Faq } from "@/lib/types";

export function CalculatorSchema({
  name,
  description,
  url,
  faqs,
  calculator,
}: {
  name: string;
  description: string;
  url: string;
  faqs: Faq[];
  calculator: CalculatorId;
}) {
  return <JsonLd data={calculatorJsonLd({ name, description, url, faqs, calculator })} />;
}
