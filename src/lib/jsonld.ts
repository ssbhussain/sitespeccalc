import type { Faq } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function calculatorJsonLd(options: {
  name: string;
  description: string;
  url: string;
  faqs: Faq[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: options.name,
        applicationCategory: "EngineeringApplication",
        operatingSystem: "Web",
        url: options.url,
        description: options.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: options.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems(options.url),
      },
    ],
  };
}

function breadcrumbItems(url: string) {
  const path = url.replace(SITE_URL, "");
  const parts = path.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ];
  let current = SITE_URL;
  parts.forEach((part, index) => {
    current += `/${part}`;
    items.push({
      "@type": "ListItem",
      position: index + 2,
      name: part.replace(/-/g, " "),
      item: current,
    });
  });
  return items;
}
