import { FORMULA_VERSION, type Comparison, type Preset } from "@/lib/types";

const version = FORMULA_VERSION;
const mix = { readyMixPerYd3: 165, bag80Price: 6.75, bag60Price: 5.4 };
const aci =
  "IRC R506.1 sets a 3.5 in minimum for concrete slab-on-ground floors. Reinforcement cover and spacing follow ACI 318 practice and the local inspector. This quantity takeoff is not a soils or structural design.";
const nec =
  "NEC 210.19(A) and 215.2(A) informational notes recommend 3 percent on a branch circuit and 5 percent total with the feeder. Ampacity follows the 75°C column of Table 310.16 plus the small-conductor limits. Confirm the adopted edition.";
const irc =
  "IRC R311.7.5.1 limits risers to 7.75 in and R311.7.5.2 requires at least a 10 in tread. Confirm local amendments, guards, and headroom.";
const roofCode =
  "IRC R802 covers conventional wood roof framing and R905 covers roof coverings. This page does not size the rafter for snow or wind.";
const freightCode =
  "Floor counts use ISO internal planning dimensions for dry containers and a 52 ft 6 in by 98.5 in trailer interior. Payload limits are planning figures, not a booking or an axle-weight ticket.";

function faqs(items: [string, string][]) {
  return items.map(([question, answer]) => ({ question, answer }));
}

const slabs: [number, number][] = [
  [10, 10],
  [10, 20],
  [12, 12],
  [12, 16],
  [12, 20],
  [14, 14],
  [14, 24],
  [16, 20],
  [16, 24],
  [18, 18],
  [18, 30],
  [20, 24],
  [20, 30],
  [22, 22],
  [24, 24],
  [24, 36],
  [28, 40],
  [30, 30],
  [30, 50],
  [32, 48],
];

const slabPresets: Preset[] = slabs.flatMap(([lengthFt, widthFt]) =>
  [4, 6].map((thicknessIn): Preset => {
    const yards = (lengthFt * widthFt * (thicknessIn / 12)) / 27;
    return {
      calculator: "concrete-slab",
      calculatorSlug: "concrete-slab-rebar-calculator",
      cluster: "concrete-masonry",
      slug: `plan-${lengthFt}x${widthFt}-slab-${thicknessIn}-inch-rebar-bags`,
      h1: `${lengthFt}×${widthFt} Slab at ${thicknessIn} Inches: Rebar, Bags, and Truck`,
      metaTitle: `${lengthFt}x${widthFt} ${thicknessIn} Inch Concrete Slab Calculator`,
      metaDescription: `Calculate a ${lengthFt} by ${widthFt} ft slab at ${thicknessIn} in: cubic yards, 80 lb bags, #4 rebar, and ready-mix cost.`,
      summary: `A ${lengthFt} by ${widthFt} ft pad at ${thicknessIn} in, with the thickness table repeating the takeoff at the other standard depths.`,
      engineeringNotesHtml: `<p>A ${lengthFt} by ${widthFt} ft rectangle at ${thicknessIn} in is about ${yards.toFixed(2)} cubic yards before waste. This page adds 10 percent waste, prices 4,000 PSI ready-mix against 80 lb and 60 lb bags, and lays #4 bar at 18 in on center. The comparison table repeats the same footprint at 4, 5, and 6 in so the extra inch of thickness is only extra volume, not a different grid. Soil bearing, vapor retarder, and joints are not designed here.</p>`,
      codeReference: aci,
      faqs: faqs([
        [`How many cubic yards is a ${lengthFt} by ${widthFt} slab at ${thicknessIn} in before waste?`, `Length times width times thickness in feet, divided by 27, is about ${yards.toFixed(2)} cubic yards. The order line then applies the waste factor on the page.`],
        ["Does the rebar count change when the slab gets thicker?", "No. The grid follows the length, width, and spacing. Thickness changes volume, weight, bags, and the ready-mix price."],
        ["When is a truck cheaper than bags?", "Compare the ready-mix line, including any short-load fee under 4 yards, with the 80 lb bag line. Both use the prices typed on the page."],
      ]),
      formulaVersion: version,
      comparison: { kind: "thickness", inches: [4, 5, 6] } satisfies Comparison,
      defaultInputs: {
        lengthFt,
        widthFt,
        thicknessIn,
        thickenedEdge: false,
        footingWidthIn: 12,
        footingDepthIn: 12,
        rebarSize: "4",
        spacingIn: 18,
        psi: 4000,
        waste: 0.1,
        ...mix,
      },
    };
  }),
);

