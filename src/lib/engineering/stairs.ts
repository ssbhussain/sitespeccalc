import type { StairInputs } from "@/lib/types";

const STOCK_FT = [8, 10, 12, 14, 16, 18, 20, 24];
const STRINGER_WIDTH_IN = 11.25;
const LB_PER_FT = 2.8;

export interface StairResult {
  risers: number;
  treads: number;
  riserIn: number;
  totalRunIn: number;
  totalRiseUsedIn: number;
  stringerRiseIn: number;
  diagonalIn: number;
  boardIn: number;
  stockFt: number | null;
  angleDeg: number;
  stringers: number;
  throatIn: number;
  lumberLb: number;
  riserPass: boolean;
  treadPass: boolean;
  throatPass: boolean;
  warnings: string[];
  suggestedRisers: number;
}

export function calculateStairs(input: StairInputs): StairResult {
  const totalRiseIn = Math.max(0, input.totalRiseIn);
  const target = Math.max(0.5, input.targetRiseIn);
  const treadIn = Math.max(0, input.treadIn);
  const widthIn = Math.max(0, input.widthIn);
  let risers = Math.max(1, Math.round(totalRiseIn / target));
  if (totalRiseIn === 0) risers = 1;
  const riserIn = totalRiseIn / risers;
  const treads = Math.max(0, risers - 1);
  const totalRunIn = treads * treadIn;
  const landing = Math.max(0, input.landingThicknessIn);
  const stringerRiseIn =
    input.mount === "dropped" ? Math.max(0, totalRiseIn - landing) : totalRiseIn;
  const diagonalIn = Math.hypot(stringerRiseIn, totalRunIn);
  const boardIn = diagonalIn + riserIn;
  const boardFt = boardIn / 12;
  const stockFt = STOCK_FT.find((length) => length + 1e-9 >= boardFt) ?? null;
  const angleDeg = totalRunIn <= 0 ? 90 : (Math.atan(totalRiseIn / totalRunIn) * 180) / Math.PI;
  const stringers = Math.max(2, Math.floor(widthIn / 16) + 1);
  const notchAltitude =
    riserIn > 0 && treadIn > 0 ? (riserIn * treadIn) / Math.hypot(riserIn, treadIn) : 0;
  const throatIn = STRINGER_WIDTH_IN - notchAltitude;
  const stockForWeight = stockFt ?? Math.ceil(boardFt);
  const lumberLb = stringers * stockForWeight * LB_PER_FT;

  const warnings: string[] = [];
  const riserPass = riserIn <= 7.75 + 1e-6 && riserIn >= 4 - 1e-6 && totalRiseIn > 0;
  const treadPass = treads === 0 ? true : treadIn >= 10 - 1e-6;
  const throatPass = throatIn >= 5 - 1e-6;
  if (riserIn > 7.75) warnings.push("Riser is taller than the 7.75 in IRC maximum.");
  if (riserIn < 4) warnings.push("Riser is shorter than the 4 in minimum used by this check.");
  if (!treadPass) warnings.push("Tread depth is under the 10 in IRC minimum.");
  if (throatIn < 3.5) warnings.push("Estimated 2x12 throat is under 3.5 in. Use an engineered stringer.");
  else if (throatIn < 5) warnings.push("Estimated 2x12 throat is under 5 in. Confirm with the local inspector.");
  if (!stockFt) warnings.push("Cut length exceeds a 24 ft stock board. Plan a splice or an engineered stringer.");

  const suggestedRisers = Math.max(1, Math.ceil(totalRiseIn / 7.75 - 1e-9));

  return {
    risers,
    treads,
    riserIn,
    totalRunIn,
    totalRiseUsedIn: totalRiseIn,
    stringerRiseIn,
    diagonalIn,
    boardIn,
    stockFt,
    angleDeg,
    stringers,
    throatIn,
    lumberLb,
    riserPass,
    treadPass,
    throatPass,
    warnings,
    suggestedRisers,
  };
}
