import type { RoofInputs } from "@/lib/types";

const SHEET_SQFT = 32;
const ROLL_EFFECTIVE_SQFT = 360;
const SHINGLE_BUNDLE_LB = 70;
const SHEET_LB = 46;
const ROLL_LB = 28;

export interface RoofResult {
  angleDeg: number;
  multiplier: number;
  runFt: number;
  riseFt: number;
  tailFt: number;
  rafterFt: number;
  plumbDeg: number;
  seatDeg: number;
  areaFt2: number;
  areaM2: number;
  squares: number;
  bundles: number;
  sheets: number;
  rolls: number;
  ridgeFt: number;
  ridgeBundles: number;
  shipLb: number;
}

export function calculateRoof(input: RoofInputs): RoofResult {
  const spanFt = Math.max(0, input.spanFt);
  const lengthFt = Math.max(0, input.lengthFt);
  const pitch = Math.max(0, input.pitchRise);
  const overhangFt = Math.max(0, input.overhangFt);
  const multiplier = Math.sqrt(1 + (pitch / 12) ** 2);
  const angleDeg = (Math.atan(pitch / 12) * 180) / Math.PI;
  const runFt =
    input.style === "gable"
      ? Math.max(0.25, spanFt / 2 - input.ridgeIn / 24)
      : Math.max(0.25, spanFt);
  const riseFt = runFt * (pitch / 12);
  const tailHorizontal = input.style === "shed" ? overhangFt * 2 : overhangFt;
  const tailFt = overhangFt * multiplier;
  const rafterFt = (runFt + tailHorizontal) * multiplier;
  const planLength = lengthFt + overhangFt * 2;
  const slopes = input.style === "gable" ? 2 : 1;
  const areaFt2 = slopes * rafterFt * planLength;
  const areaM2 = areaFt2 * 0.09290304;
  const squares = areaFt2 / 100;
  const bundles = areaFt2 <= 0 ? 0 : Math.ceil(squares * 3 * 1.1 - 1e-9);
  const sheets = areaFt2 <= 0 ? 0 : Math.ceil((areaFt2 * 1.1) / SHEET_SQFT - 1e-9);
  const rolls = areaFt2 <= 0 ? 0 : Math.ceil(areaFt2 / ROLL_EFFECTIVE_SQFT - 1e-9);
  const ridgeFt = input.style === "gable" ? lengthFt + overhangFt * 2 : 0;
  const ridgeBundles = ridgeFt <= 0 ? 0 : Math.ceil(ridgeFt / 25 - 1e-9);
  const shipLb = bundles * SHINGLE_BUNDLE_LB + sheets * SHEET_LB + rolls * ROLL_LB;

  return {
    angleDeg,
    multiplier,
    runFt,
    riseFt,
    tailFt,
    rafterFt,
    plumbDeg: angleDeg,
    seatDeg: 90 - angleDeg,
    areaFt2,
    areaM2,
    squares,
    bundles,
    sheets,
    rolls,
    ridgeFt,
    ridgeBundles,
    shipLb,
  };
}

export function pitchFromDegrees(degrees: number): number {
  const radians = (degrees * Math.PI) / 180;
  return 12 * Math.tan(radians);
}
