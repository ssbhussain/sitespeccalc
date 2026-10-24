import type { ContainerId, ContainerInputs, FreightRateBasis, PalletStandard } from "@/lib/types";

/** Exact international avoirdupois pound. Same constant as the unit switcher. */
const LB_TO_KG = 0.45359237;

const IN_TO_M = 0.0254;
const M3_TO_FT3 = 35.314666721;
/** IATA-style volumetric weight: 1 m³ = 167 kg. */
const DIM_KG_PER_M3 = 167;
const PALLET_DECK_M = 0.15;
const HEIGHT_CLEARANCE_M = 0.05;

export interface ContainerSpec {
  id: ContainerId;
  label: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  payloadKg: number;
}

export interface PalletSpec {
  id: PalletStandard;
  label: string;
  lengthM: number;
  widthM: number;
  tareKg: number;
}

export const CONTAINERS: Record<ContainerId, ContainerSpec> = {
  "20ft": { id: "20ft", label: "20 ft dry", lengthM: 5.898, widthM: 2.352, heightM: 2.393, payloadKg: 28200 },
  "40ft": { id: "40ft", label: "40 ft dry", lengthM: 12.032, widthM: 2.352, heightM: 2.393, payloadKg: 26700 },
  "40hc": { id: "40hc", label: "40 ft high cube", lengthM: 12.032, widthM: 2.352, heightM: 2.698, payloadKg: 26500 },
  "53ft": { id: "53ft", label: "53 ft US trailer", lengthM: 16.002, widthM: 2.502, heightM: 2.794, payloadKg: 45000 * LB_TO_KG },
};

export const PALLETS: Record<Exclude<PalletStandard, "custom">, PalletSpec> = {
  gma: { id: "gma", label: "US GMA 48×40 in", lengthM: 48 * IN_TO_M, widthM: 40 * IN_TO_M, tareKg: 40 * LB_TO_KG },
  epal: { id: "epal", label: "Euro EPAL 1200×800 mm", lengthM: 1.2, widthM: 0.8, tareKg: 25 },
  uk: { id: "uk", label: "UK 1200×1000 mm", lengthM: 1.2, widthM: 1, tareKg: 30 },
};

export interface SlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ContainerResult {
  spec: ContainerSpec;
  palletLabel: string;
  palletLengthM: number;
  palletWidthM: number;
  floorCount: number;
  levels: number;
  totalPallets: number;
  boxesPerLayer: number;
  layersPerPallet: number;
  boxesPerPallet: number;
  totalBoxes: number;
  cargoCbm: number;
  cargoFt3: number;
  totalKg: number;
  totalLb: number;
  payloadKg: number;
  payloadLb: number;
  overweight: boolean;
  volumetricKg: number;
  billableKg: number;
  billableLb: number;
  freightUsd: number;
  costPerBoxUsd: number;
  slots: SlotRect[];
  warnings: string[];
}

function fits(span: number, piece: number) {
  if (piece <= 0) return 0;
  return Math.floor((span + 1e-9) / piece);
}

export function floorSlots(lengthM: number, widthM: number, palletLengthM: number, palletWidthM: number): SlotRect[] {
  const orientations = [
    { along: palletLengthM, across: palletWidthM },
    { along: palletWidthM, across: palletLengthM },
  ].filter((item) => item.along > 0 && item.across > 0);

  let best: SlotRect[] = [];

  const consider = (columns: { along: number; across: number; countAlong: number }[]) => {
    let usedWidth = 0;
    const rects: SlotRect[] = [];
    for (const column of columns) {
      if (column.countAlong < 1 || column.across <= 0) return;
      if (usedWidth + column.across > widthM + 1e-6) return;
      for (let index = 0; index < column.countAlong; index += 1) {
        const x = index * column.along;
        if (x + column.along > lengthM + 1e-6) return;
        rects.push({ x, y: usedWidth, w: column.along, h: column.across });
      }
      usedWidth += column.across;
    }
    if (rects.length > best.length) best = rects;
  };

  for (const orientation of orientations) {
    const across = fits(widthM, orientation.across);
    const along = fits(lengthM, orientation.along);
    if (across < 1 || along < 1) continue;
    consider(
      Array.from({ length: across }, () => ({
        along: orientation.along,
        across: orientation.across,
        countAlong: along,
      })),
    );
  }

  for (const left of orientations) {
    for (const right of orientations) {
      if (left.across + right.across > widthM + 1e-6) continue;
      const leftCount = fits(lengthM, left.along);
      const rightCount = fits(lengthM, right.along);
      if (leftCount < 1 || rightCount < 1) continue;
      consider([
        { along: left.along, across: left.across, countAlong: leftCount },
        { along: right.along, across: right.across, countAlong: rightCount },
      ]);
    }
  }

  return best;
}

