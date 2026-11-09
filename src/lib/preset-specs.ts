import { calculateConcrete } from "@/lib/engineering/concrete";
import { calculateContainer } from "@/lib/engineering/container";
import { formatQty } from "@/lib/engineering/format";
import { calculateRoof } from "@/lib/engineering/roof";
import { calculateStairs } from "@/lib/engineering/stairs";
import { recommendWire, wireName } from "@/lib/engineering/wire";
import type { Preset } from "@/lib/types";

export function presetSpecLine(preset: Preset): string {
  try {
    if (preset.calculator === "concrete-slab") {
      const result = calculateConcrete(preset.defaultInputs);
      return `${formatQty(result.orderYd3)} yd³ order · ${result.bags80} × 80 lb bags`;
    }
    if (preset.calculator === "wire-size") {
      const result = recommendWire(preset.defaultInputs);
      const gauge = result.wire ? wireName(result.wire) : "no size";
      return `${formatQty(preset.defaultInputs.amps, 0)} A ${preset.defaultInputs.material} · ${gauge} · ${formatQty(result.dropPct, 2)}% drop`;
    }
    if (preset.calculator === "stair-stringer") {
      const result = calculateStairs(preset.defaultInputs);
      return `${result.risers} risers · ${formatQty(result.riserIn, 2)} in each · ${result.treads} treads`;
    }
    if (preset.calculator === "roof-pitch") {
      const result = calculateRoof(preset.defaultInputs);
      return `${formatQty(preset.defaultInputs.pitchRise, 0)}/12 · rafter ${formatQty(result.rafterFt, 2)} ft · ${formatQty(result.squares, 1)} squares`;
    }
    const result = calculateContainer(preset.defaultInputs);
    return `${result.totalPallets} pallets · ${formatQty(result.cargoCbm, 2)} m³ · ${formatQty(result.totalKg, 0)} kg`;
  } catch {
    return preset.summary;
  }
}