const wires: {
  slug: string;
  h1: string;
  amps: number;
  distanceFt: number;
  loadLabel: string;
  continuous: boolean;
  material?: "copper" | "aluminum";
  system?: "1ph-120" | "1ph-240" | "1ph-230";
  maxDropPct?: number;
  note: string;
}[] = [
  { slug: "48a-tesla-wall-connector-wire-size-50-feet", h1: "48A Tesla Wall Connector Wire Size at 50 Feet", amps: 48, distanceFt: 50, loadLabel: "Tesla Wall Connector", continuous: true, note: "A 48 A continuous EV load is sized at 125 percent for ampacity, so the conductor is chosen for 60 A, while voltage drop uses the 48 A operating current." },
  { slug: "48a-tesla-wall-connector-wire-size-100-feet", h1: "48A Tesla Wall Connector Wire Size at 100 Feet", amps: 48, distanceFt: 100, loadLabel: "Tesla Wall Connector", continuous: true, note: "At 100 ft the 48 A Wall Connector still uses 60 A for ampacity. The longer one-way run is what pushes the voltage-drop check." },
  { slug: "48a-tesla-wall-connector-wire-size-75-feet", h1: "48A Tesla Wall Connector Wire Size at 75 Feet", amps: 48, distanceFt: 75, loadLabel: "Tesla Wall Connector", continuous: true, note: "Seventy-five feet is the middle of the common garage runs. Ampacity stays on the 125 percent continuous rule. Drop is calculated at 48 A." },
  { slug: "50a-nema-14-50-wire-size-50-feet", h1: "50A NEMA 14-50 Wire Size at 50 Feet", amps: 50, distanceFt: 50, loadLabel: "NEMA 14-50", continuous: false, note: "A 50 A range or EV receptacle at 50 ft is checked at the nameplate current unless you mark it continuous. The 14-50 itself does not change the K-method math." },
  { slug: "50a-nema-14-50-wire-size-100-feet", h1: "50A NEMA 14-50 Wire Size at 100 Feet", amps: 50, distanceFt: 100, loadLabel: "NEMA 14-50", continuous: false, note: "A 100 ft one-way run to a NEMA 14-50 is long enough that voltage drop, not the 50 A breaker, often sets the copper size." },
  { slug: "60a-subpanel-feeder-wire-size-75-feet", h1: "60A Subpanel Feeder Wire Size at 75 Feet", amps: 60, distanceFt: 75, loadLabel: "60A subpanel", continuous: false, maxDropPct: 3, note: "A 60 A subpanel feeder at 75 ft is treated as a feeder. The 3 percent check is the branch-circuit informational note used here as a planning limit, not a feeder-plus-branch total." },
  { slug: "60a-subpanel-feeder-wire-size-copper-vs-aluminum", h1: "60A Subpanel Feeder, Copper versus Aluminum", amps: 60, distanceFt: 60, loadLabel: "60A subpanel", continuous: false, note: "The comparison table switches the 60 A feeder between copper and aluminum at the same 60 ft distance so the size and the cost move together." },
  { slug: "100a-subpanel-feeder-wire-size-50-feet", h1: "100A Subpanel Feeder Wire Size at 50 Feet", amps: 100, distanceFt: 50, loadLabel: "100A subpanel", continuous: false, note: "Fifty feet is short for a 100 A feeder, so ampacity usually governs. The drop percentage is still reported." },
  { slug: "100a-subpanel-feeder-wire-size-100-feet", h1: "100A Subpanel Feeder Wire Size at 100 Feet", amps: 100, distanceFt: 100, loadLabel: "100A subpanel", continuous: false, note: "A 100 A feeder at 100 ft one way is the case where copper often steps up for voltage drop before the 75°C ampacity is exhausted." },
  { slug: "150a-feeder-wire-size-80-feet", h1: "150A Feeder Wire Size at 80 Feet", amps: 150, distanceFt: 80, loadLabel: "150A feeder", continuous: false, maxDropPct: 5, note: "A 150 A feeder uses the 5 percent feeder planning limit on this page. It is not a service calculation and it does not apply the dwelling 310.12 exception." },
  { slug: "150a-feeder-wire-size-aluminum-100-feet", h1: "150A Aluminum Feeder Wire Size at 100 Feet", amps: 150, distanceFt: 100, loadLabel: "150A aluminum feeder", continuous: false, material: "aluminum", maxDropPct: 5, note: "Aluminum at 150 A and 100 ft uses the aluminum K of 21.2 and the 75°C aluminum ampacity column." },
  { slug: "200a-service-entrance-wire-size-25-feet", h1: "200A Service Entrance Wire Size at 25 Feet", amps: 200, distanceFt: 25, loadLabel: "200A service", continuous: false, material: "aluminum", maxDropPct: 3, note: "A short 200 A service lateral is an ampacity problem. This page does not auto-apply the NEC 310.12 dwelling exception." },
  { slug: "200a-service-entrance-wire-size-75-feet", h1: "200A Service Entrance Wire Size at 75 Feet", amps: 200, distanceFt: 75, loadLabel: "200A service", continuous: false, material: "aluminum", maxDropPct: 3, note: "Seventy-five feet of 200 A aluminum is long for a service lateral. Read both the ampacity size and the drop before you buy the lateral." },
  { slug: "30a-rv-hookup-wire-size-50-feet", h1: "30A RV Hookup Wire Size at 50 Feet", amps: 30, distanceFt: 50, loadLabel: "30A RV", continuous: false, system: "1ph-120", note: "A 30 A RV receptacle is 120 V. The same amps at 120 V lose a larger share of the voltage than they would at 240 V." },
  { slug: "30a-rv-hookup-wire-size-100-feet", h1: "30A RV Hookup Wire Size at 100 Feet", amps: 30, distanceFt: 100, loadLabel: "30A RV", continuous: false, system: "1ph-120", note: "One hundred feet at 30 A and 120 V is a voltage-drop page. The pedestal breaker size alone is not the answer." },
  { slug: "solar-string-15a-wire-size-100-feet", h1: "Solar String Wire Size, 15A at 100 Feet", amps: 15, distanceFt: 100, loadLabel: "Solar string", continuous: true, system: "1ph-240", note: "This is a DC-nameplate planning analog at 15 A continuous over 100 ft. It uses the same K method as an AC branch. It is not a PV source-circuit calculation under Article 690." },
  { slug: "solar-string-20a-wire-size-150-feet", h1: "Solar String Wire Size, 20A at 150 Feet", amps: 20, distanceFt: 150, loadLabel: "Solar string", continuous: true, note: "Twenty amps continuous at 150 ft shows how a modest current still grows the conductor when the one-way distance is long." },
  { slug: "40a-ev-charger-wire-size-40-feet", h1: "40A EV Charger Wire Size at 40 Feet", amps: 40, distanceFt: 40, loadLabel: "40A EV charger", continuous: true, note: "A 40 A continuous charger is ampacity-sized at 50 A. Forty feet is usually short enough that the 125 percent rule, not the drop, sets the copper." },
  { slug: "80a-garage-feeder-wire-size-120-feet-aluminum", h1: "80A Garage Feeder, Aluminum, 120 Feet", amps: 80, distanceFt: 120, loadLabel: "Garage feeder", continuous: false, material: "aluminum", maxDropPct: 3, note: "An 80 A aluminum feeder at 120 ft is a detached-garage planning run. Conduit fill and burial depth are not calculated." },
  { slug: "125a-feeder-wire-size-60-feet", h1: "125A Feeder Wire Size at 60 Feet", amps: 125, distanceFt: 60, loadLabel: "125A feeder", continuous: false, maxDropPct: 5, note: "A 125 A feeder at 60 ft sits between a 100 A subpanel and a 150 A feeder. The page uses the 5 percent feeder planning limit." },
  { slug: "20a-lighting-circuit-wire-size-150-feet", h1: "20A Lighting Circuit Wire Size at 150 Feet", amps: 20, distanceFt: 150, loadLabel: "Lighting", continuous: false, system: "1ph-120", note: "A 20 A 120 V lighting run at 150 ft is limited by the small-conductor rule on 12 AWG and by voltage drop. The calculator keeps both checks." },
  { slug: "32a-ev-charger-wire-size-230v-60-feet", h1: "32A 230V EV Charger Wire Size at 60 Feet", amps: 32, distanceFt: 60, loadLabel: "230V EV charger", continuous: true, system: "1ph-230", note: "A 32 A continuous charger on 230 V uses the single-phase K method at 230 V so the percent drop matches a 230 V source, not a 240 V source." },
  { slug: "100a-aluminum-subpanel-feeder-150-feet", h1: "100A Aluminum Subpanel Feeder at 150 Feet", amps: 100, distanceFt: 150, loadLabel: "Aluminum subpanel", continuous: false, material: "aluminum", note: "Long aluminum feeders trade a larger size for a lower metal price. The comparison still offers the copper size at the same distance." },
  { slug: "48a-heat-pump-wire-size-90-feet", h1: "48A Heat Pump Wire Size at 90 Feet", amps: 48, distanceFt: 90, loadLabel: "Heat pump", continuous: true, note: "Treat a 48 A heat-pump nameplate as continuous for ampacity unless the equipment instructions say otherwise. Drop uses 48 A." },
];

