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
  PrintSignoff,
  QuoteShareActions,
  SelectControl,
  Stat,
} from "@/components/calculators/shared";
import { useUnits } from "@/context/UnitContext";
import { choiceParam, flagParam, numberParam, useApplyQuery, usePublishSearchParams } from "@/hooks/useUrlSyncedState";
import { formatQty } from "@/lib/engineering/format";
import {
  CONDUIT_USD_PER_FT,
  conductorWeightLb,
  defaultWirePrice,
  estimateCircuitCost,
  K_ALUMINUM,
  K_COPPER,
  recommendWire,
  systemProfile,
  wireName,
  type WireRecommendation,
} from "@/lib/engineering/wire";
import type { Comparison, ConductorMaterial, ConduitType, WireInputs, WireSystem } from "@/lib/types";

const SYSTEMS: { value: WireSystem; label: string }[] = [
  { value: "1ph-120", label: "Single-phase 120 V" },
  { value: "1ph-240", label: "Single-phase 240 V" },
  { value: "1ph-230", label: "Single-phase 230 V" },
  { value: "3ph-208", label: "Three-phase 208 V" },
  { value: "3ph-400", label: "Three-phase 400 V" },
  { value: "3ph-480", label: "Three-phase 480 V" },
];

const TONE = {
  green: "border-emerald-500/60 bg-emerald-500/10",
  amber: "border-amber-400/60 bg-amber-400/10",
  red: "border-red-500/60 bg-red-500/10",
};

function describe(result: WireRecommendation) {
  if (!result.wire) return "No size";
  const sets = result.sets > 1 ? `${result.sets} sets of ` : "";
  return `${sets}${wireName(result.wire)} · ${formatQty(result.wire.mm2, result.wire.mm2 >= 10 ? 1 : 2)} mm²`;
}