function palletSize(input: ContainerInputs): { lengthM: number; widthM: number; tareKg: number; label: string } {
  if (input.pallet === "custom") {
    return {
      lengthM: Math.max(0, input.customPalletLengthIn) * IN_TO_M,
      widthM: Math.max(0, input.customPalletWidthIn) * IN_TO_M,
      tareKg: 20,
      label: "Custom pallet",
    };
  }
  const spec = PALLETS[input.pallet];
  return { lengthM: spec.lengthM, widthM: spec.widthM, tareKg: spec.tareKg, label: spec.label };
}

function freightUnits(basis: FreightRateBasis, cargoCbm: number, billableKg: number) {
  if (basis === "cbm") return cargoCbm;
  if (basis === "tonne") return billableKg / 1000;
  return billableKg / LB_TO_KG;
}

export function calculateContainer(input: ContainerInputs): ContainerResult {
  const spec = CONTAINERS[input.container];
  const pallet = palletSize(input);
  const slots = floorSlots(spec.lengthM, spec.widthM, pallet.lengthM, pallet.widthM);
  const boxL = Math.max(0, input.boxLengthIn) * IN_TO_M;
  const boxW = Math.max(0, input.boxWidthIn) * IN_TO_M;
  const boxH = Math.max(0, input.boxHeightIn) * IN_TO_M;
  const boxKg = Math.max(0, input.boxWeightLb) * LB_TO_KG;
  const usableHeight = Math.max(0, spec.heightM - HEIGHT_CLEARANCE_M);
  const stackHeight = input.stackable ? usableHeight / 2 : usableHeight;
  const cargoHeight = Math.max(0, stackHeight - PALLET_DECK_M);
  const layersPerPallet = boxH > 0 ? Math.floor((cargoHeight + 1e-9) / boxH) : 0;
  const boxesPerLayer = floorSlots(pallet.lengthM, pallet.widthM, boxL, boxW).length;
  const boxesPerPallet = boxesPerLayer * layersPerPallet;
  const oneStack = PALLET_DECK_M + layersPerPallet * boxH;
  const levels = input.stackable && layersPerPallet > 0 && oneStack * 2 <= usableHeight + 1e-6 ? 2 : 1;
  const floorCount = slots.length;
  const totalPallets = floorCount * levels;
  const totalBoxes = totalPallets * boxesPerPallet;
  const cargoCbm = totalBoxes * boxL * boxW * boxH;
  const totalKg = totalBoxes * boxKg + totalPallets * pallet.tareKg;
  const volumetricKg = cargoCbm * DIM_KG_PER_M3;
  const billableKg = Math.max(totalKg, volumetricKg);
  const freightUsd = freightUnits(input.rateBasis, cargoCbm, billableKg) * Math.max(0, input.rateUsd);
  const warnings: string[] = [];
  if (boxesPerLayer === 0) warnings.push("The box footprint does not fit on the selected pallet.");
  if (layersPerPallet === 0) warnings.push("The box is taller than the pallet stack height inside this container.");
  if (input.stackable && levels === 1) warnings.push("Two pallet levels do not fit under the internal height, so the plan stays one high.");
  if (totalKg > spec.payloadKg) warnings.push("Payload is over the planning legal limit for this container.");

  return {
    spec,
    palletLabel: pallet.label,
    palletLengthM: pallet.lengthM,
    palletWidthM: pallet.widthM,
    floorCount,
    levels,
    totalPallets,
    boxesPerLayer,
    layersPerPallet,
    boxesPerPallet,
    totalBoxes,
    cargoCbm,
    cargoFt3: cargoCbm * M3_TO_FT3,
    totalKg,
    totalLb: totalKg / LB_TO_KG,
    payloadKg: spec.payloadKg,
    payloadLb: spec.payloadKg / LB_TO_KG,
    overweight: totalKg > spec.payloadKg && totalBoxes > 0,
    volumetricKg,
    billableKg,
    billableLb: billableKg / LB_TO_KG,
    freightUsd,
    costPerBoxUsd: totalBoxes > 0 ? freightUsd / totalBoxes : 0,
    slots,
    warnings,
  };
}