const wirePresets: Preset[] = wires.map((item) => ({
  calculator: "wire-size",
  calculatorSlug: "wire-size-voltage-drop-calculator",
  cluster: "electrical-solar",
  slug: item.slug,
  h1: item.h1,
  metaTitle: item.h1,
  metaDescription: `${item.loadLabel} at ${item.amps} A and ${item.distanceFt} ft: minimum AWG or mm², voltage drop, and end voltage.`,
  summary: item.note,
  engineeringNotesHtml: `<p>${item.note} The run is ${item.distanceFt} ft one way at ${item.amps} A on ${item.system ?? "1ph-240"}. K is 12.9 for copper and 21.2 for aluminum. Ambient temperature, bundling, and rooftop adders are not applied.</p>`,
  codeReference: nec,
  faqs: faqs([
    [`What current is used for the ${item.amps} A voltage drop?`, item.continuous ? "Voltage drop uses the operating amps. Ampacity uses 125 percent because the load is marked continuous." : "Both the drop and the ampacity check use the entered amps, because this preset is not marked continuous."],
    ["Does this replace the equipment installation manual?", "No. The nameplate, the breaker, and the adopted NEC edition still control. This page is the K-method size and the percent drop."],
    ["Can I switch copper and aluminum?", "Yes. The conductor control and the comparison table both recompute size, drop, and the planning cost."],
  ]),
  formulaVersion: version,
  comparison: { kind: "distance", feet: [Math.max(25, item.distanceFt - 25), item.distanceFt, item.distanceFt + 25] },
  defaultInputs: {
    system: item.system ?? "1ph-240",
    material: item.material ?? "copper",
    amps: item.amps,
    distanceFt: item.distanceFt,
    maxDropPct: item.maxDropPct ?? 3,
    conduit: "EMT",
    continuous: item.continuous,
    loadLabel: item.loadLabel,
  },
}));