export function WireSizeVoltageDropCalculator({
  initial,
  comparison,
  project,
}: {
  initial: WireInputs;
  comparison: Comparison;
  project: string;
}) {
  const units = useUnits();
  const metric = units.system === "metric";
  const clipId = useId().replace(/:/g, "");
  const [system, setSystem] = useState<WireSystem>(initial.system);
  const [material, setMaterial] = useState<ConductorMaterial>(initial.material);
  const [amps, setAmps] = useState(initial.amps);
  const [distanceFt, setDistanceFt] = useState(initial.distanceFt);
  const [maxDropPct, setMaxDropPct] = useState(initial.maxDropPct);
  const [conduit, setConduit] = useState<ConduitType>(initial.conduit);
  const [continuous, setContinuous] = useState(initial.continuous);
  const [loadLabel, setLoadLabel] = useState(initial.loadLabel);
  const [wireUsd, setWireUsd] = useState(() => {
    const seed = recommendWire(initial);
    return seed.wire ? defaultWirePrice(seed.wire, initial.material) : 1;
  });
  const [priceTouched, setPriceTouched] = useState(false);
  const [conduitUsd, setConduitUsd] = useState(CONDUIT_USD_PER_FT[initial.conduit]);
  const [conduitTouched, setConduitTouched] = useState(false);
  const queryReady = useApplyQuery((params) => {
    setSystem(choiceParam(params, "sys", initial.system, SYSTEMS.map((item) => item.value)));
    setMaterial(choiceParam(params, "mat", initial.material, ["copper", "aluminum"] as const));
    setAmps(numberParam(params, "amps", initial.amps));
    setDistanceFt(numberParam(params, "dist", initial.distanceFt));
    setMaxDropPct(numberParam(params, "drop", initial.maxDropPct));
    setConduit(choiceParam(params, "conduit", initial.conduit, ["EMT", "PVC", "RMC", "LFMC"] as const));
    setContinuous(flagParam(params, "cont", initial.continuous));
  });
  usePublishSearchParams(
    {
      amps,
      dist: distanceFt,
      drop: maxDropPct,
      mat: material,
      sys: system,
      conduit,
      cont: continuous ? 1 : 0,
    },
    queryReady,
  );

  const inputs = useMemo<WireInputs>(
    () => ({ system, material, amps, distanceFt, maxDropPct, conduit, continuous, loadLabel }),
    [amps, conduit, continuous, distanceFt, loadLabel, material, maxDropPct, system],
  );
  const result = useMemo(() => recommendWire(inputs), [inputs]);
  const profile = systemProfile(system);
  const activeWirePrice = result.wire && !priceTouched ? defaultWirePrice(result.wire, material) : wireUsd;
  const activeConduitPrice = conduitTouched ? conduitUsd : CONDUIT_USD_PER_FT[conduit];
  const cost = result.wire
    ? estimateCircuitCost({
        wire: result.wire,
        material,
        sets: Math.max(result.sets, 1),
        distanceFt,
        currentCarrying: profile.currentCarrying,
        wireUsdPerFt: activeWirePrice,
        conduit,
        conduitUsdPerFt: activeConduitPrice,
      })
    : { wireUsd: 0, conduitUsd: 0, totalUsd: 0, conductorCount: 0 };
  const weight = result.wire
    ? conductorWeightLb(result.wire, material, distanceFt, cost.conductorCount)
    : 0;

  const distances = comparison.kind === "distance" ? comparison.feet : [distanceFt];
  const otherMaterial: ConductorMaterial = material === "copper" ? "aluminum" : "copper";
  const other = recommendWire({ ...inputs, material: otherMaterial });

  const diameter = result.wire ? Math.sqrt(result.wire.cm) / 1000 : 0.1;
  const circle = Math.max(18, diameter * 220);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">K method · SSC-2026.1</p>
        <QuoteShareActions
          summary={`${formatQty(amps, 0)} A ${material} run, ${formatQty(distanceFt, 0)} ft. ${describe(result)}. Voltage drop ${formatQty(result.dropPct, 2)}%.`}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form className="no-print space-y-4 rounded-xl border border-slate-700 bg-[#111c31] p-4">
          <Field label="Load name">
            <input
              value={loadLabel}
              onChange={(event) => setLoadLabel(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-600 bg-[#0b1220] px-3 py-2 text-base text-slate-50"
            />
          </Field>
          <Field label="System">
            <SelectControl value={system} onChange={(value) => setSystem(value as WireSystem)} options={SYSTEMS} />
          </Field>
          <Field label="Conductor">
            <SelectControl
              value={material}
              onChange={(value) => {
                setPriceTouched(false);
                setMaterial(value as ConductorMaterial);
              }}
              options={[
                { value: "copper", label: "Copper" },
                { value: "aluminum", label: "Aluminum" },
              ]}
            />
          </Field>
          <Field label="Load current">
            <NumberControl value={amps} min={15} max={400} step={1} suffix="A" onChange={setAmps} />
          </Field>
          <Field label="One-way distance">
            <NumberControl
              value={units.feetToDisplay(distanceFt)}
              min={metric ? 1 : 5}
              max={metric ? 150 : 500}
              step={metric ? 0.5 : 1}
              suffix={metric ? "m" : "ft"}
              onChange={(value) => setDistanceFt(units.displayToFeet(value))}
            />
          </Field>
          <Field label="Max voltage drop" hint="3% is the usual branch-circuit note. 5% is the usual total feeder note.">
            <SelectControl
              value={String(maxDropPct)}
              onChange={(value) => setMaxDropPct(Number(value))}
              options={[
                { value: "3", label: "3% branch circuit" },
                { value: "5", label: "5% feeder" },
              ]}
            />
          </Field>
          <Field label="Conduit">
            <SelectControl
              value={conduit}
              onChange={(value) => {
                setConduitTouched(false);
                setConduit(value as ConduitType);
              }}
              options={[
                { value: "EMT", label: "EMT" },
                { value: "PVC", label: "PVC Schedule 40" },
                { value: "RMC", label: "Rigid metal conduit" },
                { value: "LFMC", label: "Liquidtight flexible metal" },
              ]}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={continuous} onChange={(event) => setContinuous(event.target.checked)} className="accent-amber-400" />
            Continuous load (125% ampacity)
          </label>
        </form>
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Minimum size" value={describe(result)} detail={result.note} />
            <Stat
              label="Voltage drop"
              value={`${formatQty(result.dropV, 2)} V`}
              detail={`${formatQty(result.dropPct, 2)}% · end ${formatQty(result.endV, 1)} V`}
              tone={TONE[result.tone]}
            />
            <Stat label="Power loss" value={`${formatQty(result.lossW, 0)} W`} detail="I²R at the operating current" />
            <Stat label="Required ampacity" value={`${formatQty(result.requiredAmp, 1)} A`} detail={`Each conductor ${formatQty(result.ampacityEach, 0)} A`} />
            <Stat label="Material estimate" value={units.formatMoney(cost.totalUsd)} detail={`${cost.conductorCount} conductors + ${conduit}`} />
            <Stat label="Conductor weight" value={units.formatWeight(weight, 1)} detail={`${units.formatWeightOther(weight, 1)} · approximate insulated weight`} />
          </div>
          <DiagramFrame title="Single-line and conductor gauge" note="Circle diameters track circular mils. The drawing is a schematic, not a conduit-fill layout.">
            <svg viewBox="0 0 720 300" className="h-auto w-full" role="img" aria-label="Electrical single line from panel to load">
              <rect x="24" y="36" width="120" height="90" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" />
              <text x="84" y="74" textAnchor="middle" fill="currentColor" fontSize="12">MAIN PANEL</text>
              <text x="84" y="94" textAnchor="middle" fill="currentColor" fontSize="11">{profile.label}</text>
              <line x1="144" y1="80" x2="470" y2="80" stroke="#F59E0B" strokeWidth="3" />
              <text x="300" y="68" textAnchor="middle" fill="currentColor" fontSize="12">
                {conduit} · {metric ? `${formatQty(distanceFt * 0.3048, 1)} m` : `${formatQty(distanceFt, 0)} ft`} · {describe(result)}
              </text>
              <rect x="470" y="36" width="210" height="90" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" />
              <text x="575" y="74" textAnchor="middle" fill="currentColor" fontSize="12">{loadLabel || "LOAD"}</text>
              <text x="575" y="94" textAnchor="middle" fill="currentColor" fontSize="11">{formatQty(amps, 0)} A</text>
              <text x="120" y="190" textAnchor="middle" fill="currentColor" fontSize="12">Selected gauge</text>
              <circle id={clipId} cx="120" cy="240" r={circle / 2} fill="none" stroke="#F59E0B" strokeWidth="8" />
              <text x="120" y="244" textAnchor="middle" fill="currentColor" fontSize="11">{result.wire ? wireName(result.wire) : "—"}</text>
              <text x="280" y="190" textAnchor="middle" fill="currentColor" fontSize="12">{otherMaterial}</text>
              <circle cx="280" cy="240" r={other.wire ? Math.max(12, Math.sqrt(other.wire.cm) / 1000 * 110) : 12} fill="none" stroke="currentColor" strokeWidth="4" />
              <text x="280" y="244" textAnchor="middle" fill="currentColor" fontSize="11">{other.wire ? wireName(other.wire) : "—"}</text>
              <text x="520" y="210" fill="currentColor" fontSize="13">Drop {formatQty(result.dropPct, 2)}%</text>
              <text x="520" y="232" fill="currentColor" fontSize="13">End {formatQty(result.endV, 1)} V</text>
              <text x="520" y="254" fill="currentColor" fontSize="13">Loss {formatQty(result.lossW, 0)} W</text>
            </svg>
          </DiagramFrame>
        </div>
      </div>
      <InContentMidCalculatorAd />
      <BomTable
        calculator="wire-size"
        lines={[
          {
            item: result.wire ? `${material} ${describe(result)}` : "Conductor",
            net: `${formatQty(distanceFt, 0)} ft one way`,
            waste: "cuts excluded",
            order: `${cost.conductorCount} conductors`,
            price: (
              <MoneyField
                label="Wire price per foot"
                usd={activeWirePrice}
                onChange={(value) => {
                  setPriceTouched(true);
                  setWireUsd(value);
                }}
              />
            ),
            total: units.formatMoney(cost.wireUsd),
            search: `${result.wire ? wireName(result.wire) : "THHN"} THHN ${material === "copper" ? "Copper" : "Aluminum"} Wire`,
          },
          {
            item: `${conduit} conduit`,
            net: metric ? `${formatQty(distanceFt * 0.3048, 1)} m` : `${formatQty(distanceFt, 0)} ft`,
            waste: "—",
            order: metric ? `${formatQty(distanceFt * 0.3048, 1)} m` : `${formatQty(distanceFt, 0)} ft`,
            price: (
              <MoneyField
                label="Conduit price per foot"
                usd={activeConduitPrice}
                onChange={(value) => {
                  setConduitTouched(true);
                  setConduitUsd(value);
                }}
              />
            ),
            total: units.formatMoney(cost.conduitUsd),
            search: `${conduit} conduit`,
          },
          {
            item: `${Math.ceil(amps)} A breaker`,
            net: system.startsWith("3ph") ? "3-pole" : "2-pole",
            waste: "—",
            order: "1",
            price: <span className="text-xs text-slate-400">Match the calculated load</span>,
            total: "—",
            search: `${Math.ceil(amps)} Amp ${system.startsWith("3ph") ? "3-Pole" : "2-Pole"} Breaker`,
          },
        ]}
      />
      <div className="mt-6 space-y-6">
        <DataTable
          caption="Copper versus aluminum at this run"
          columns={["Material", "Minimum size", "mm²", "Drop", "End voltage", "Loss"]}
          rows={[
            {
              key: material,
              highlight: true,
              cells: [material, describe(result), result.wire ? formatQty(result.wire.mm2, 1) : "—", `${formatQty(result.dropPct, 2)}%`, `${formatQty(result.endV, 1)} V`, `${formatQty(result.lossW, 0)} W`],
            },
            {
              key: otherMaterial,
              cells: [otherMaterial, describe(other), other.wire ? formatQty(other.wire.mm2, 1) : "—", `${formatQty(other.dropPct, 2)}%`, `${formatQty(other.endV, 1)} V`, `${formatQty(other.lossW, 0)} W`],
            },
          ]}
        />
        <DataTable
          caption="Same load at other one-way distances"
          columns={["Distance", "Minimum size", "Drop", "Percent", "End voltage"]}
          rows={distances.map((feet) => {
            const row = recommendWire({ ...inputs, distanceFt: feet });
            return {
              key: String(feet),
              highlight: Math.abs(feet - distanceFt) < 0.1,
              cells: [
                metric ? `${formatQty(feet * 0.3048, 1)} m` : `${formatQty(feet, 0)} ft`,
                describe(row),
                `${formatQty(row.dropV, 2)} V`,
                `${formatQty(row.dropPct, 2)}%`,
                `${formatQty(row.endV, 1)} V`,
              ],
            };
          })}
        />
      </div>
      <FormulaPanel>
        <p>Single phase: Vdrop = 2 × K × I × D / cmil. Three phase: Vdrop = 1.732 × K × I × D / cmil. K is {K_COPPER} for copper and {K_ALUMINUM} for aluminum. D is one-way feet.</p>
        <p>Percent drop = Vdrop ÷ source voltage × 100. Green is 3% or less, amber is 3 to 5%, and red is over 5%. Power loss is I²R on the current-carrying conductors.</p>
        <p>The smallest conductor that meets both the ampacity (125% when continuous) and the drop limit is selected. Ampacity does not include bundling or temperature correction.</p>
      </FormulaPanel>
      <PrintSignoff project={project} />
    </div>
  );
}
