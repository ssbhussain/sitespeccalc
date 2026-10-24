import type { ConductorMaterial, ConduitType, WireInputs, WireSystem } from "@/lib/types";

export const K_COPPER = 12.9;
export const K_ALUMINUM = 21.2;

export interface WireSpec {
  id: string;
  cm: number;
  mm2: number;
  ampCu: number;
  ampAl: number;
  usdPerFtCu: number;
  usdPerFtAl: number;
  lbPerFtCu: number;
}

export const WIRES: WireSpec[] = [
  { id: "14", cm: 4110, mm2: 2.08, ampCu: 15, ampAl: 0, usdPerFtCu: 0.42, usdPerFtAl: 0, lbPerFtCu: 0.015 },
  { id: "12", cm: 6530, mm2: 3.31, ampCu: 20, ampAl: 15, usdPerFtCu: 0.62, usdPerFtAl: 0.28, lbPerFtCu: 0.023 },
  { id: "10", cm: 10380, mm2: 5.26, ampCu: 30, ampAl: 25, usdPerFtCu: 0.95, usdPerFtAl: 0.42, lbPerFtCu: 0.037 },
  { id: "8", cm: 16510, mm2: 8.37, ampCu: 50, ampAl: 40, usdPerFtCu: 1.55, usdPerFtAl: 0.7, lbPerFtCu: 0.064 },
  { id: "6", cm: 26240, mm2: 13.3, ampCu: 65, ampAl: 50, usdPerFtCu: 2.35, usdPerFtAl: 1.05, lbPerFtCu: 0.098 },
  { id: "4", cm: 41740, mm2: 21.2, ampCu: 85, ampAl: 65, usdPerFtCu: 3.6, usdPerFtAl: 1.55, lbPerFtCu: 0.155 },
  { id: "3", cm: 52620, mm2: 26.7, ampCu: 100, ampAl: 75, usdPerFtCu: 4.4, usdPerFtAl: 1.85, lbPerFtCu: 0.195 },
  { id: "2", cm: 66360, mm2: 33.6, ampCu: 115, ampAl: 90, usdPerFtCu: 5.4, usdPerFtAl: 2.2, lbPerFtCu: 0.235 },
  { id: "1", cm: 83690, mm2: 42.4, ampCu: 130, ampAl: 100, usdPerFtCu: 6.8, usdPerFtAl: 2.7, lbPerFtCu: 0.3 },
  { id: "1/0", cm: 105600, mm2: 53.5, ampCu: 150, ampAl: 120, usdPerFtCu: 8.4, usdPerFtAl: 3.3, lbPerFtCu: 0.37 },
  { id: "2/0", cm: 133100, mm2: 67.4, ampCu: 175, ampAl: 135, usdPerFtCu: 10.4, usdPerFtAl: 4.05, lbPerFtCu: 0.465 },
  { id: "3/0", cm: 167800, mm2: 85, ampCu: 200, ampAl: 155, usdPerFtCu: 12.8, usdPerFtAl: 4.9, lbPerFtCu: 0.575 },
  { id: "4/0", cm: 211600, mm2: 107, ampCu: 230, ampAl: 180, usdPerFtCu: 16, usdPerFtAl: 6.1, lbPerFtCu: 0.71 },
  { id: "250", cm: 250000, mm2: 127, ampCu: 255, ampAl: 205, usdPerFtCu: 19, usdPerFtAl: 7.2, lbPerFtCu: 0.85 },
  { id: "300", cm: 300000, mm2: 152, ampCu: 285, ampAl: 230, usdPerFtCu: 23, usdPerFtAl: 8.6, lbPerFtCu: 1.01 },
  { id: "350", cm: 350000, mm2: 177, ampCu: 310, ampAl: 250, usdPerFtCu: 27, usdPerFtAl: 10, lbPerFtCu: 1.17 },
  { id: "400", cm: 400000, mm2: 203, ampCu: 335, ampAl: 270, usdPerFtCu: 31, usdPerFtAl: 11.4, lbPerFtCu: 1.33 },
  { id: "500", cm: 500000, mm2: 253, ampCu: 380, ampAl: 310, usdPerFtCu: 39, usdPerFtAl: 14.2, lbPerFtCu: 1.65 },
  { id: "600", cm: 600000, mm2: 304, ampCu: 420, ampAl: 340, usdPerFtCu: 47, usdPerFtAl: 17, lbPerFtCu: 1.97 },
  { id: "750", cm: 750000, mm2: 380, ampCu: 475, ampAl: 385, usdPerFtCu: 59, usdPerFtAl: 21, lbPerFtCu: 2.45 },
];