const rises = [36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 114, 120];
const stairPresets: Preset[] = rises.map((totalRiseIn) => ({
  calculator: "stair-stringer",
  calculatorSlug: "stair-stringer-layout-calculator",
  cluster: "framing-roofing",
  slug: `stair-stringer-${totalRiseIn}-inch-total-rise`,
  h1: `${totalRiseIn} Inch Stair Stringer Layout`,
  metaTitle: `${totalRiseIn} Inch Rise Stair Stringer Calculator`,
  metaDescription: `Lay out a ${totalRiseIn} in total rise: equal risers, tread count, stringer length, and the IRC 7.75 in check.`,
  summary: totalRiseIn <= 60 ? `Deck stairs at a ${totalRiseIn} in rise, targeting a 7.5 in riser and a 10.5 in tread.` : `A ${totalRiseIn} in floor-to-floor rise for a basement or a tall interior stair, divided into equal risers.`,
  engineeringNotesHtml: `<p>The ${totalRiseIn} in total rise is divided by a 7.5 in target and rounded to a whole riser count. Every riser is then the same height, reported to the nearest sixteenth and in millimetres. Treads are one fewer than risers. The diagonal is the hypotenuse of that rise and the total run, and the 2x12 stock is the next standard length. A rise over 7.75 in or under 4 in, or a tread under 10 in, is flagged.</p>`,
  codeReference: irc,
  faqs: faqs([
    [`How many risers does a ${totalRiseIn} in rise need?`, "The count is the total rise divided by 7.5 in, rounded to the nearest whole number, then each riser is total rise divided by that count."],
    ["Why is the tread count smaller?", "The upper floor is the last riser. The stringer cuts one fewer tread than the number of risers."],
    ["Does this include headroom?", "No. IRC headroom, guards, and landings still have to be checked on the building."],
  ]),
  formulaVersion: version,
  comparison: { kind: "total-rise", inches: [totalRiseIn, totalRiseIn + 12, totalRiseIn + 24] },
  defaultInputs: {
    totalRiseIn,
    targetRiseIn: 7.5,
    treadIn: 10.5,
    widthIn: totalRiseIn >= 96 ? 42 : 36,
    mount: "standard",
    landingThicknessIn: 1.5,
  },
}));

