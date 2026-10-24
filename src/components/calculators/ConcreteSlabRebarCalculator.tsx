"use client";

import { useId, useMemo, useState } from "react";
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
import {
  BAG_60_CUFT,
  BAG_80_CUFT,
  calculateConcrete,
  REBAR,
  TRUCK_YD3,
} from "@/lib/engineering/concrete";
import { formatQty } from "@/lib/engineering/format";
import type { Comparison, ConcreteInputs, ConcretePsi, RebarSize } from "@/lib/types";

const THICKNESS = [4, 5, 6, 8];
const SPACING = [12, 16, 18, 24];
const PSI: ConcretePsi[] = [3000, 3500, 4000, 5000];

function lengthLabel(feet: number, metric: boolean) {
  return metric ? `${formatQty(feet * 0.3048, 2)} m` : `${formatQty(feet, 2)} ft`;
}

export function ConcreteSlabRebarCalculator({
  initial,
  comparison,
  project,
}: {
  initial: ConcreteInputs;
  comparison: Comparison;
  project: string;
}) {
  const units = useUnits();
  const metric = units.system === "metric";
  const marker = useId().replace(/:/g, "");
  const [lengthFt, setLengthFt] = useState(initial.lengthFt);
  const [widthFt, setWidthFt] = useState(initial.widthFt);
  const [thicknessIn, setThicknessIn] = useState(initial.thicknessIn);
  const [thickenedEdge, setThickenedEdge] = useState(initial.thickenedEdge);
  const [footingWidthIn, setFootingWidthIn] = useState(initial.footingWidthIn);
  const [footingDepthIn, setFootingDepthIn] = useState(initial.footingDepthIn);
  const [rebarSize, setRebarSize] = useState<RebarSize>(initial.rebarSize);
  const [spacingIn, setSpacingIn] = useState(initial.spacingIn);
  const [psi, setPsi] = useState<ConcretePsi>(initial.psi);
  const [waste, setWaste] = useState(initial.waste);
  const [readyMixPerYd3, setReadyMixPerYd3] = useState(initial.readyMixPerYd3);
  const [bag80Price, setBag80Price] = useState(initial.bag80Price);
  const [bag60Price, setBag60Price] = useState(initial.bag60Price);
  const [rebarPrice, setRebarPrice] = useState(REBAR[initial.rebarSize].barUsd);
  const [rebarTouched, setRebarTouched] = useState(false);
  const [chairPrice, setChairPrice] = useState(0.28);
  const [tiePrice, setTiePrice] = useState(8);
  const [shortFeeOverride, setShortFeeOverride] = useState<number | null>(null);

  const inputs = useMemo<ConcreteInputs>(
    () => ({
      lengthFt,
      widthFt,
      thicknessIn,
      thickenedEdge,
      footingWidthIn,
      footingDepthIn,
      rebarSize,
      spacingIn,
      psi,
      waste,
      readyMixPerYd3,
      bag80Price,
      bag60Price,
    }),
    [
      bag60Price,
      bag80Price,
      footingDepthIn,
      footingWidthIn,
      lengthFt,
      psi,
      rebarSize,
      readyMixPerYd3,
      spacingIn,
      thickenedEdge,
      thicknessIn,
      waste,
      widthFt,
    ],
  );
  const result = useMemo(() => calculateConcrete(inputs), [inputs]);
  const rebarUnit = rebarTouched ? rebarPrice : REBAR[rebarSize].barUsd;
  const shortFee = shortFeeOverride ?? result.suggestedShortLoadFee;

  const readyTotal = result.readyMixMaterialUsd + shortFee;
  const spec = REBAR[rebarSize];
  const thicknesses = comparison.kind === "thickness" ? comparison.inches : [4, 5, 6, 8];
  const lengthMin = metric ? 1 : 4;
  const lengthMax = metric ? 36 : 120;

  const drawW = 460;
  const drawH = 250;
  const scale = Math.min(drawW / Math.max(lengthFt, 0.1), drawH / Math.max(widthFt, 0.1));
  const rectW = lengthFt * scale;
  const rectH = widthFt * scale;
  const originX = 70 + (drawW - rectW) / 2;
  const originY = 36 + (drawH - rectH) / 2;
  const verticalLines = Math.min(result.barsAlongWidth, 48);
  const horizontalLines = Math.min(result.barsAlongLength, 48);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Formula SSC-2026.1 · {psi.toLocaleString("en-US")} PSI
        </p>
        <PrintButton />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form className="no-print space-y-4 rounded-xl border border-slate-700 bg-[#111c31] p-4">
          <Field label={metric ? "Length" : "Length"} hint={metric ? "Meters" : "Feet"}>
            <NumberControl
              value={units.feetToDisplay(lengthFt)}
              min={lengthMin}
              max={lengthMax}
              step={metric ? 0.1 : 0.5}
              suffix={metric ? "m" : "ft"}
              onChange={(value) => setLengthFt(units.displayToFeet(value))}
            />
          </Field>
          <Field label="Width">
            <NumberControl
              value={units.feetToDisplay(widthFt)}
              min={lengthMin}
              max={lengthMax}
              step={metric ? 0.1 : 0.5}
              suffix={metric ? "m" : "ft"}
              onChange={(value) => setWidthFt(units.displayToFeet(value))}
            />
          </Field>
          <Field label="Slab thickness">
            <SelectControl
              value={String(thicknessIn)}
              onChange={(value) => setThicknessIn(Number(value))}
              options={THICKNESS.map((inch) => ({
                value: String(inch),
                label: metric ? `${Math.round(inch * 25.4)} mm` : `${inch} in`,
              }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={thickenedEdge}
              onChange={(event) => setThickenedEdge(event.target.checked)}
              className="accent-amber-400"
            />
            Thickened edge footing
          </label>
          {thickenedEdge ? (
            <>
              <Field label="Footing width">
                <NumberControl
                  value={units.inchesToDisplay(footingWidthIn)}
                  min={metric ? 150 : 6}
                  max={metric ? 610 : 24}
                  step={metric ? 1 : 0.5}
                  suffix={metric ? "mm" : "in"}
                  onChange={(value) => setFootingWidthIn(units.displayToInches(value))}
                />
              </Field>
              <Field label="Footing depth">
                <NumberControl
                  value={units.inchesToDisplay(footingDepthIn)}
                  min={metric ? 150 : 6}
                  max={metric ? 760 : 30}
                  step={metric ? 1 : 0.5}
                  suffix={metric ? "mm" : "in"}
                  onChange={(value) => setFootingDepthIn(units.displayToInches(value))}
                />
              </Field>
            </>
          ) : null}
          <Field label="Rebar size">
            <SelectControl
              value={rebarSize}
              onChange={(value) => setRebarSize(value as RebarSize)}
              options={(["3", "4", "5"] as RebarSize[]).map((size) => ({
                value: size,
                label: `${REBAR[size].label} / ${REBAR[size].metricLabel}`,
              }))}
            />
          </Field>
          <Field label="Rebar grid spacing">
            <SelectControl
              value={String(spacingIn)}
              onChange={(value) => setSpacingIn(Number(value))}
              options={SPACING.map((inch) => ({
                value: String(inch),
                label: metric ? `${Math.round(inch * 25.4)} mm OC` : `${inch} in OC`,
              }))}
            />
          </Field>
          <Field label="Concrete grade">
            <SelectControl
              value={String(psi)}
              onChange={(value) => setPsi(Number(value) as ConcretePsi)}
              options={PSI.map((grade) => ({
                value: String(grade),
                label: metric ? `${grade.toLocaleString("en-US")} PSI` : `${grade.toLocaleString("en-US")} PSI`,
              }))}
            />
          </Field>
          <Field label="Waste factor">
            <SelectControl
              value={String(waste)}
              onChange={(value) => setWaste(Number(value))}
              options={[
                { value: "0.05", label: "5%" },
                { value: "0.1", label: "10%" },
                { value: "0.15", label: "15%" },
              ]}
            />
          </Field>
          <Field label="Ready-mix price" hint="Price for the PSI selected, per cubic yard">
            <MoneyField label="Ready-mix price per cubic yard" usd={readyMixPerYd3} onChange={setReadyMixPerYd3} />
          </Field>
          <Field label="80 lb bag price">
            <MoneyField label="80 pound bag price" usd={bag80Price} onChange={setBag80Price} />
          </Field>
          <Field label="60 lb bag price">
            <MoneyField label="60 pound bag price" usd={bag60Price} onChange={setBag60Price} />
          </Field>
        </form>
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Order volume" value={`${formatQty(result.orderYd3)} yd³`} detail={`${formatQty(result.orderM3, 3)} m³ placed+waste`} />
            <Stat label="Order weight" value={units.formatWeight(result.orderLb, 0)} detail={units.formatWeightOther(result.orderLb, 0)} />
            <Stat label="80 lb bags" value={result.bags80.toLocaleString("en-US")} detail={`${result.pallets80.toLocaleString("en-US")} pallets at 42 bags`} />
            <Stat label="60 lb bags" value={result.bags60.toLocaleString("en-US")} detail={`${formatQty(BAG_60_CUFT, 2)} ft³ yield each`} />
            <Stat label="Rebar" value={metric ? `${formatQty(result.netLinM)} m` : `${formatQty(result.netLinFt)} ft`} detail={`${result.bars20.toLocaleString("en-US")} × 20 ft · ${result.bars6m.toLocaleString("en-US")} × 6 m · ${units.formatWeight(result.orderRebarLb, 0)}`} />
            <Stat label="Ready-mix vs bags" value={units.formatMoney(Math.min(readyTotal, result.bag80MaterialUsd))} detail={`Truck ${units.formatMoney(readyTotal)} · 80 lb bags ${units.formatMoney(result.bag80MaterialUsd)}`} />
          </div>
          <DiagramFrame
            title="Slab footprint and rebar grid"
            note="Grid lines are equalized so the drawing stays readable. The order count uses on-center spacing with a bar at each end of the layout, then holds concrete cover in the field."
          >
            <svg viewBox="0 0 640 430" className="h-auto w-full" role="img" aria-label="Scaled slab blueprint with rebar grid">
              <defs>
                <marker id={`${marker}-tick`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6" fill="none" stroke="currentColor" />
                </marker>
              </defs>
              <rect x="8" y="8" width="624" height="414" fill="none" stroke="currentColor" opacity="0.15" />
              {Array.from({ length: 12 }, (_, index) => (
                <line key={`v-${index}`} x1={20 + index * 52} y1="16" x2={20 + index * 52} y2="414" stroke="currentColor" opacity="0.06" />
              ))}
              <rect x={originX} y={originY} width={rectW} height={rectH} fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="1.5" />
              {thickenedEdge ? (
                <rect
                  x={originX + 8}
                  y={originY + 8}
                  width={Math.max(0, rectW - 16)}
                  height={Math.max(0, rectH - 16)}
                  fill="none"
                  stroke="#F59E0B"
                  strokeDasharray="4 3"
                />
              ) : null}
              {Array.from({ length: verticalLines }, (_, index) => {
                const t = verticalLines === 1 ? 0.5 : index / (verticalLines - 1);
                const x = originX + t * rectW;
                return <line key={`bar-v-${index}`} x1={x} y1={originY} x2={x} y2={originY + rectH} stroke="#F59E0B" strokeWidth="1" opacity="0.85" />;
              })}
              {Array.from({ length: horizontalLines }, (_, index) => {
                const t = horizontalLines === 1 ? 0.5 : index / (horizontalLines - 1);
                const y = originY + t * rectH;
                return <line key={`bar-h-${index}`} x1={originX} y1={y} x2={originX + rectW} y2={y} stroke="#F8FAFC" strokeWidth="1" opacity="0.75" />;
              })}
              <line x1={originX} y1={originY + rectH + 28} x2={originX + rectW} y2={originY + rectH + 28} stroke="currentColor" />
              <line x1={originX} y1={originY + rectH} x2={originX} y2={originY + rectH + 34} stroke="currentColor" />
              <line x1={originX + rectW} y1={originY + rectH} x2={originX + rectW} y2={originY + rectH + 34} stroke="currentColor" />
              <text x={originX + rectW / 2} y={originY + rectH + 46} textAnchor="middle" fill="currentColor" fontSize="12">
                {lengthLabel(lengthFt, metric)}
              </text>
              <text x={originX - 12} y={originY + rectH / 2} textAnchor="end" fill="currentColor" fontSize="12" transform={`rotate(-90 ${originX - 12} ${originY + rectH / 2})`}>
                {lengthLabel(widthFt, metric)}
              </text>
              <text x="320" y="400" textAnchor="middle" fill="currentColor" fontSize="12">
                {`${spec.label} / ${spec.metricLabel} at ${metric ? `${Math.round(spacingIn * 25.4)} mm` : `${spacingIn} in`} OC · ${thicknessIn} in slab`}
              </text>
            </svg>
          </DiagramFrame>
        </div>
      </div>
      <InContentMidCalculatorAd />
      <BomTable
        lines={[
          {
            item: "Ready-mix concrete",
            net: `${formatQty(result.netYd3)} yd³`,
            waste: `${Math.round(waste * 100)}%`,
            order: `${formatQty(result.orderYd3)} yd³ / ${formatQty(result.orderM3, 3)} m³`,
            price: <MoneyField label="Ready-mix unit price" usd={readyMixPerYd3} onChange={setReadyMixPerYd3} />,
            total: units.formatMoney(result.readyMixMaterialUsd),
            search: `${psi} PSI ready mix concrete`,
          },
          {
            item: "Short-load fee",
            net: result.orderYd3 < 4 ? "Under 4 yd³" : "Full load",
            waste: "—",
            order: result.trucksToOrder.toLocaleString("en-US") + ` truck @ ${TRUCK_YD3} yd³`,
            price: (
              <MoneyField
                label="Short-load fee"
                usd={shortFee}
                onChange={(value) => setShortFeeOverride(value)}
              />
            ),
            total: units.formatMoney(shortFee),
            search: "Laser Distance Measure",
          },
          {
            item: "80 lb pre-mix bags",
            net: `${formatQty(result.netFt3 / BAG_80_CUFT, 1)} bags`,
            waste: `${Math.round(waste * 100)}%`,
            order: `${result.bags80.toLocaleString("en-US")} bags`,
            price: <MoneyField label="80 pound bag price" usd={bag80Price} onChange={setBag80Price} />,
            total: units.formatMoney(result.bag80MaterialUsd),
            search: "80 lb concrete mix bags",
          },
          {
            item: "60 lb pre-mix bags",
            net: `${formatQty(result.netFt3 / BAG_60_CUFT, 1)} bags`,
            waste: `${Math.round(waste * 100)}%`,
            order: `${result.bags60.toLocaleString("en-US")} bags`,
            price: <MoneyField label="60 pound bag price" usd={bag60Price} onChange={setBag60Price} />,
            total: units.formatMoney(result.bag60MaterialUsd),
            search: "60 lb concrete mix bags",
          },
          {
            item: `${spec.label} rebar sticks, 20 ft`,
            net: `${result.bars20.toLocaleString("en-US")} sticks`,
            waste: `${Math.round(waste * 100)}%`,
            order: `${result.orderBars20.toLocaleString("en-US")} sticks / ${result.bars6m.toLocaleString("en-US")} × 6 m`,
            price: (
              <MoneyField
                label="Rebar stick price"
                usd={rebarUnit}
                onChange={(value) => {
                  setRebarTouched(true);
                  setRebarPrice(value);
                }}
              />
            ),
            total: units.formatMoney(result.orderBars20 * rebarUnit),
            search: `${spec.label} rebar 20 ft`,
          },
          {
            item: "Rebar chairs",
            net: `${result.intersections.toLocaleString("en-US")} crossings`,
            waste: `${Math.round(waste * 100)}%`,
            order: `${result.chairs.toLocaleString("en-US")} chairs`,
            price: <MoneyField label="Chair price" usd={chairPrice} onChange={setChairPrice} />,
            total: units.formatMoney(result.chairs * chairPrice),
            search: "Rebar Support Chairs",
          },
          {
            item: "Tie wire rolls",
            net: `${result.intersections.toLocaleString("en-US")} ties`,
            waste: `${Math.round(waste * 100)}%`,
            order: `${result.tieRolls.toLocaleString("en-US")} rolls`,
            price: <MoneyField label="Tie wire roll price" usd={tiePrice} onChange={setTiePrice} />,
            total: units.formatMoney(result.tieRolls * tiePrice),
            search: "rebar tie wire",
          },
        ]}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl border p-4 ${readyTotal <= result.bag80MaterialUsd ? "border-emerald-500/50" : "border-slate-700"}`}>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Ready-mix truck</p>
          <p className="mt-1 font-mono text-2xl text-slate-50">{units.formatMoney(readyTotal)}</p>
          <p className="text-sm text-slate-400">{formatQty(result.truckLoads)} nominal 10 yd³ loads · {result.trucksToOrder} to order</p>
        </div>
        <div className={`rounded-xl border p-4 ${result.bag80MaterialUsd < readyTotal ? "border-emerald-500/50" : "border-slate-700"}`}>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">80 lb bags</p>
          <p className="mt-1 font-mono text-2xl text-slate-50">{units.formatMoney(result.bag80MaterialUsd)}</p>
          <p className="text-sm text-slate-400">60 lb alternative {units.formatMoney(result.bag60MaterialUsd)} · delivery weight {units.formatWeight(result.orderLb, 0)}</p>
        </div>
      </div>
      <div className="mt-6">
        <DataTable
          caption="Side-by-side thickness comparison at the same footprint"
          columns={["Thickness", "Order yd³", "Order m³", "80 lb bags", "Rebar ft", "Ready-mix", "80 lb cost"]}
          rows={thicknesses.map((inch) => {
            const row = calculateConcrete({ ...inputs, thicknessIn: inch });
            const fee = row.suggestedShortLoadFee;
            return {
              key: String(inch),
              highlight: inch === thicknessIn,
              cells: [
                metric ? `${Math.round(inch * 25.4)} mm` : `${inch} in`,
                formatQty(row.orderYd3),
                formatQty(row.orderM3, 3),
                row.bags80.toLocaleString("en-US"),
                formatQty(row.orderLinFt, 0),
                units.formatMoney(row.readyMixMaterialUsd + (inch === thicknessIn ? shortFee : fee)),
                units.formatMoney(row.bag80MaterialUsd),
              ],
            };
          })}
        />
      </div>
      <FormulaPanel>
        <p>Slab ft³ = L × W × thickness ÷ 12. Thickened-edge extra = footing band × (footing depth − slab thickness), with corner squares counted once.</p>
        <p>yd³ = ft³ ÷ 27. m³ = ft³ × 0.0283168. Weight uses 150 lb/ft³, then the header converts that pound total at 1 lb = 0.45359237 kg. 80 lb bags yield {BAG_80_CUFT} ft³ and 60 lb bags yield {BAG_60_CUFT} ft³. Currency changes the price labels only.</p>
        <p>Bars across a span = floor(span ÷ spacing) + 1. Order sticks = that count, plus 10, 5, or 15 percent waste, cut from 20 ft and 6 m stock. Chairs = one per grid intersection.</p>
      </FormulaPanel>
      <PrintSignoff project={project} />
    </div>
  );
}
