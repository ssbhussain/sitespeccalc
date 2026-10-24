"use client";

import { useMemo, useState } from "react";
import { InContentMidCalculatorAd } from "@/components/AdSlot";
import {
  BomTable,
  DataTable,
  DiagramFrame,
  Field,
  FormulaPanel,
  MoneyField,
  NumberControl,
  PrintButton,
  PrintSignoff,
  SelectControl,
  Stat,
} from "@/components/calculators/shared";
import { useUnits } from "@/context/UnitContext";
import { formatFeetInches, formatQty } from "@/lib/engineering/format";
import { calculateRoof, pitchFromDegrees } from "@/lib/engineering/roof";
import type { Comparison, RoofInputs, RoofStyle } from "@/lib/types";

export function RoofPitchRafterCalculator({
  initial,
  comparison,
  project,
}: {
  initial: RoofInputs;
  comparison: Comparison;
  project: string;
}) {
  const units = useUnits();
  const metric = units.system === "metric";
  const [spanFt, setSpanFt] = useState(initial.spanFt);
  const [lengthFt, setLengthFt] = useState(initial.lengthFt);
  const [pitchRise, setPitchRise] = useState(initial.pitchRise);
  const [overhangFt, setOverhangFt] = useState(initial.overhangFt);
  const [ridgeIn, setRidgeIn] = useState(initial.ridgeIn);
  const [style, setStyle] = useState<RoofStyle>(initial.style);
  const [bundlePrice, setBundlePrice] = useState(42);
  const [sheetPrice, setSheetPrice] = useState(28);
  const [rollPrice, setRollPrice] = useState(55);

  const inputs = useMemo<RoofInputs>(
    () => ({ spanFt, lengthFt, pitchRise, overhangFt, ridgeIn, style }),
    [lengthFt, overhangFt, pitchRise, ridgeIn, spanFt, style],
  );
  const result = useMemo(() => calculateRoof(inputs), [inputs]);
  const pitches = comparison.kind === "pitch" ? comparison.risePer12 : [4, 6, 8, 12];
  const degrees = (Math.atan(pitchRise / 12) * 180) / Math.PI;

  const drawingSpan = spanFt + overhangFt * 2;
  const scale = 560 / Math.max(drawingSpan, 1);
  const left = 70;
  const baseY = 250;
  const body = spanFt * scale;
  const overhangPx = overhangFt * scale;
  const leftEave = left;
  const rightEave = left + body + overhangPx * 2;
  const wallLeft = left + overhangPx;
  const wallRight = wallLeft + body;
  const risePx = (spanFt / 2 + overhangFt) * (pitchRise / 12) * scale;
  const shedRise = (spanFt + overhangFt * 2) * (pitchRise / 12) * scale;
  const ridgeX = (leftEave + rightEave) / 2;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {formatQty(pitchRise, 2)} / 12 · {formatQty(result.angleDeg, 2)}°
        </p>
        <PrintButton />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form className="no-print space-y-4 rounded-xl border border-slate-700 bg-[#111c31] p-4">
          <Field label="Building width (span)">
            <NumberControl
              value={units.feetToDisplay(spanFt)}
              min={metric ? 1.2 : 4}
              max={metric ? 24 : 80}
              step={metric ? 0.1 : 0.5}
              suffix={metric ? "m" : "ft"}
              onChange={(value) => setSpanFt(units.displayToFeet(value))}
            />
          </Field>
          <Field label="Building length">
            <NumberControl
              value={units.feetToDisplay(lengthFt)}
              min={metric ? 1.2 : 4}
              max={metric ? 36 : 120}
              step={metric ? 0.1 : 0.5}
              suffix={metric ? "m" : "ft"}
              onChange={(value) => setLengthFt(units.displayToFeet(value))}
            />
          </Field>
          <Field label="Roof pitch" hint={`${formatQty(degrees, 2)} degrees`}>
            <NumberControl value={pitchRise} min={1} max={18} step={0.5} suffix="/12" onChange={setPitchRise} />
          </Field>
          <Field label="Pitch in degrees">
            <NumberControl
              value={degrees}
              min={4}
              max={56}
              step={0.1}
              suffix="deg"
              onChange={(value) => setPitchRise(Math.min(18, Math.max(1, pitchFromDegrees(value))))}
            />
          </Field>
          <Field label="Eave overhang">
            <NumberControl
              value={units.feetToDisplay(overhangFt)}
              min={0}
              max={metric ? 1.2 : 4}
              step={metric ? 0.05 : 0.25}
              suffix={metric ? "m" : "ft"}
              onChange={(value) => setOverhangFt(units.displayToFeet(value))}
            />
          </Field>
          <Field label="Ridge thickness" hint="Ignored on a shed roof.">
            <NumberControl
              value={units.inchesToDisplay(ridgeIn)}
              min={0}
              max={metric ? 90 : 3.5}
              step={metric ? 1 : 0.125}
              suffix={metric ? "mm" : "in"}
              onChange={(value) => setRidgeIn(units.displayToInches(value))}
            />
          </Field>
          <Field label="Roof style">
            <SelectControl
              value={style}
              onChange={(value) => setStyle(value as RoofStyle)}
              options={[
                { value: "gable", label: "Gable" },
                { value: "shed", label: "Shed" },
              ]}
            />
          </Field>
        </form>
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Pitch angle" value={`${formatQty(result.angleDeg, 2)}°`} detail={`Multiplier ${formatQty(result.multiplier, 4)}`} />
            <Stat label="Common rafter" value={formatFeetInches(result.rafterFt * 12)} detail={`Tail ${formatFeetInches(result.tailFt * 12)}`} />
            <Stat label="Cuts" value={`${formatQty(result.plumbDeg, 2)}° plumb`} detail={`${formatQty(result.seatDeg, 2)}° seat`} />
            <Stat label="Roof area" value={metric ? `${formatQty(result.areaM2, 1)} m²` : `${formatQty(result.areaFt2, 0)} ft²`} detail={`${formatQty(result.squares, 2)} squares`} />
            <Stat label="Shingle bundles" value={result.bundles.toLocaleString("en-US")} detail="3 bundles per square + 10% waste" />
            <Stat label="Sheathing / felt" value={`${result.sheets.toLocaleString("en-US")} sheets`} detail={`${result.rolls.toLocaleString("en-US")} underlayment rolls`} />
            <Stat label="Delivery weight" value={units.formatWeight(result.shipLb, 0)} detail={`${units.formatWeightOther(result.shipLb, 0)} · 70 lb bundles, 46 lb sheets, 28 lb rolls`} />
          </div>
          <DiagramFrame title={style === "gable" ? "Gable truss triangle" : "Shed roof triangle"} note="Rise and run are scaled from the span, overhang, and pitch. The small triangle is the pitch ratio.">
            <svg viewBox="0 0 720 380" className="h-auto w-full" role="img" aria-label="Scaled roof section">
              {style === "gable" ? (
                <g>
                  <line x1={wallLeft} y1={baseY} x2={wallLeft} y2={baseY + 70} stroke="currentColor" strokeWidth="3" />
                  <line x1={wallRight} y1={baseY} x2={wallRight} y2={baseY + 70} stroke="currentColor" strokeWidth="3" />
                  <polyline points={`${leftEave},${baseY} ${ridgeX},${baseY - risePx} ${rightEave},${baseY}`} fill="currentColor" opacity="0.06" stroke="#F59E0B" strokeWidth="2.5" />
                  <line x1={leftEave} y1={baseY + 28} x2={rightEave} y2={baseY + 28} stroke="currentColor" />
                  <text x={(leftEave + rightEave) / 2} y={baseY + 48} textAnchor="middle" fill="currentColor" fontSize="12">
                    Span {metric ? `${formatQty(spanFt * 0.3048, 2)} m` : `${formatQty(spanFt, 2)} ft`} + overhangs
                  </text>
                  <line x1={ridgeX} y1={baseY - risePx} x2={ridgeX} y2={baseY} stroke="currentColor" strokeDasharray="4 3" />
                  <text x={ridgeX + 8} y={(baseY - risePx + baseY) / 2} fill="currentColor" fontSize="12">
                    Rise {formatFeetInches(result.riseFt * 12)}
                  </text>
                </g>
              ) : (
                <g>
                  <line x1={wallLeft} y1={baseY - shedRise} x2={wallLeft} y2={baseY + 50} stroke="currentColor" strokeWidth="3" />
                  <line x1={wallRight} y1={baseY} x2={wallRight} y2={baseY + 50} stroke="currentColor" strokeWidth="3" />
                  <polyline points={`${leftEave},${baseY - shedRise} ${rightEave},${baseY}`} fill="currentColor" opacity="0.06" stroke="#F59E0B" strokeWidth="2.5" />
                  <text x={(leftEave + rightEave) / 2} y={baseY + 78} textAnchor="middle" fill="currentColor" fontSize="12">
                    Run {metric ? `${formatQty(spanFt * 0.3048, 2)} m` : `${formatQty(spanFt, 2)} ft`}
                  </text>
                </g>
              )}
              <g transform="translate(560,40)">
                <polyline points="0,80 70,80 70,20" fill="none" stroke="#F59E0B" strokeWidth="2" />
                <text x="35" y="98" textAnchor="middle" fill="currentColor" fontSize="12">12</text>
                <text x="82" y="54" fill="currentColor" fontSize="12">{formatQty(pitchRise, 1)}</text>
                <text x="0" y="14" fill="currentColor" fontSize="12">{formatQty(pitchRise, 1)} : 12</text>
              </g>
              <text x="70" y="28" fill="currentColor" fontSize="14">
                Rafter {formatFeetInches(result.rafterFt * 12)} · plumb {formatQty(result.plumbDeg, 1)}° · seat {formatQty(result.seatDeg, 1)}°
              </text>
            </svg>
          </DiagramFrame>
        </div>
      </div>
      <InContentMidCalculatorAd />
      <BomTable
        lines={[
          {
            item: "Architectural shingle bundles",
            net: `${formatQty(result.squares, 2)} squares`,
            waste: "10%",
            order: `${result.bundles.toLocaleString("en-US")} bundles`,
            price: <MoneyField label="Bundle price" usd={bundlePrice} onChange={setBundlePrice} />,
            total: units.formatMoney(result.bundles * bundlePrice),
          },
          {
            item: "4x8 CDX sheathing",
            net: `${formatQty(result.areaFt2 / 32, 1)} sheets`,
            waste: "10%",
            order: `${result.sheets.toLocaleString("en-US")} sheets`,
            price: <MoneyField label="Sheet price" usd={sheetPrice} onChange={setSheetPrice} />,
            total: units.formatMoney(result.sheets * sheetPrice),
          },
          {
            item: "Underlayment rolls",
            net: `${formatQty(result.areaFt2, 0)} ft²`,
            waste: "overlap allowance",
            order: `${result.rolls.toLocaleString("en-US")} rolls`,
            price: <MoneyField label="Roll price" usd={rollPrice} onChange={setRollPrice} />,
            total: units.formatMoney(result.rolls * rollPrice),
          },
          {
            item: "Ridge cap bundles",
            net: `${formatQty(result.ridgeFt, 1)} ft ridge`,
            waste: "—",
            order: `${result.ridgeBundles.toLocaleString("en-US")} bundles`,
            price: <span className="text-xs text-slate-400">25 ft per bundle</span>,
            total: "—",
          },
        ]}
      />
      <div className="mt-6">
        <DataTable
          caption="Side-by-side pitch comparison"
          columns={["Pitch", "Degrees", "Multiplier", "Rafter", "Squares", "Bundles", "Sheets"]}
          rows={pitches.map((pitch) => {
            const row = calculateRoof({ ...inputs, pitchRise: pitch });
            return {
              key: String(pitch),
              highlight: Math.abs(pitch - pitchRise) < 0.05,
              cells: [
                `${formatQty(pitch, 1)}/12`,
                `${formatQty(row.angleDeg, 2)}°`,
                formatQty(row.multiplier, 3),
                formatFeetInches(row.rafterFt * 12),
                formatQty(row.squares, 2),
                row.bundles.toLocaleString("en-US"),
                row.sheets.toLocaleString("en-US"),
              ],
            };
          })}
        />
      </div>
      <FormulaPanel>
        <p>Angle = arctan(rise ÷ 12). Multiplier = √(1 + (rise ÷ 12)²). Gable run = span ÷ 2 − ridge thickness ÷ 2. Rafter length = (run + horizontal overhang) × multiplier.</p>
        <p>Plumb cut = pitch angle. Seat cut = 90° − pitch angle. Area uses both slopes on a gable and one slope on a shed, and it includes a rake overhang equal to the eave overhang.</p>
        <p>Bundles = ceiling of squares × 3 × 1.10. Sheets = ceiling of area × 1.10 ÷ 32. Rolls use 360 ft² effective coverage. Delivery weight plans 70 lb per bundle, 46 lb per sheet, and 28 lb per roll, then the header converts that pound total at 1 lb = 0.45359237 kg.</p>
      </FormulaPanel>
      <PrintSignoff project={project} />
    </div>
  );
}