export const CONDUIT_USD_PER_FT: Record<ConduitType, number> = {
  EMT: 1.85,
  PVC: 0.95,
  RMC: 4.75,
  LFMC: 3.25,
};

export interface SystemProfile {
  voltage: number;
  phase: 1 | 3;
  label: string;
  currentCarrying: number;
}

export function systemProfile(system: WireSystem): SystemProfile {
  switch (system) {
    case "1ph-120":
      return { voltage: 120, phase: 1, label: "Single-phase 120 V", currentCarrying: 2 };
    case "1ph-240":
      return { voltage: 240, phase: 1, label: "Single-phase 240 V", currentCarrying: 2 };
    case "1ph-230":
      return { voltage: 230, phase: 1, label: "Single-phase 230 V", currentCarrying: 2 };
    case "3ph-208":
      return { voltage: 208, phase: 3, label: "Three-phase 208 V", currentCarrying: 3 };
    case "3ph-400":
      return { voltage: 400, phase: 3, label: "Three-phase 400 V", currentCarrying: 3 };
    case "3ph-480":
      return { voltage: 480, phase: 3, label: "Three-phase 480 V", currentCarrying: 3 };
  }
}

export function wireName(wire: WireSpec): string {
  return Number.isNaN(Number(wire.id)) ? `${wire.id} AWG` : Number(wire.id) >= 250 ? `${wire.id} kcmil` : `${wire.id} AWG`;
}

export function ampacity(wire: WireSpec, material: ConductorMaterial): number {
  return material === "copper" ? wire.ampCu : wire.ampAl;
}

export function voltageDropVolts(
  material: ConductorMaterial,
  phase: 1 | 3,
  amps: number,
  distanceFt: number,
  circularMils: number,
): number {
  if (circularMils <= 0 || amps <= 0 || distanceFt <= 0) return 0;
  const k = material === "copper" ? K_COPPER : K_ALUMINUM;
  const multiplier = phase === 3 ? Math.sqrt(3) : 2;
  return (multiplier * k * amps * distanceFt) / circularMils;
}

export function powerLossWatts(
  material: ConductorMaterial,
  phase: 1 | 3,
  amps: number,
  distanceFt: number,
  circularMils: number,
): number {
  if (circularMils <= 0 || amps <= 0 || distanceFt <= 0) return 0;
  const k = material === "copper" ? K_COPPER : K_ALUMINUM;
  const ohmsPerFt = k / circularMils;
  if (phase === 3) return 3 * amps * amps * ohmsPerFt * distanceFt;
  return amps * amps * (2 * ohmsPerFt * distanceFt);
}

export interface WireRecommendation {
  wire: WireSpec | null;
  sets: number;
  dropV: number;
  dropPct: number;
  endV: number;
  lossW: number;
  requiredAmp: number;
  ampacityEach: number;
  tone: "green" | "amber" | "red";
  note: string;
}

function toneFor(dropPct: number): "green" | "amber" | "red" {
  if (dropPct <= 3) return "green";
  if (dropPct <= 5) return "amber";
  return "red";
}

function candidates(material: ConductorMaterial): WireSpec[] {
  return WIRES.filter((wire) => ampacity(wire, material) > 0);
}

