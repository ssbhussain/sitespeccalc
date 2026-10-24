import { FORMULA_VERSION, type Preset } from "@/lib/types";

const version = FORMULA_VERSION;

export const MASTERS: Preset[] = [
  {
    calculator: "concrete-slab",
    calculatorSlug: "concrete-slab-rebar-calculator",
    cluster: "concrete-masonry",
    slug: "concrete-slab-rebar-calculator",
    h1: "Concrete Slab, Rebar, and Bag Calculator",
    metaTitle: "Concrete Slab Rebar Calculator",
    metaDescription:
      "Calculate slab cubic yards, cubic meters, 60 lb and 80 lb bags, rebar sticks, chairs, and ready-mix cost with a live scaled grid.",
    summary:
      "Size a slab-on-ground, optional turn-down edge, and a rebar mat. Compare bagged concrete with a ready-mix truck before you order.",
    engineeringNotesHtml:
      "<p>Volume is length times width times thickness, plus the extra concrete in a thickened edge below the slab. Bag counts use 0.60 cubic feet per 80 lb bag and 0.45 cubic feet per 60 lb bag. Rebar quantity is an on-center grid with a bar at each end of the layout, and two continuous edge bars when the turn-down is on. Waste is applied to the order quantity, not to the placed volume.</p><p>Enter the plant price for the PSI you selected. A short-load fee is suggested under 4 cubic yards and can be edited or set to zero. This is an estimate of material quantity, not a soil, frost, or structural design.</p>",
    codeReference:
      "IRC R506.1 minimum slab-on-ground thickness, ACI 318 cover and reinforcement practice, and ACI 302 guidance for slabs on ground. Confirm the adopted local edition.",
    faqs: [
      {
        question: "How does the calculator convert cubic feet to cubic yards?",
        answer:
          "Placed volume in cubic feet is divided by 27. The order quantity multiplies that volume by the selected waste factor before the yard, meter, and bag conversions.",
      },
      {
        question: "Does a thicker edge add concrete that is already inside the slab?",
        answer:
          "Only the depth below the slab thickness is added, and the corner squares of the footing band are counted once. The slab rectangle already includes the top of the edge.",
      },
      {
        question: "Can I use the bag count as a structural specification?",
        answer:
          "No. PSI, thickness, and rebar size still have to be accepted by the local building official and, where required, a licensed engineer.",
      },
    ],
    formulaVersion: version,
    comparison: { kind: "thickness", inches: [4, 5, 6, 8] },
    defaultInputs: {
      lengthFt: 20,
      widthFt: 20,
      thicknessIn: 4,
      thickenedEdge: false,
      footingWidthIn: 12,
      footingDepthIn: 12,
      rebarSize: "4",
      spacingIn: 18,
      psi: 4000,
      waste: 0.1,
      readyMixPerYd3: 165,
      bag80Price: 6.75,
      bag60Price: 5.4,
    },
  },
  {
    calculator: "wire-size",
    calculatorSlug: "wire-size-voltage-drop-calculator",
    cluster: "electrical-solar",
    slug: "wire-size-voltage-drop-calculator",
    h1: "Wire Size and Voltage Drop Calculator",
    metaTitle: "Wire Size Voltage Drop Calculator",
    metaDescription:
      "Find the minimum copper or aluminum conductor in AWG and mm² for ampacity and NEC voltage drop, with end voltage and watts lost.",
    summary:
      "Check a branch circuit or feeder for ampacity and voltage drop. The diagram is a one-line from the panel, through the conduit, to the load.",
    engineeringNotesHtml:
      "<p>Voltage drop uses the approximate K method: 2 × K × I × D / cmil for single phase and 1.732 × K × I × D / cmil for three phase. K is 12.9 for copper and 21.2 for aluminum. D is the one-way run in feet. Ampacity is the 75°C column, with the small-conductor limits of 15 A, 20 A, and 30 A on 14, 12, and 10 AWG copper.</p><p>A continuous load is sized at 125 percent for ampacity. Voltage drop is calculated at the operating current. The tool does not apply ambient, bundling, or rooftop derating, and it does not replace the utility or the authority having jurisdiction for service conductors.</p>",
    codeReference:
      "NEC 210.19(A) Informational Note for 3 percent branch-circuit drop, NEC 215.2(A) Informational Note for feeder drop, Chapter 9 Table 8 conductor properties, and Table 310.16 ampacity. Confirm the adopted NEC edition.",
    faqs: [
      {
        question: "Why do some runs need a larger wire than the breaker size?",
        answer:
          "Ampacity only keeps the conductor within its temperature limit. A long run can still lose more than 3 or 5 percent of the source voltage, so the calculator steps up until both checks pass.",
      },
      {
        question: "What does the color on the voltage-drop result mean?",
        answer:
          "Green is 3 percent or less, amber is between 3 and 5 percent, and red is over 5 percent. Those bands follow the common NEC informational notes for branch circuits and feeders.",
      },
      {
        question: "Does the cost include labor or conduit fill?",
        answer:
          "No. The estimate is material only: current-carrying conductors, a smaller equipment ground allowance, and the selected conduit at an editable price per foot.",
      },
    ],
    formulaVersion: version,
    comparison: { kind: "distance", feet: [50, 75, 100] },
    defaultInputs: {
      system: "1ph-240",
      material: "copper",
      amps: 50,
      distanceFt: 75,
      maxDropPct: 3,
      conduit: "EMT",
      continuous: true,
      loadLabel: "EV charger",
    },
  },
  {
    calculator: "stair-stringer",
    calculatorSlug: "stair-stringer-layout-calculator",
    cluster: "framing-roofing",
    slug: "stair-stringer-layout-calculator",
    h1: "Stair Stringer Layout Calculator",
    metaTitle: "Stair Stringer Layout Calculator",
    metaDescription:
      "Lay out risers, treads, stringer length, 2x12 stock, and IRC riser and tread checks with a scaled side-profile blueprint.",
    summary:
      "Turn a floor-to-floor rise into an equal riser, a total run, a diagonal stringer, and the framing-square settings.",
    engineeringNotesHtml:
      "<p>The riser count is the total rise divided by the target rise, rounded to the nearest whole riser. Every riser is then the same height, so the layout variation is zero before field error. Treads are one fewer than risers for a stair between two levels. Total run is tread count times tread depth. The diagonal is the hypotenuse of the stringer rise and the total run.</p><p>A dropped header subtracts the deck or landing thickness from the stringer rise so the board lands under the walking surface. Throat is estimated on a 11.25 in 2x12. Stringers are placed at 16 in on center, with one at each side.</p>",
    codeReference:
      "IRC R311.7.5.1 maximum 7.75 in riser and R311.7.5.2 minimum 10 in tread depth. Riser-to-riser variation in the code is 3/8 in; this layout divides the rise equally. Confirm local amendments and guards.",
    faqs: [
      {
        question: "Why is the tread count one less than the riser count?",
        answer:
          "The upper floor is the last riser. A stair from a lower floor to an upper floor has one more riser than the number of treads you cut into the stringer.",
      },
      {
        question: "What should I set on the framing square?",
        answer:
          "Set the rise gauge to the exact individual riser and the run gauge to the tread depth. Both are shown on the blueprint after you change the inputs.",
      },
      {
        question: "What if the riser is over 7.75 inches?",
        answer:
          "The badge turns to a warning and the result shows the riser count that would land at or under 7.75 inches. Add that riser and shorten the target, then recheck headroom and the total run.",
      },
    ],
    formulaVersion: version,
    comparison: { kind: "target-rise", inches: [7, 7.25, 7.5, 7.75] },
    defaultInputs: {
      totalRiseIn: 72,
      targetRiseIn: 7.5,
      treadIn: 10.5,
      widthIn: 36,
      mount: "standard",
      landingThicknessIn: 1.5,
    },
  },
  {
    calculator: "roof-pitch",
    calculatorSlug: "roof-pitch-rafter-calculator",
    cluster: "framing-roofing",
    slug: "roof-pitch-rafter-calculator",
    h1: "Roof Pitch and Common Rafter Calculator",
    metaTitle: "Roof Pitch Rafter Length Calculator",
    metaDescription:
      "Convert pitch to degrees, rafter length, plumb and seat cuts, roofing squares, shingle bundles, and 4x8 sheathing sheets.",
    summary:
      "Measure a gable or shed roof from span, length, pitch, and eave overhang. The truss triangle scales as you move the pitch.",
    engineeringNotesHtml:
      "<p>Pitch angle is the arctangent of rise over 12. The pitch multiplier is the square root of 1 plus rise-over-12 squared. On a gable, the rafter run is half the span minus half the ridge thickness. The common rafter length multiplies run plus horizontal overhang by the multiplier. A shed uses the full span as the run and adds overhang at both the low eave and the high side.</p><p>Shingle bundles are 3 per square plus 10 percent waste. Sheathing is 4x8 sheets at 32 square feet with 10 percent waste. Underlayment rolls are counted at 360 square feet effective on a 400 square foot roll. Ridge cap is estimated at 25 feet per bundle on gables.</p>",
    codeReference:
      "IRC R802 for wood roof framing and R905 for roof coverings. Pitch, span, and overhang still have to satisfy local snow, wind, and tie-down rules. This page does not size rafters for load.",
    faqs: [
      {
        question: "What is the difference between plumb cut and seat cut?",
        answer:
          "The plumb cut matches the roof angle and is the vertical cut at the ridge. The seat cut is the complementary angle, 90 degrees minus the pitch angle, and it sits level on the wall plate.",
      },
      {
        question: "Does the rafter length include the tail?",
        answer:
          "Yes. The reported common rafter length includes the body to the ridge face and the tail past the plate. The tail length is also listed on its own.",
      },
      {
        question: "Are the shingle bundles a manufacturer takeoff?",
        answer:
          "They are a planning count at 3 bundles per 100 square feet plus 10 percent waste. Hip, valley, starter, and waste at cut edges can change the order.",
      },
    ],
    formulaVersion: version,
    comparison: { kind: "pitch", risePer12: [4, 6, 8, 12] },
    defaultInputs: {
      spanFt: 24,
      lengthFt: 40,
      pitchRise: 6,
      overhangFt: 1,
      ridgeIn: 1.5,
      style: "gable",
    },
  },
  {
    calculator: "container-pallet",
    calculatorSlug: "container-pallet-weight-calculator",
    cluster: "freight-logistics",
    slug: "container-pallet-weight-calculator",
    h1: "Pallet, Container CBM, and Dimensional Weight Calculator",
    metaTitle: "Container Pallet CBM and Dimensional Weight Calculator",
    metaDescription:
      "Fit US, Euro, and UK pallets in a 20 ft, 40 ft, 40 ft high-cube, or 53 ft trailer. Compare CBM, payload, dimensional weight, and freight cost.",
    summary:
      "Lay cartons on a pallet, then pack those pallets on the container floor. The plan shows slots, payload against the planning limit, and billable weight in the selected currency.",
    engineeringNotesHtml:
      "<p>Floor slots are a non-overlapping grid inside the published internal length and width. The better of a single orientation and a two-column mix is kept. A 1200 by 800 mm Euro pallet is 11 slots in a 20 ft dry container and 25 in a 40 ft dry container. Carton count is that slot count times the layers that fit above a 150 mm deck.</p><p>Volumetric weight uses 167 kg per cubic meter of carton cube. Billable weight is the greater of that figure and the actual payload, including pallet tare. Payload limits are planning numbers: typical ISO payloads for the dry boxes and 45,000 lb for the 53 ft trailer. They are not a booking confirmation.</p>",
    codeReference:
      "ISO internal planning dimensions for 20 ft and 40 ft dry containers, plus a 52 ft 6 in by 98.5 in US trailer interior. Confirm the carrier's payload and the IMDG or road limit before you book.",
    faqs: [
      {
        question: "Why is billable weight sometimes higher than the scale weight?",
        answer:
          "The volumetric weight is the carton cube times 167 kg per cubic meter. Light freight is billed on that figure when it exceeds the actual kilograms.",
      },
      {
        question: "Does double stacking always double the pallet count?",
        answer:
          "Only when the stackable control is on and two pallet levels fit under the internal height with 50 mm of clearance. A tall carton stays one high.",
      },
      {
        question: "Is the payload limit a legal guarantee?",
        answer:
          "No. It is a planning limit for the selected box. Axle laws, the container tare, and the booking can be lower.",
      },
    ],
    formulaVersion: version,
    comparison: { kind: "container", ids: ["20ft", "40ft", "40hc", "53ft"] },
    defaultInputs: {
      container: "40ft",
      pallet: "gma",
      customPalletLengthIn: 48,
      customPalletWidthIn: 40,
      boxLengthIn: 16,
      boxWidthIn: 12,
      boxHeightIn: 12,
      boxWeightLb: 30,
      stackable: true,
      rateBasis: "cbm",
      rateUsd: 85,
    },
  },
];

export function mastersForCluster(cluster: string) {
  return MASTERS.filter((item) => item.cluster === cluster);
}