const pitches = [2, 3, 5, 7, 9, 10, 11, 12];
const roofPresets: Preset[] = [
  ...pitches.map((pitchRise): Preset => ({
    calculator: "roof-pitch",
    calculatorSlug: "roof-pitch-rafter-calculator",
    cluster: "framing-roofing",
    slug: `gable-${pitchRise}-12-rafter-length-24x40`,
    h1: `${pitchRise}/12 Gable Rafter Length on a 24×40 Building`,
    metaTitle: `${pitchRise}/12 Roof Pitch Rafter and Shingle Calculator`,
    metaDescription: `Find the ${pitchRise}/12 rafter length, pitch angle, squares, and shingle bundles for a 24 by 40 ft gable.`,
    summary: `A ${pitchRise}/12 gable, 24 ft wide and 40 ft long, with a 12 in overhang and a 1.5 in ridge.`,
    engineeringNotesHtml: `<p>A ${pitchRise}/12 pitch is arctan(${pitchRise}/12). The multiplier is the square root of 1 plus (${pitchRise}/12) squared. On this 24 ft span the common-rafter run is half the span minus half of the 1.5 in ridge, then the 1 ft overhang is added before the multiplier. Bundles are 3 per square plus 10 percent. Sheets are the roof area times 1.10 divided by 32. The page does not size the rafter for snow or wind.</p>`,
    codeReference: roofCode,
    faqs: faqs([
      [`What is the angle of a ${pitchRise}/12 pitch?`, `It is the arctangent of ${pitchRise} divided by 12, in degrees. The plumb cut uses that angle and the seat cut is 90 degrees minus that angle.`],
      ["Does the rafter length include the overhang?", "Yes. The reported length includes the body and the tail. The tail is also listed on its own."],
      ["How many bundles is a square?", "The planning count is 3 bundles per 100 square feet, then 10 percent waste, rounded up."],
    ]),
    formulaVersion: version,
    comparison: { kind: "pitch", risePer12: [pitchRise, Math.min(12, pitchRise + 2), Math.max(2, pitchRise - 2)] },
    defaultInputs: { spanFt: 24, lengthFt: 40, pitchRise, overhangFt: 1, ridgeIn: 1.5, style: "gable" },
  })),
  ...[4, 6, 8, 12].map((pitchRise): Preset => ({
    calculator: "roof-pitch",
    calculatorSlug: "roof-pitch-rafter-calculator",
    cluster: "framing-roofing",
    slug: `gable-${pitchRise}-12-rafter-length-30x50`,
    h1: `${pitchRise}/12 Gable on a 30×50 Building`,
    metaTitle: `${pitchRise}/12 Rafter Calculator for a 30x50 Gable`,
    metaDescription: `Rafter length, squares, and shingle bundles for a ${pitchRise}/12 gable on a 30 by 50 ft building.`,
    summary: `The same ${pitchRise}/12 geometry on a wider 30 ft span and a 50 ft length.`,
    engineeringNotesHtml: `<p>The building is 30 ft wide and 50 ft long at ${pitchRise}/12 with a 1 ft overhang. Run is half of 30 ft minus half the ridge thickness. Area includes both slopes and the rake overhang. Use this page when the 24 ft examples are too small for the building you are covering.</p>`,
    codeReference: roofCode,
    faqs: faqs([
      ["Why does a wider span grow the rafter so quickly?", "Run is about half the span. Rafter length is that run, plus overhang, times the pitch multiplier."],
      ["Are both slopes included?", "Yes. A gable doubles the one-slope area. A shed would use one slope."],
      ["Is the bundle count a brand takeoff?", "No. It is 3 bundles per square plus 10 percent. Hips, valleys, and starter courses are extra."],
    ]),
    formulaVersion: version,
    comparison: { kind: "pitch", risePer12: [4, 6, 8, 12] },
    defaultInputs: { spanFt: 30, lengthFt: 50, pitchRise, overhangFt: 1, ridgeIn: 1.5, style: "gable" },
  })),
];