function evaluate(
  wire: WireSpec,
  sets: number,
  input: WireInputs,
  profile: SystemProfile,
  requiredAmp: number,
): WireRecommendation {
  const currentEach = input.amps / sets;
  const dropV = voltageDropVolts(input.material, profile.phase, currentEach, input.distanceFt, wire.cm);
  const dropPct = profile.voltage > 0 ? (dropV / profile.voltage) * 100 : 0;
  const lossW =
    powerLossWatts(input.material, profile.phase, currentEach, input.distanceFt, wire.cm) * sets;
  return {
    wire,
    sets,
    dropV,
    dropPct,
    endV: profile.voltage - dropV,
    lossW,
    requiredAmp,
    ampacityEach: ampacity(wire, input.material),
    tone: toneFor(dropPct),
    note:
      sets === 1
        ? "Single conductor set"
        : `${sets} parallel sets, equal current assumed`,
  };
}

export function recommendWire(input: WireInputs): WireRecommendation {
  const profile = systemProfile(input.system);
  const requiredAmp = input.continuous ? input.amps * 1.25 : input.amps;
  const list = candidates(input.material);
  const empty: WireRecommendation = {
    wire: null,
    sets: 0,
    dropV: 0,
    dropPct: 0,
    endV: profile.voltage,
    lossW: 0,
    requiredAmp,
    ampacityEach: 0,
    tone: "red",
    note: "No conductor in the built-in table meets this load.",
  };

  for (const wire of list) {
    if (ampacity(wire, input.material) + 1e-9 < requiredAmp) continue;
    const result = evaluate(wire, 1, input, profile, requiredAmp);
    if (result.dropPct <= input.maxDropPct + 1e-9) return result;
  }

  for (const wire of list) {
    if (ampacity(wire, input.material) * 2 + 1e-9 < requiredAmp) continue;
    const result = evaluate(wire, 2, input, profile, requiredAmp);
    if (result.dropPct <= input.maxDropPct + 1e-9) {
      return { ...result, note: "Two parallel sets. Confirm paralleling rules in NEC 310.10(G)." };
    }
  }

  const largest = list[list.length - 1];
  if (!largest) return empty;
  const fallbackSets = ampacity(largest, input.material) >= requiredAmp ? 1 : 2;
  const fallback = evaluate(largest, fallbackSets, input, profile, requiredAmp);
  return {
    ...fallback,
    tone: "red",
    note: "Largest tabulated conductor still misses ampacity or the voltage-drop limit. A licensed electrician needs a different design.",
  };
}

export function defaultWirePrice(wire: WireSpec, material: ConductorMaterial): number {
  return material === "copper" ? wire.usdPerFtCu : wire.usdPerFtAl;
}

export function conductorWeightLb(wire: WireSpec, material: ConductorMaterial, lengthFt: number, count: number): number {
  const each = material === "copper" ? wire.lbPerFtCu : wire.lbPerFtCu * 0.33;
  return each * lengthFt * count;
}

export function estimateCircuitCost(options: {
  wire: WireSpec;
  material: ConductorMaterial;
  sets: number;
  distanceFt: number;
  currentCarrying: number;
  wireUsdPerFt: number;
  conduit: ConduitType;
  conduitUsdPerFt: number;
}): { wireUsd: number; conduitUsd: number; totalUsd: number; conductorCount: number } {
  const ungrounded = options.currentCarrying * options.sets;
  const grounds = options.sets;
  const conductorCount = ungrounded + grounds;
  const wireUsd =
    options.distanceFt * (ungrounded * options.wireUsdPerFt + grounds * options.wireUsdPerFt * 0.6);
  const conduitUsd = options.distanceFt * options.conduitUsdPerFt;
  return { wireUsd, conduitUsd, totalUsd: wireUsd + conduitUsd, conductorCount };
}
