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
import { formatFeetInches, formatInches, formatMm, formatQty } from "@/lib/engineering/format";
import { calculateStairs } from "@/lib/engineering/stairs";
import type { Comparison, StairInputs, StringerMount } from "@/lib/types";

export function StairStringerLayoutCalculator({
  initial,
  comparison,
  project,
}: {
  initial: StairInputs;
  comparison: Comparison;
  project: string;
}) {
  const units = useUnits();
  const metric = units.system === "metric";
  const [totalRiseIn, setTotalRiseIn] = useState(initial.totalRiseIn);
  const [targetRiseIn, setTargetRiseIn] = useState(initial.targetRiseIn);
  const [treadIn, setTreadIn] = useState(initial.treadIn);
  const [widthIn, setWidthIn] = useState(initial.widthIn);
  const [mount, setMount] = useState<StringerMount>(initial.mount);
  const [landingThicknessIn, setLandingThicknessIn] = useState(initial.landingThicknessIn);
  const [boardPrice, setBoardPrice] = useState(2.1);

  const inputs = useMemo<StairInputs>(
    () => ({ totalRiseIn, targetRiseIn, treadIn, widthIn, mount, landingThicknessIn }),
    [landingThicknessIn, mount, targetRiseIn, totalRiseIn, treadIn, widthIn],
  );
  const result = useMemo(() => calculateStairs(inputs), [inputs]);
  const pass = result.riserPass && result.treadPass && result.warnings.length === 0;
  const stockLabel = result.stockFt ? `${result.stockFt} ft 2x12` : "Over 24 ft";
  const boardUsd = (result.stockFt ?? Math.ceil(result.boardIn / 12)) * boardPrice * result.stringers;

  const riseRows =
    comparison.kind === "total-rise"
      ? comparison.inches
      : comparison.kind === "target-rise"
        ? null
        : [36, 48, 60, 72, 84, 96];
  const targetRows = comparison.kind === "target-rise" ? comparison.inches : [7, 7.25, 7.5, 7.75];

  const scale = Math.min(560 / Math.max(result.totalRunIn, 1), 230 / Math.max(result.totalRiseUsedIn, 1));
  const originX = 100;
  const originY = 320;
  const profile: { x: number; y: number }[] = [];
  let x = originX;
  let y = originY;
  profile.push({ x, y });
  for (let index = 0; index < result.risers; index += 1) {
    y -= result.riserIn * scale;
    profile.push({ x, y });
    if (index < result.risers - 1) {
      x += treadIn * scale;
      profile.push({ x, y });
    }
  }
  const end = profile[profile.length - 1] ?? { x: originX, y: originY };
  const vx = end.x - originX;
  const vy = end.y - originY;
  const vlen = Math.hypot(vx, vy) || 1;
  let offX = -vy / vlen;
  let offY = vx / vlen;
  if (offY < 0) {
    offX *= -1;
    offY *= -1;
  }
  const thickness = 32;
  const bottomStart = { x: originX + offX * thickness, y: originY + offY * thickness };
  const bottomEnd = { x: end.x + offX * thickness, y: end.y + offY * thickness };
  const zig = profile.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${pass ? "border-emerald-500 text-emerald-300" : "border-amber-400 text-amber-200"}`}>
          {pass ? "IRC check pass" : "IRC check warning"}
        </p>
        <PrintButton />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form className="no-print space-y-4 rounded-xl border border-slate-700 bg-[#111c31] p-4">
          <Field label="Floor-to-floor rise" hint={metric ? formatMm(totalRiseIn * 25.4, 0) : formatFeetInches(totalRiseIn)}>
            <NumberControl
              value={units.inchesToDisplay(totalRiseIn)}
              min={metric ? 300 : 12}
              max={metric ? 4500 : 180}
              step={metric ? 1 : 0.25}
              suffix={metric ? "mm" : "in"}
              onChange={(value) => setTotalRiseIn(units.displayToInches(value))}
            />
          </Field>
          <Field label="Target step rise" hint="IRC maximum is 7.75 in. This check also flags under 4 in.">
            <NumberControl
              value={units.inchesToDisplay(targetRiseIn)}
              min={metric ? 100 : 4}
              max={metric ? 200 : 8}
              step={metric ? 1 : 0.0625}
              suffix={metric ? "mm" : "in"}
              onChange={(value) => setTargetRiseIn(units.displayToInches(value))}
            />
          </Field>
          <Field label="Tread depth" hint="IRC minimum tread is 10 in.">
            <NumberControl
              value={units.inchesToDisplay(treadIn)}
              min={metric ? 230 : 9}
              max={metric ? 360 : 14}
              step={metric ? 1 : 0.125}
              suffix={metric ? "mm" : "in"}
              onChange={(value) => setTreadIn(units.displayToInches(value))}
            />
          </Field>
          <Field label="Stair width">
            <NumberControl
              value={units.inchesToDisplay(widthIn)}
              min={metric ? 600 : 24}
              max={metric ? 3600 : 144}
              step={metric ? 10 : 1}
              suffix={metric ? "mm" : "in"}
              onChange={(value) => setWidthIn(units.displayToInches(value))}
            />
          </Field>
          <Field label="Stringer mount">
            <SelectControl
              value={mount}
              onChange={(value) => setMount(value as StringerMount)}
              options={[
                { value: "standard", label: "Standard" },
                { value: "dropped", label: "Dropped header" },
              ]}
            />
          </Field>
          <Field label="Deck or landing thickness">
            <NumberControl
              value={units.inchesToDisplay(landingThicknessIn)}
              min={0}
              max={metric ? 300 : 12}
              step={metric ? 1 : 0.125}
              suffix={metric ? "mm" : "in"}
              onChange={(value) => setLandingThicknessIn(units.displayToInches(value))}
            />
          </Field>
        </form>
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Risers / treads" value={`${result.risers} / ${result.treads}`} detail={result.riserPass ? "Riser inside 4 to 7.75 in" : `Try ${result.suggestedRisers} risers`} />
            <Stat label="Exact riser" value={formatInches(result.riserIn)} detail={formatMm(result.riserIn * 25.4, 1)} />
            <Stat label="Total run" value={formatFeetInches(result.totalRunIn)} detail={formatMm(result.totalRunIn * 25.4, 0)} />
            <Stat label="Stringer length" value={formatFeetInches(result.diagonalIn)} detail={`Order ${stockLabel}`} />
            <Stat label="Incline" value={`${formatQty(result.angleDeg, 2)}°`} detail={`Square ${formatInches(result.riserIn)} rise · ${formatInches(treadIn)} run`} />
            <Stat label="Stringers @ 16 in" value={String(result.stringers)} detail={`Throat ${formatQty(result.throatIn, 2)} in on a 2x12`} />
          </div>
          {result.warnings.length ? (
            <ul className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          <DiagramFrame title="Notched 2x12 side profile" note="Rise, run, and the incline are scaled from the live riser and tread. Framing-square gauges match the exact riser and the tread depth.">
            <svg viewBox="0 0 760 420" className="h-auto w-full" role="img" aria-label="Side profile of a notched stair stringer">
              <polygon points={`${zig} ${bottomEnd.x},${bottomEnd.y} ${bottomStart.x},${bottomStart.y}`} fill="currentColor" opacity="0.08" stroke="currentColor" />
              <polyline points={zig} fill="none" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1={originX - 36} y1={originY} x2={originX - 36} y2={end.y} stroke="currentColor" />
              <text x={originX - 44} y={(originY + end.y) / 2} textAnchor="end" fill="currentColor" fontSize="12">
                {metric ? formatMm(result.totalRiseUsedIn * 25.4, 0) : formatFeetInches(result.totalRiseUsedIn)}
              </text>
              <line x1={originX} y1={originY + 36} x2={end.x} y2={originY + 36} stroke="currentColor" />
              <text x={(originX + end.x) / 2} y={originY + 54} textAnchor="middle" fill="currentColor" fontSize="12">
                Run {metric ? formatMm(result.totalRunIn * 25.4, 0) : formatFeetInches(result.totalRunIn)}
              </text>
              <text x="380" y="28" textAnchor="middle" fill="currentColor" fontSize="14">
                θ {formatQty(result.angleDeg, 1)}° · gauges {formatInches(result.riserIn)} × {formatInches(treadIn)}
              </text>
              <text x={end.x + 8} y={end.y + 16} fill="currentColor" fontSize="12">{mount === "dropped" ? "Dropped header" : "Standard mount"}</text>
            </svg>
          </DiagramFrame>
        </div>
      </div>
      <InContentMidCalculatorAd />
      <BomTable
        lines={[
          {
            item: stockLabel,
            net: `${formatQty(result.boardIn / 12, 2)} ft cut`,
            waste: "end cuts included",
            order: `${result.stringers} boards`,
            price: <MoneyField label="2x12 price per foot" usd={boardPrice} onChange={setBoardPrice} />,
            total: units.formatMoney(boardUsd),
          },
          {
            item: "Stringer delivery weight",
            net: `${formatQty(result.lumberLb, 0)} lb`,
            waste: "—",
            order: metric ? `${formatQty(result.lumberLb * 0.45359237, 0)} kg` : `${formatQty(result.lumberLb, 0)} lb`,
            price: <span className="text-xs text-slate-400">2.8 lb/ft planning weight</span>,
            total: "—",
          },
        ]}
      />
      <div className="mt-6">
        {riseRows ? (
          <DataTable
            caption="Side-by-side total rise"
            columns={["Total rise", "Risers", "Exact riser", "Treads", "Run", "2x12 stock", "Check"]}
            rows={riseRows.map((rise) => {
              const row = calculateStairs({ ...inputs, totalRiseIn: rise });
              const ok = row.riserPass && row.treadPass;
              return {
                key: String(rise),
                highlight: Math.abs(rise - totalRiseIn) < 0.2,
                cells: [
                  formatFeetInches(rise),
                  String(row.risers),
                  formatInches(row.riserIn),
                  String(row.treads),
                  formatFeetInches(row.totalRunIn),
                  row.stockFt ? `${row.stockFt} ft` : "splice",
                  ok ? "Pass" : "Warning",
                ],
              };
            })}
          />
        ) : (
          <DataTable
            caption="Side-by-side target riser"
            columns={["Target", "Risers", "Exact riser", "Run", "Angle", "Check"]}
            rows={targetRows.map((rise) => {
              const row = calculateStairs({ ...inputs, targetRiseIn: rise });
              return {
                key: String(rise),
                highlight: Math.abs(rise - targetRiseIn) < 0.02,
                cells: [
                  formatInches(rise),
                  String(row.risers),
                  formatInches(row.riserIn),
                  formatFeetInches(row.totalRunIn),
                  `${formatQty(row.angleDeg, 1)}°`,
                  row.riserPass && row.treadPass ? "Pass" : "Warning",
                ],
              };
            })}
          />
        )}
      </div>
      <FormulaPanel>
        <p>Risers = round(total rise ÷ target rise). Exact riser = total rise ÷ risers, reported to the nearest 1/16 in and in millimeters. Treads = risers − 1. Total run = treads × tread depth.</p>
        <p>Diagonal = hypotenuse of stringer rise and total run. A dropped header uses total rise minus landing thickness. Stock is the next 8, 10, 12, 14, 16, 18, 20, or 24 ft board.</p>
        <p>Stringers = floor(width ÷ 16) + 1, with a minimum of 2. Throat ≈ 11.25 − (riser × tread) ÷ hypotenuse.</p>
      </FormulaPanel>
      <PrintSignoff project={project} />
    </div>
  );
}
