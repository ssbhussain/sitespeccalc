export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sitespeccalc.com"
).replace(/\/$/, "");

export const SITE_NAME = "SiteSpecCalc";

export const CLUSTER_META = {
  "concrete-masonry": {
    title: "Concrete & Masonry",
    eyebrow: "Volume, rebar, bags, and trucks",
    description:
      "Slab volume, thickened-edge footings, rebar grids, bag counts, and ready-mix truck loads with a live footprint diagram.",
  },
  "electrical-solar": {
    title: "Electrical, EV & Solar",
    eyebrow: "AWG, mm², and voltage drop",
    description:
      "Copper and aluminum wire size, NEC voltage-drop checks, end-of-line voltage, and I²R loss for branch circuits and feeders.",
  },
  "framing-roofing": {
    title: "Structural Framing & Wood",
    eyebrow: "Stringers and rafters",
    description:
      "IRC stair layout to the sixteenth of an inch, plus common-rafter length, pitch, sheathing, and shingle quantities.",
  },
  "freight-logistics": {
    title: "Freight & Logistics",
    eyebrow: "Haul weight and truck class",
    description:
      "Container and pallet loading, plus delivery planning for cubic yards, bag pallets, rebar weight, wire spools, and roofing bundles.",
  },
} as const;