const containers: { id: "20ft" | "40ft" | "40hc" | "53ft"; pallet: "gma" | "epal" | "uk"; stackable: boolean; label: string }[] = [
  { id: "20ft", pallet: "gma", stackable: false, label: "20 ft dry, US 48×40 pallets" },
  { id: "40ft", pallet: "gma", stackable: false, label: "40 ft dry, US 48×40 pallets" },
  { id: "40hc", pallet: "gma", stackable: true, label: "40 ft high cube, US 48×40 pallets, stacked" },
  { id: "53ft", pallet: "gma", stackable: false, label: "53 ft trailer, US 48×40 pallets" },
  { id: "20ft", pallet: "epal", stackable: false, label: "20 ft dry, Euro 1200×800 pallets" },
  { id: "40ft", pallet: "epal", stackable: false, label: "40 ft dry, Euro 1200×800 pallets" },
  { id: "40hc", pallet: "epal", stackable: true, label: "40 ft high cube, Euro pallets, stacked" },
  { id: "53ft", pallet: "epal", stackable: false, label: "53 ft trailer, Euro 1200×800 pallets" },
  { id: "20ft", pallet: "uk", stackable: false, label: "20 ft dry, UK 1200×1000 pallets" },
  { id: "40ft", pallet: "uk", stackable: false, label: "40 ft dry, UK 1200×1000 pallets" },
  { id: "40hc", pallet: "uk", stackable: true, label: "40 ft high cube, UK pallets, stacked" },
  { id: "53ft", pallet: "uk", stackable: true, label: "53 ft trailer, UK pallets, stacked" },
  { id: "20ft", pallet: "gma", stackable: true, label: "20 ft dry, US pallets, double stacked" },
  { id: "40ft", pallet: "epal", stackable: true, label: "40 ft dry, Euro pallets, double stacked" },
  { id: "40hc", pallet: "gma", stackable: false, label: "40 ft high cube, US pallets, single height" },
  { id: "53ft", pallet: "gma", stackable: true, label: "53 ft trailer, US pallets, double stacked" },
];

const containerPresets: Preset[] = containers.map((item) => ({
  calculator: "container-pallet",
  calculatorSlug: "container-pallet-weight-calculator",
  cluster: "freight-logistics",
  slug: `container-${item.id}-${item.pallet}-pallets${item.stackable ? "-stacked" : ""}`,
  h1: `${item.label}: Pallet Count, CBM, and Payload`,
  metaTitle: `${item.label} Loading Calculator`,
  metaDescription: `See how many ${item.pallet === "gma" ? "48×40" : item.pallet === "epal" ? "1200×800" : "1200×1000"} pallets fit, with CBM, kilograms, pounds, and freight cost.`,
  summary: item.label,
  engineeringNotesHtml: `<p>${item.label}. The floor plan uses the internal length and width only, so a high cube changes stack height, not the floor count. Cartons on this preset are 16 by 12 by 12 in at 30 lb. Volumetric weight is 167 kg per cubic meter of that carton cube. Billable weight is the greater of actual payload, including pallet tare, and volumetric weight. ${item.stackable ? "Stacking is allowed when two levels fit." : "The plan is one pallet high."}</p>`,
  codeReference: freightCode,
  faqs: faqs([
    ["How are the pallet slots arranged?", "The calculator tries one orientation and a two-column mix, then keeps the layout that places more pallets without overlap."],
    ["Does the high cube hold more pallets on the floor?", "No. Floor count follows length and width. The extra height only helps when the cartons or a second pallet level need it."],
    ["What payload limit is used?", "Typical ISO planning payloads for the dry containers, and 45,000 lb for the 53 ft trailer. The carrier's booking can be lower."],
  ]),
  formulaVersion: version,
  comparison: { kind: "container", ids: ["20ft", "40ft", "40hc", "53ft"] },
  defaultInputs: {
    container: item.id,
    pallet: item.pallet,
    customPalletLengthIn: 48,
    customPalletWidthIn: 40,
    boxLengthIn: 16,
    boxWidthIn: 12,
    boxHeightIn: 12,
    boxWeightLb: 30,
    stackable: item.stackable,
    rateBasis: "cbm",
    rateUsd: 85,
  },
}));

export const EXPANSION_PRESETS: Preset[] = [
  ...slabPresets,
  ...wirePresets,
  ...stairPresets,
  ...roofPresets,
  ...containerPresets,
];
