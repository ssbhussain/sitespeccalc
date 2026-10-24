import { PRESETS } from "../src/data/presets";
import { calculateConcrete } from "../src/lib/engineering/concrete";
import { calculateRoof } from "../src/lib/engineering/roof";
import { calculateStairs } from "../src/lib/engineering/stairs";
import { recommendWire } from "../src/lib/engineering/wire";

const clusters = new Map<string, number>();
const slugs = new Set<string>();
for (const preset of PRESETS) {
  clusters.set(preset.cluster, (clusters.get(preset.cluster) ?? 0) + 1);
  if (slugs.has(preset.slug)) throw new Error(`Duplicate slug ${preset.slug}`);
  slugs.add(preset.slug);
}

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
