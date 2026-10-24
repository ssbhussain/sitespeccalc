import type { CalculatorId, Faq } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const FORMULA_STEPS: Record<CalculatorId, { name: string; text: string }[]> = {
  "concrete-slab": [
    {
      name: "Measure the slab rectangle",
      text: "Multiply length in feet by width in feet by thickness in feet. Thickness in inches is divided by 12 before the volume is taken.",
    },
    {
      name: "Add only the turn-down below the slab",
      text: "A thickened edge adds the footing band that sits below the slab thickness. The two corner squares are counted once so the perimeter is not double-poured.",
    },
    {
      name: "Convert the order to yards and bags",
      text: "Apply the waste factor to the placed volume, divide cubic feet by 27 for cubic yards, and divide by 0.60 or 0.45 cubic feet for 80 lb and 60 lb bags.",
    },
    {
      name: "Count the rebar grid",
      text: "Place a bar at each end of the length and width, then fill the remaining span at the selected on-center spacing. Two continuous edge bars are added when the turn-down is on.",
    },
  ],
  "wire-size": [
    {
      name: "Apply the continuous-load factor",
      text: "A continuous load uses 125 percent of the nameplate amperes before the conductor ampacity check. Noncontinuous loads use the entered amperes.",
    },
    {
      name: "Select a conductor that carries the load",
      text: "Walk the copper or aluminum ampacity table until one conductor, or parallel sets, meets the adjusted amperes. Temperature derating is not applied.",
    },
    {
      name: "Check voltage drop with the K method",
      text: "Single-phase drop is 2 x K x amperes x one-way feet divided by circular mils. Three-phase drop uses 1.732 in place of 2. K is 12.9 for copper and 21.2 for aluminum.",
    },
    {
      name: "Step up until the drop limit is met",
      text: "If the drop exceeds the selected 3 or 5 percent informational limit, the next larger gauge or another parallel set is tested.",
    },
  ],
  "stair-stringer": [
    {
      name: "Divide the total rise into equal risers",
      text: "The riser count is the total rise divided by the target riser, rounded to the nearest whole number, with a minimum of one riser.",
    },
    {
      name: "Set the exact riser and run",
      text: "Exact riser height is total rise divided by the riser count. The number of treads is one less than the riser count, and the total run is treads times tread depth.",
    },
    {
      name: "Check the IRC stair limits",
      text: "This check flags a riser outside 4 to 7.75 inches or a tread under 10 inches. Headroom and guards are not calculated.",
    },
    {
      name: "Measure the stringer board",
      text: "The stringer diagonal is the hypotenuse of the total rise and total run, plus one riser of extra stock for the bottom cut.",
    },
  ],
  "roof-pitch": [
    {
      name: "Convert pitch to a slope multiplier",
      text: "The multiplier is the square root of 1 plus (rise per 12 divided by 12) squared. A 6/12 pitch uses the square root of 1.25.",
    },
    {
      name: "Find the common rafter length",
      text: "Horizontal run is half the span for a gable, or the full span for a shed, plus the overhang. Rafter length is that run times the multiplier.",
    },
    {
      name: "Read the plumb and seat angles",
      text: "The roof angle is the arctangent of rise over 12. The plumb cut uses that angle and the seat cut is its complement.",
    },
    {
      name: "Estimate squares and sheathing",
      text: "Roof area is the rafter length times the plan length, once for a shed and twice for a gable. Squares are that area divided by 100. Snow load is not sized.",
    },
  ],
  "container-pallet": [
    {
      name: "Fit pallets on the container floor",
      text: "Floor slots use the container's internal length and width against the selected pallet footprint, including the Euro pallet's mixed orientation.",
    },
    {
      name: "Stack only when the cartons allow it",
      text: "A stackable load uses two levels. The pallet count is floor slots times levels, and the carton count is pallets times cartons per pallet.",
    },
    {
      name: "Convert cartons to cubic meters",
      text: "Cargo volume is the carton count times length, width, and height in meters. Dimensional weight is that cubic-meter volume times 167 kilograms.",
    },
    {
      name: "Compare cargo weight with the planning payload",
      text: "Total mass adds carton weight and pallet tare. Billable weight is the greater of actual mass and dimensional weight. The payload figure is a planning limit, not a legal filing.",
    },
  ],
};

export function calculatorJsonLd(options: {
  name: string;
  description: string;
  url: string;
  faqs: Faq[];
  calculator: CalculatorId;
}) {
  const steps = FORMULA_STEPS[options.calculator];
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
        "@type": "HowTo",
        name: options.name,
        description: options.description,
        totalTime: "PT5M",
        tool: [{ "@type": "HowToTool", name: "SiteSpecCalc" }],
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
          url: `${options.url}#step-${index + 1}`,
        })),
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
