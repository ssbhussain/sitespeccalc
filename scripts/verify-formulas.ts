import { PRESETS } from "../src/data/presets";
import { calculateContainer, floorSlots } from "../src/lib/engineering/container";
import { calculateConcrete } from "../src/lib/engineering/concrete";
import { calculateRoof } from "../src/lib/engineering/roof";
import { calculateStairs } from "../src/lib/engineering/stairs";
import { recommendWire } from "../src/lib/engineering/wire";
import { detectVisitorLocale } from "../src/context/UnitContext";

const clusters = new Map<string, number>();
const slugs = new Set<string>();
for (const preset of PRESETS) {
  clusters.set(preset.cluster, (clusters.get(preset.cluster) ?? 0) + 1);
  if (slugs.has(preset.slug)) throw new Error(`Duplicate slug ${preset.slug}`);
  slugs.add(preset.slug);
}
if (PRESETS.length < 120) throw new Error(`expected at least 120 presets, got ${PRESETS.length}`);
const india = detectVisitorLocale("en-IN", "Asia/Kolkata");
if (india.currency !== "INR" || india.system !== "metric" || india.weight !== "kg") throw new Error("india locale");
const uk = detectVisitorLocale("en-GB", "Europe/London");
if (uk.currency !== "GBP" || uk.weight !== "kg" || uk.system !== "imperial") throw new Error("uk locale");
const euro20 = floorSlots(5.898, 2.352, 1.2, 0.8).length;
const euro40 = floorSlots(12.032, 2.352, 1.2, 0.8).length;
if (euro20 !== 11) throw new Error(`euro 20ft slots ${euro20}`);
if (euro40 !== 25) throw new Error(`euro 40ft slots ${euro40}`);
const loaded = calculateContainer({
  container: "20ft",
  pallet: "epal",
  customPalletLengthIn: 48,
  customPalletWidthIn: 40,
  boxLengthIn: 16,
  boxWidthIn: 12,
  boxHeightIn: 12,
  boxWeightLb: 30,
  stackable: false,
  rateBasis: "cbm",
  rateUsd: 85,
});
if (loaded.floorCount !== 11) throw new Error(`loaded floor ${loaded.floorCount}`);

const slab = calculateConcrete({
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
});
if (Math.abs(slab.netYd3 - 4.9382716) > 0.01) throw new Error(`slab yards ${slab.netYd3}`);

const stair = calculateStairs({
  totalRiseIn: 108,
  targetRiseIn: 7.5,
  treadIn: 10,
  widthIn: 36,
  mount: "standard",
  landingThicknessIn: 0.75,
});
if (stair.risers !== 14) throw new Error(`risers ${stair.risers}`);
if (stair.riserIn > 7.75) throw new Error(`riser ${stair.riserIn}`);

const roof = calculateRoof({
  spanFt: 24,
  lengthFt: 40,
  pitchRise: 6,
  overhangFt: 1,
  ridgeIn: 1.5,
  style: "gable",
});
if (Math.abs(roof.angleDeg - 26.565) > 0.05) throw new Error(`angle ${roof.angleDeg}`);
if (Math.abs(roof.multiplier - Math.sqrt(1.25)) > 0.0001) throw new Error(`mult ${roof.multiplier}`);

const wire = recommendWire({
  system: "1ph-240",
  material: "copper",
  amps: 50,
  distanceFt: 75,
  maxDropPct: 3,
  conduit: "EMT",
  continuous: true,
  loadLabel: "EV charger",
});
if (wire.wire?.id !== "6") throw new Error(`wire ${wire.wire?.id} ${wire.dropPct}`);

console.log(
  JSON.stringify(
    {
      presets: PRESETS.length,
      clusters: Object.fromEntries(clusters),
      slabYd3: Number(slab.netYd3.toFixed(3)),
      riser: Number(stair.riserIn.toFixed(3)),
      rafterFt: Number(roof.rafterFt.toFixed(3)),
      wire: wire.wire?.id,
      dropPct: Number(wire.dropPct.toFixed(2)),
    },
    null,
    2,
  ),
);
