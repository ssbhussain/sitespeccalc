import type { ConcreteInputs, RebarSize } from "@/lib/types";

export const CONCRETE_PCF = 150;
export const BAG_80_CUFT = 0.6;
export const BAG_60_CUFT = 0.45;
export const BAGS_PER_PALLET = 42;
export const TIES_PER_ROLL = 300;
export const TRUCK_YD3 = 10;

export const REBAR: Record<
  RebarSize,
  { label: string; metricLabel: string; lbPerFt: number; barUsd: number }
> = {
  "3": { label: "#3", metricLabel: "10 mm", lbPerFt: 0.376, barUsd: 8.5 },
  "4": { label: "#4", metricLabel: "12 mm", lbPerFt: 0.668, barUsd: 14 },
  "5": { label: "#5", metricLabel: "16 mm", lbPerFt: 1.043, barUsd: 22 },
};

export interface ConcreteResult {
  slabFt3: number;
  footingExtraFt3: number;
  netFt3: number;
  orderFt3: number;
  netYd3: number;
  orderYd3: number;
  netM3: number;
  orderM3: number;
  placedLb: number;
  orderLb: number;
  placedKg: number;
  orderKg: number;
  bags80: number;
  bags60: number;
  pallets80: number;
  barsAlongLength: number;
  barsAlongWidth: number;
  gridLinFt: number;
  footingLinFt: number;
  netLinFt: number;
  orderLinFt: number;
  netLinM: number;
  bars20: number;
  bars6m: number;
  orderBars20: number;
  intersections: number;
  chairs: number;
  tieRolls: number;
  rebarLb: number;
  orderRebarLb: number;
  truckLoads: number;
  trucksToOrder: number;
  suggestedShortLoadFee: number;
  readyMixMaterialUsd: number;
  bag80MaterialUsd: number;
  bag60MaterialUsd: number;
}

function barCount(spanFt: number, spacingIn: number): number {
  const spacingFt = spacingIn / 12;
  if (spanFt <= 0 || spacingFt <= 0) return 0;
  return Math.floor(spanFt / spacingFt + 1e-9) + 1;
}

function sticks(lines: number, lineLength: number, stock: number): number {
  if (lines <= 0 || lineLength <= 0 || stock <= 0) return 0;
  return lines * Math.ceil(lineLength / stock - 1e-9);
}

export function calculateConcrete(input: ConcreteInputs): ConcreteResult {
  const lengthFt = Math.max(0, input.lengthFt);
  const widthFt = Math.max(0, input.widthFt);
  const thicknessFt = Math.max(0, input.thicknessIn) / 12;
  const waste = Math.max(0, input.waste);
  const factor = 1 + waste;

  const slabFt3 = lengthFt * widthFt * thicknessFt;
  let footingExtraFt3 = 0;
  if (input.thickenedEdge) {
    const footingWidthFt = Math.max(0, input.footingWidthIn) / 12;
    const footingDepthFt = Math.max(0, input.footingDepthIn) / 12;
    const extraDepth = Math.max(0, footingDepthFt - thicknessFt);
    const rawBand =
      2 * (lengthFt + widthFt) * footingWidthFt - 4 * footingWidthFt * footingWidthFt;
    const band = Math.min(lengthFt * widthFt, Math.max(0, rawBand));
    footingExtraFt3 = band * extraDepth;
  }

  const netFt3 = slabFt3 + footingExtraFt3;
  const orderFt3 = netFt3 * factor;
  const netYd3 = netFt3 / 27;
  const orderYd3 = orderFt3 / 27;
  const netM3 = netFt3 * 0.028316846592;
  const orderM3 = orderFt3 * 0.028316846592;
  const placedLb = netFt3 * CONCRETE_PCF;
  const orderLb = orderFt3 * CONCRETE_PCF;
  const placedKg = placedLb * 0.45359237;
  const orderKg = orderLb * 0.45359237;

  const bags80 = orderFt3 <= 0 ? 0 : Math.ceil(orderFt3 / BAG_80_CUFT - 1e-9);
  const bags60 = orderFt3 <= 0 ? 0 : Math.ceil(orderFt3 / BAG_60_CUFT - 1e-9);
  const pallets80 = bags80 === 0 ? 0 : Math.ceil(bags80 / BAGS_PER_PALLET);

  const barsAlongLength = barCount(widthFt, input.spacingIn);
  const barsAlongWidth = barCount(lengthFt, input.spacingIn);
  const gridLinFt = barsAlongLength * lengthFt + barsAlongWidth * widthFt;
  const perimeterFt = 2 * (lengthFt + widthFt);
  const footingLinFt = input.thickenedEdge ? 2 * perimeterFt : 0;
  const netLinFt = gridLinFt + footingLinFt;
  const orderLinFt = netLinFt * factor;
  const netLinM = netLinFt * 0.3048;

  const gridBars20 =
    sticks(barsAlongLength, lengthFt, 20) + sticks(barsAlongWidth, widthFt, 20);
  const footingBars20 = input.thickenedEdge ? 2 * sticks(1, perimeterFt, 20) : 0;
  const bars20 = gridBars20 + footingBars20;

  const lengthM = lengthFt * 0.3048;
  const widthM = widthFt * 0.3048;
  const perimeterM = perimeterFt * 0.3048;
  const gridBars6m =
    sticks(barsAlongLength, lengthM, 6) + sticks(barsAlongWidth, widthM, 6);
  const footingBars6m = input.thickenedEdge ? 2 * sticks(1, perimeterM, 6) : 0;
  const bars6m = gridBars6m + footingBars6m;
  const orderBars20 = bars20 === 0 ? 0 : Math.ceil(bars20 * factor - 1e-9);

  const intersections = barsAlongLength * barsAlongWidth;
  const chairs = intersections === 0 ? 0 : Math.ceil(intersections * factor - 1e-9);
  const tieRolls =
    intersections === 0 ? 0 : Math.ceil((intersections * factor) / TIES_PER_ROLL - 1e-9);

  const spec = REBAR[input.rebarSize];
  const rebarLb = netLinFt * spec.lbPerFt;
  const orderRebarLb = orderLinFt * spec.lbPerFt;
  const truckLoads = orderYd3 / TRUCK_YD3;
  const trucksToOrder = orderYd3 <= 0 ? 0 : Math.ceil(truckLoads - 1e-9);
  const suggestedShortLoadFee = orderYd3 > 0 && orderYd3 < 4 ? 125 : 0;

  return {
    slabFt3,
    footingExtraFt3,
    netFt3,
    orderFt3,
    netYd3,
    orderYd3,
    netM3,
    orderM3,
    placedLb,
    orderLb,
    placedKg,
    orderKg,
    bags80,
    bags60,
    pallets80,
    barsAlongLength,
    barsAlongWidth,
    gridLinFt,
    footingLinFt,
    netLinFt,
    orderLinFt,
    netLinM,
    bars20,
    bars6m,
    orderBars20,
    intersections,
    chairs,
    tieRolls,
    rebarLb,
    orderRebarLb,
    truckLoads,
    trucksToOrder,
    suggestedShortLoadFee,
    readyMixMaterialUsd: orderYd3 * Math.max(0, input.readyMixPerYd3),
    bag80MaterialUsd: bags80 * Math.max(0, input.bag80Price),
    bag60MaterialUsd: bags60 * Math.max(0, input.bag60Price),
  };
}
