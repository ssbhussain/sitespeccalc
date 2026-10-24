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
import { LB_TO_KG, useUnits } from "@/context/UnitContext";
import { CONTAINERS, calculateContainer } from "@/lib/engineering/container";
import { formatQty } from "@/lib/engineering/format";
import type { Comparison, ContainerId, ContainerInputs, FreightRateBasis, PalletStandard } from "@/lib/types";

const CONTAINER_OPTIONS: { value: ContainerId; label: string }[] = [
  { value: "20ft", label: "20 ft dry" },
  { value: "40ft", label: "40 ft dry" },
  { value: "40hc", label: "40 ft high cube" },
  { value: "53ft", label: "53 ft US trailer" },
];

export function ContainerPalletWeightCalculator({
  initial,
  comparison,
  project,
}: {
  initial: ContainerInputs;
  comparison: Comparison;
  project: string;
}) {
  const units = useUnits();
  const metric = units.system === "metric";
  const [container, setContainer] = useState<ContainerId>(initial.container);
  const [pallet, setPallet] = useState<PalletStandard>(initial.pallet);
  const [customPalletLengthIn, setCustomPalletLengthIn] = useState(initial.customPalletLengthIn);
  const [customPalletWidthIn, setCustomPalletWidthIn] = useState(initial.customPalletWidthIn);
  const [boxLengthIn, setBoxLengthIn] = useState(initial.boxLengthIn);
  const [boxWidthIn, setBoxWidthIn] = useState(initial.boxWidthIn);
  const [boxHeightIn, setBoxHeightIn] = useState(initial.boxHeightIn);
  const [boxWeightLb, setBoxWeightLb] = useState(initial.boxWeightLb);
  const [stackable, setStackable] = useState(initial.stackable);
  const [rateBasis, setRateBasis] = useState<FreightRateBasis>(initial.rateBasis);
  const [rateUsd, setRateUsd] = useState(initial.rateUsd);

  const inputs = useMemo<ContainerInputs>(
    () => ({
      container,
      pallet,
      customPalletLengthIn,
      customPalletWidthIn,
      boxLengthIn,
      boxWidthIn,
      boxHeightIn,
      boxWeightLb,
      stackable,
      rateBasis,
      rateUsd,
    }),
    [boxHeightIn, boxLengthIn, boxWeightLb, boxWidthIn, container, customPalletLengthIn, customPalletWidthIn, pallet, rateBasis, rateUsd, stackable],
  );
  const result = calculateContainer(inputs);
  const compareIds = comparison.kind === "container" ? comparison.ids : (Object.keys(CONTAINERS) as ContainerId[]);
  const lengthSuffix = metric ? "mm" : "in";
  const toLength = (inches: number) => (metric ? inches * 25.4 : inches);
  const fromLength = (display: number) => (metric ? display / 25.4 : display);
  const weightShown = units.weight === "kg" ? boxWeightLb * LB_TO_KG : boxWeightLb;
  const payloadRatio = result.payloadKg <= 0 ? 0 : result.totalKg / result.payloadKg;
  const gauge = Math.min(payloadRatio, 1.15);
  const gaugeColor = result.overweight ? "#f87171" : gauge > 0.9 ? "#F59E0B" : "#34d399";
  const scale = 640 / result.spec.lengthM;
  const planH = result.spec.widthM * scale;

  const rateLabel =
    rateBasis === "cbm" ? "Freight rate per cubic meter" : rateBasis === "tonne" ? "Freight rate per billable tonne" : "Freight rate per billable pound";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Floor grid · SSC-2026.1</p>
        <PrintButton />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <Field label="Container or trailer">
            <SelectControl value={container} onChange={(value) => setContainer(value as ContainerId)} options={CONTAINER_OPTIONS} />
          </Field>
          <Field label="Pallet standard">
            <SelectControl
              value={pallet}
              onChange={(value) => setPallet(value as PalletStandard)}
              options={[
                { value: "gma", label: "US GMA 48×40 in" },
                { value: "epal", label: "Euro EPAL 1200×800 mm" },
                { value: "uk", label: "UK 1200×1000 mm" },
                { value: "custom", label: "Custom" },
              ]}
            />
          </Field>
          {pallet === "custom" ? (
            <>
              <Field label="Custom pallet length" hint={lengthSuffix}>
                <NumberControl min={metric ? 400 : 16} max={metric ? 2000 : 80} step={metric ? 10 : 0.5} suffix={lengthSuffix} value={toLength(customPalletLengthIn)} onChange={(value) => setCustomPalletLengthIn(fromLength(value))} />
              </Field>
              <Field label="Custom pallet width" hint={lengthSuffix}>
                <NumberControl min={metric ? 400 : 16} max={metric ? 1600 : 60} step={metric ? 10 : 0.5} suffix={lengthSuffix} value={toLength(customPalletWidthIn)} onChange={(value) => setCustomPalletWidthIn(fromLength(value))} />
              </Field>
            </>
          ) : null}
          <Field label="Box length" hint={lengthSuffix}>
            <NumberControl min={metric ? 50 : 2} max={metric ? 1200 : 48} step={metric ? 5 : 0.25} suffix={lengthSuffix} value={toLength(boxLengthIn)} onChange={(value) => setBoxLengthIn(fromLength(value))} />
          </Field>
          <Field label="Box width" hint={lengthSuffix}>
            <NumberControl min={metric ? 50 : 2} max={metric ? 1200 : 48} step={metric ? 5 : 0.25} suffix={lengthSuffix} value={toLength(boxWidthIn)} onChange={(value) => setBoxWidthIn(fromLength(value))} />
          </Field>
          <Field label="Box height" hint={lengthSuffix}>
            <NumberControl min={metric ? 50 : 2} max={metric ? 1500 : 60} step={metric ? 5 : 0.25} suffix={lengthSuffix} value={toLength(boxHeightIn)} onChange={(value) => setBoxHeightIn(fromLength(value))} />
          </Field>
          <Field label="Weight per box" hint={units.weight}>
            <NumberControl
              min={units.weight === "kg" ? 0.5 : 1}
              max={units.weight === "kg" ? 500 : 1100}
              step={units.weight === "kg" ? 0.5 : 1}
              suffix={units.weight}
              value={weightShown}
              onChange={(value) => setBoxWeightLb(units.weight === "kg" ? value / LB_TO_KG : value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={stackable} onChange={(event) => setStackable(event.target.checked)} className="accent-amber-400" />
            Stackable pallets, two high when the internal height allows
          </label>
          <Field label="Rate basis">
            <SelectControl
              value={rateBasis}
              onChange={(value) => setRateBasis(value as FreightRateBasis)}
              options={[
                { value: "cbm", label: "Per cubic meter" },
                { value: "tonne", label: "Per billable tonne" },
                { value: "lb", label: "Per billable pound" },
              ]}
            />
          </Field>
          <Field label={rateLabel}>
            <MoneyField label={rateLabel} usd={rateUsd} onChange={setRateUsd} />
          </Field>
        </form>
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Pallets on the floor" value={result.floorCount.toLocaleString("en-US")} detail={result.levels === 2 ? "Double-stacked, two levels" : "One level"} />
            <Stat label="Pallets in the box" value={result.totalPallets.toLocaleString("en-US")} detail={`${result.totalBoxes.toLocaleString("en-US")} cartons`} />
            <Stat label="Cargo volume" value={`${formatQty(result.cargoCbm, 2)} m³`} detail={`${formatQty(result.cargoFt3, 0)} ft³`} />
            <Stat label="Payload" value={units.formatWeight(result.totalLb, 0)} detail={`${units.formatWeightOther(result.totalLb, 0)} · limit ${units.formatWeight(result.payloadLb, 0)}`} tone={result.overweight ? "border-red-400/70 bg-red-950/40" : undefined} />
            <Stat label="Billable weight" value={units.formatWeight(result.billableLb, 0)} detail={`DIM ${units.formatWeight(result.volumetricKg / LB_TO_KG, 0)} · actual ${units.formatWeight(result.totalLb, 0)}`} />
            <Stat label="Freight cost" value={units.formatMoney(result.freightUsd)} detail={`${units.formatMoney(result.costPerBoxUsd)} per carton`} />
          </div>
          {result.warnings.length ? (
            <ul className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          <DiagramFrame title="Container floor plan" note="Each rectangle is one pallet slot on the floor. A second level uses the same footprint when the stackable toggle and the internal height both allow it.">
            <svg viewBox={`0 0 720 ${Math.max(220, planH + 90)}`} className="h-auto w-full" role="img" aria-label="Top-down pallet slots inside the container">
              <rect x="40" y="24" width={result.spec.lengthM * scale} height={planH} fill="currentColor" opacity="0.06" stroke="#F8FAFC" strokeWidth="2" />
              {result.slots.map((slot, index) => (
                <rect key={`${slot.x}-${slot.y}-${index}`} x={40 + slot.x * scale} y={24 + slot.y * scale} width={Math.max(1, slot.w * scale - 1.5)} height={Math.max(1, slot.h * scale - 1.5)} fill="#F59E0B" opacity="0.85" />
              ))}
              <text x="40" y={planH + 48} fill="currentColor" fontSize="12">
                {result.spec.label} · {result.floorCount} floor slots · {result.levels === 2 ? "2 levels" : "1 level"}
              </text>
              <text x="40" y={planH + 68} fill="currentColor" fontSize="12">
                Payload {formatQty(payloadRatio * 100, 0)}% of planning limit
              </text>
              <rect x="250" y={planH + 56} width="280" height="10" rx="2" fill="currentColor" opacity="0.15" />
              <rect x="250" y={planH + 56} width={Math.min(280, 280 * gauge)} height="10" rx="2" fill={gaugeColor} />
            </svg>
          </DiagramFrame>
        </div>
      </div>
      <InContentMidCalculatorAd />
      <BomTable
        lines={[
          {
            item: `${result.palletLabel} pallets`,
            net: `${result.floorCount} floor`,
            waste: result.levels === 2 ? "second level" : "single height",
            order: `${result.totalPallets} pallets`,
            price: <span className="text-xs text-slate-400">Tare is included in payload</span>,
            total: units.formatWeight((result.totalKg - result.totalBoxes * boxWeightLb * LB_TO_KG) / LB_TO_KG, 0),
            search: `${result.palletLabel} wood shipping pallet`,
          },
          {
            item: "Cartons",
            net: `${result.boxesPerLayer} per layer`,
            waste: `${result.layersPerPallet} layers`,
            order: `${result.totalBoxes.toLocaleString("en-US")} cartons`,
            price: <span className="text-xs text-slate-400">{units.formatWeight(boxWeightLb, 1)} each</span>,
            total: units.formatWeight(result.totalBoxes * boxWeightLb, 0),
            search: "corrugated shipping cartons",
          },
          {
            item: "Freight",
            net: `${formatQty(result.cargoCbm, 2)} m³`,
            waste: "DIM vs actual",
            order: units.formatWeight(result.billableLb, 0),
            price: <MoneyField label={rateLabel} usd={rateUsd} onChange={setRateUsd} />,
            total: units.formatMoney(result.freightUsd),
            search: "pallet jack",
          },
        ]}
      />
      <div className="mt-6">
        <DataTable
          caption="Side-by-side container comparison for this pallet and carton"
          columns={["Container", "Floor slots", "Pallets", "m³", "ft³", "Payload", "Limit", "Freight"]}
          rows={compareIds.map((id) => {
            const row = calculateContainer({ ...inputs, container: id });
            return {
              key: id,
              highlight: id === container,
              cells: [
                CONTAINERS[id].label,
                String(row.floorCount),
                String(row.totalPallets),
                formatQty(row.cargoCbm, 2),
                formatQty(row.cargoFt3, 0),
                units.formatWeight(row.totalLb, 0),
                units.formatWeight(row.payloadLb, 0),
                units.formatMoney(row.freightUsd),
              ],
            };
          })}
        />
      </div>
      <FormulaPanel>
        <p>Floor slots are a non-overlapping grid. The count is the better of one orientation, two orientations side by side, or repeated columns across the internal width. Euro 1200×800 mm resolves to 11 slots in a 20 ft dry container and 25 in a 40 ft dry container.</p>
        <p>Cartons per pallet are the same grid on the pallet deck, times the layers that fit above a 150 mm deck and below the internal height, with 50 mm of clearance. Stackable freight uses two levels only when both levels fit.</p>
        <p>Cargo volume is the carton cube. Volumetric weight is 167 kg per cubic meter. Billable weight is the greater of actual payload, including pallet tare, and volumetric weight. A per-cubic-meter rate uses the carton cube. A per-tonne or per-pound rate uses the billable weight. Payload limits are planning figures, not a carrier scale ticket.</p>
      </FormulaPanel>
      <PrintSignoff project={project} />
    </div>
  );
}
