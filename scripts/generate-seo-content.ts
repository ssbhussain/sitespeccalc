import { config as loadEnv } from "dotenv";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { PRESETS } from "../src/data/presets";
import { FORMULA_VERSION } from "../src/lib/types";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const GENERATED_PATH = "src/data/generated-presets.json";
const existing = new Set(PRESETS.map((preset) => preset.slug));
const limit = readLimit();
const dryRun = process.argv.includes("--dry-run");

function readLimit() {
  const flagged = process.argv.find((item) => item.startsWith("--batch="));
  if (flagged) {
    const value = Number(flagged.slice("--batch=".length));
    if (Number.isFinite(value) && value > 0) return Math.floor(value);
  }
  const spaced = process.argv.indexOf("--batch");
  if (spaced >= 0) {
    const value = Number(process.argv[spaced + 1]);
    if (Number.isFinite(value) && value > 0) return Math.floor(value);
  }
  const fromEnv = Number(process.env.SEO_SEED_LIMIT ?? "520");
  return Number.isFinite(fromEnv) && fromEnv > 0 ? Math.floor(fromEnv) : 520;
}

function loadGeneratedSlugs() {
  try {
    const raw = JSON.parse(readFileSync(GENERATED_PATH, "utf8")) as unknown;
    if (!Array.isArray(raw)) return;
    for (const row of raw) {
      if (row && typeof row === "object" && "slug" in row && typeof row.slug === "string") existing.add(row.slug);
    }
  } catch {
    // A missing file means this is the first autopilot run.
  }
}

loadGeneratedSlugs();

const CALCULATOR_ID = {
  "concrete-slab-rebar-calculator": "concrete-slab",
  "wire-size-voltage-drop-calculator": "wire-size",
  "stair-stringer-layout-calculator": "stair-stringer",
  "roof-pitch-rafter-calculator": "roof-pitch",
  "container-pallet-weight-calculator": "container-pallet",
} as const;

interface Seed {
  calculator_slug: string;
  preset_slug: string;
  h1_title: string;
  default_inputs: Record<string, unknown>;
  prompt: string;
}

const calculators = [
  {
    slug: "concrete-slab-rebar-calculator",
    cluster: "concrete-masonry",
    title: "Concrete Slab, Rebar, and Bag Calculator",
    short_description: "Volume, rebar, bags, and ready-mix for a slab-on-ground.",
  },
  {
    slug: "wire-size-voltage-drop-calculator",
    cluster: "electrical-solar",
    title: "Wire Size and Voltage Drop Calculator",
    short_description: "AWG and mm2 conductor sizing with voltage drop.",
  },
  {
    slug: "stair-stringer-layout-calculator",
    cluster: "framing-roofing",
    title: "Stair Stringer Layout Calculator",
    short_description: "Equal risers, run, and 2x12 stringer length.",
  },
  {
    slug: "roof-pitch-rafter-calculator",
    cluster: "framing-roofing",
    title: "Roof Pitch and Common Rafter Calculator",
    short_description: "Pitch, rafter length, squares, and sheathing.",
  },
  {
    slug: "container-pallet-weight-calculator",
    cluster: "freight-logistics",
    title: "Pallet, Container CBM, and Dimensional Weight Calculator",
    short_description: "Pallet slots, CBM, payload, and billable weight.",
  },
];

function buildSeeds(): Seed[] {
  const seeds: Seed[] = [];
  for (const lengthFt of [8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 36, 40, 48]) {
    for (const widthFt of [8, 10, 12, 14, 16, 18, 20, 24, 30]) {
      for (const thicknessIn of [4, 5, 6, 8]) {
        const preset_slug = `generated-${lengthFt}x${widthFt}-slab-${thicknessIn}-inch`;
        if (existing.has(preset_slug)) continue;
        seeds.push({
          calculator_slug: "concrete-slab-rebar-calculator",
          preset_slug,
          h1_title: `${lengthFt} by ${widthFt} ft slab at ${thicknessIn} inches`,
          default_inputs: {
            lengthFt,
            widthFt,
            thicknessIn,
            thickenedEdge: thicknessIn >= 6,
            footingWidthIn: 12,
            footingDepthIn: 12,
            rebarSize: "4",
            spacingIn: 18,
            psi: 4000,
            waste: 0.1,
            readyMixPerYd3: 165,
            bag80Price: 6.75,
            bag60Price: 5.4,
            comparison: { kind: "thickness", inches: [4, 5, 6] },
          },
          prompt: `Residential slab ${lengthFt} ft by ${widthFt} ft at ${thicknessIn} in with #4 bars at 18 in. Mention IRC R506 and that soil design is excluded.`,
        });
      }
    }
  }
  for (const amps of [20, 30, 40, 50, 60, 100]) {
    for (const distanceFt of [40, 60, 80, 100, 150]) {
      const preset_slug = `generated-${amps}a-${distanceFt}ft-copper-voltage-drop`;
      seeds.push({
        calculator_slug: "wire-size-voltage-drop-calculator",
        preset_slug,
        h1_title: `${amps} amp copper run at ${distanceFt} feet`,
        default_inputs: {
          system: "1ph-240",
          material: "copper",
          amps,
          distanceFt,
          maxDropPct: 3,
          conduit: "EMT",
          continuous: amps >= 50,
          loadLabel: "Branch circuit",
          comparison: { kind: "distance", feet: [distanceFt, distanceFt + 25] },
        },
        prompt: `240 V copper branch or feeder at ${amps} A and ${distanceFt} ft one way. Explain the 3 percent NEC informational note and that derating is excluded.`,
      });
    }
  }
  for (const totalRiseIn of [42, 54, 66, 80, 96, 120]) {
    const preset_slug = `generated-stair-${totalRiseIn}-inch-rise`;
    seeds.push({
      calculator_slug: "stair-stringer-layout-calculator",
      preset_slug,
      h1_title: `Stair layout for a ${totalRiseIn} inch rise`,
      default_inputs: {
        totalRiseIn,
        targetRiseIn: 7.5,
        treadIn: 10.5,
        widthIn: 36,
        mount: "standard",
        landingThicknessIn: 1,
        comparison: { kind: "target-rise", inches: [7, 7.5, 7.75] },
      },
      prompt: `Stair with a ${totalRiseIn} inch total rise. Cite IRC 7.75 inch riser and 10 inch tread limits. Mention headroom is not calculated.`,
    });
  }
  for (const spanFt of [16, 20, 24, 28, 32, 36]) {
    for (const pitchRise of [3, 4, 5, 6, 7, 8, 10]) {
      const preset_slug = `generated-${pitchRise}-12-gable-${spanFt}ft-span`;
      seeds.push({
        calculator_slug: "roof-pitch-rafter-calculator",
        preset_slug,
        h1_title: `${pitchRise}/12 gable rafter on a ${spanFt} ft span`,
        default_inputs: {
          spanFt,
          lengthFt: Math.max(spanFt, 24),
          pitchRise,
          overhangFt: 1,
          ridgeIn: 1.5,
          style: "gable",
          comparison: { kind: "pitch", risePer12: [pitchRise, pitchRise + 2] },
        },
        prompt: `Gable roof ${pitchRise}/12 on a ${spanFt} ft span. Explain multiplier, plumb cut, and that snow load is not sized.`,
      });
    }
  }
  for (const amps of [15, 25, 32, 48, 70, 80, 125, 150, 175, 200]) {
    for (const distanceFt of [30, 45, 90, 120, 180]) {
      const preset_slug = `generated-${amps}a-${distanceFt}ft-feeder-voltage-drop`;
      seeds.push({
        calculator_slug: "wire-size-voltage-drop-calculator",
        preset_slug,
        h1_title: `${amps} amp feeder at ${distanceFt} feet`,
        default_inputs: {
          system: amps >= 150 ? "1ph-240" : "1ph-240",
          material: amps >= 100 ? "aluminum" : "copper",
          amps,
          distanceFt,
          maxDropPct: amps >= 100 ? 5 : 3,
          conduit: "PVC",
          continuous: amps === 48 || amps === 32,
          loadLabel: "Feeder",
          comparison: { kind: "distance", feet: [distanceFt, distanceFt + 30] },
        },
        prompt: `${amps} A run at ${distanceFt} ft. Mention the 3 and 5 percent informational notes and that temperature derating is excluded.`,
      });
    }
  }
  for (const totalRiseIn of [36, 48, 60, 72, 84, 90, 102, 108, 114, 126, 132, 144]) {
    const preset_slug = `generated-stair-rise-${totalRiseIn}-inch-layout`;
    seeds.push({
      calculator_slug: "stair-stringer-layout-calculator",
      preset_slug,
      h1_title: `Stringer layout for a ${totalRiseIn} inch rise`,
      default_inputs: {
        totalRiseIn,
        targetRiseIn: 7.5,
        treadIn: 10.5,
        widthIn: 36,
        mount: "standard",
        landingThicknessIn: 1.5,
        comparison: { kind: "total-rise", inches: [totalRiseIn, totalRiseIn + 6] },
      },
      prompt: `Stair total rise ${totalRiseIn} inches. Cite the 7.75 inch IRC riser limit and say headroom is not calculated.`,
    });
  }
  for (const container of ["20ft", "40ft", "40hc", "53ft"]) {
    for (const pallet of ["gma", "epal", "uk"]) {
      for (const stackable of [false, true]) {
        const preset_slug = `generated-${container}-${pallet}-${stackable ? "stacked" : "single"}-load`;
        seeds.push({
          calculator_slug: "container-pallet-weight-calculator",
          preset_slug,
          h1_title: `${container} ${pallet} pallet load${stackable ? ", stacked" : ""}`,
          default_inputs: {
            container,
            pallet,
            customPalletLengthIn: 48,
            customPalletWidthIn: 40,
            boxLengthIn: 16,
            boxWidthIn: 12,
            boxHeightIn: 12,
            boxWeightLb: 30,
            stackable,
            rateBasis: "cbm",
            rateUsd: 85,
            comparison: { kind: "container", ids: ["20ft", "40ft", "40hc", "53ft"] },
          },
          prompt: `Container ${container} with ${pallet} pallets, stackable ${stackable}. Explain floor slots, 167 kg per cubic meter dimensional weight, and that the payload limit is a planning figure.`,
        });
      }
    }
  }
  return takeAcrossCalculators(
    seeds.filter((seed) => !existing.has(seed.preset_slug)),
    limit,
  );
}

function takeAcrossCalculators(seeds: Seed[], count: number) {
  const groups = new Map<string, Seed[]>();
  for (const seed of seeds) {
    const list = groups.get(seed.calculator_slug) ?? [];
    list.push(seed);
    groups.set(seed.calculator_slug, list);
  }
  const picked: Seed[] = [];
  let round = 0;
  while (picked.length < count) {
    let added = false;
    for (const list of groups.values()) {
      if (round < list.length) {
        picked.push(list[round]);
        added = true;
        if (picked.length >= count) break;
      }
    }
    if (!added) break;
    round += 1;
  }
  return picked;
}

interface GeneratedCopy {
  meta_title: string;
  meta_description: string;
  engineering_notes_html: string;
  code_compliance_reference: string;
  faqs: { question: string; answer: string }[];
}

function fallbackCopy(seed: Seed): GeneratedCopy {
  return {
    meta_title: seed.h1_title,
    meta_description: seed.prompt.slice(0, 155),
    engineering_notes_html: `<p>${seed.prompt} Confirm the result with the adopted local code and a licensed designer.</p>`,
    code_compliance_reference: "See the master calculator page for the NEC, IRC, or ACI section this preset inherits.",
    faqs: [
      {
        question: `What does the ${seed.h1_title} page calculate?`,
        answer: "It prefills the SiteSpecCalc engine. The numeric result is the same function as the master calculator, not a separate estimate.",
      },
    ],
  };
}

async function writeCopy(client: OpenAI, seed: Seed): Promise<GeneratedCopy> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write original construction-calculator SEO copy. Return JSON with meta_title, meta_description, engineering_notes_html (one or two <p> tags), code_compliance_reference, and faqs (array of {question, answer}). Do not claim a stamped engineering design. Do not invent code section numbers you are unsure about.",
      },
      { role: "user", content: seed.prompt },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<GeneratedCopy>;
  const fallback = fallbackCopy(seed);
  return {
    meta_title: parsed.meta_title || fallback.meta_title,
    meta_description: parsed.meta_description || fallback.meta_description,
    engineering_notes_html: parsed.engineering_notes_html || fallback.engineering_notes_html,
    code_compliance_reference: parsed.code_compliance_reference || fallback.code_compliance_reference,
    faqs: Array.isArray(parsed.faqs) && parsed.faqs.length ? parsed.faqs : fallback.faqs,
  };
}

async function rememberRemoteSlugs() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) return;
  const supabase = createClient(supabaseUrl, serviceKey);
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from("programmatic_presets").select("preset_slug").range(from, from + 999);
    if (error || !data?.length) break;
    for (const row of data) {
      if (typeof row.preset_slug === "string") existing.add(row.preset_slug);
    }
    if (data.length < 1000) break;
    from += 1000;
  }
}

function toPreset(seed: Seed, copy: GeneratedCopy) {
  const meta = calculators.find((row) => row.slug === seed.calculator_slug);
  const inputs = { ...seed.default_inputs };
  const comparison = inputs.comparison;
  delete inputs.comparison;
  return {
    calculator: CALCULATOR_ID[seed.calculator_slug as keyof typeof CALCULATOR_ID],
    calculatorSlug: seed.calculator_slug,
    cluster: meta?.cluster,
    slug: seed.preset_slug,
    h1: seed.h1_title,
    metaTitle: copy.meta_title,
    metaDescription: copy.meta_description,
    summary: copy.meta_description,
    engineeringNotesHtml: copy.engineering_notes_html,
    codeReference: copy.code_compliance_reference,
    faqs: copy.faqs,
    formulaVersion: FORMULA_VERSION,
    defaultInputs: inputs,
    comparison,
  };
}

function appendGenerated(presets: ReturnType<typeof toPreset>[]) {
  let current: unknown[] = [];
  try {
    const raw = JSON.parse(readFileSync(GENERATED_PATH, "utf8")) as unknown;
    if (Array.isArray(raw)) current = raw;
  } catch {
    current = [];
  }
  const map = new Map<string, unknown>();
  for (const row of current) {
    if (row && typeof row === "object" && "slug" in row && typeof row.slug === "string") map.set(row.slug, row);
  }
  for (const preset of presets) {
    map.set(preset.slug, preset);
    existing.add(preset.slug);
  }
  writeFileSync(GENERATED_PATH, `${JSON.stringify([...map.values()], null, 2)}\n`);
}

async function main() {
  await rememberRemoteSlugs();
  const seeds = buildSeeds();
  if (dryRun) {
    mkdirSync("scripts/output", { recursive: true });
    writeFileSync("scripts/output/seo-preview.json", JSON.stringify(seeds, null, 2));
    console.log(`Dry run wrote ${seeds.length} seed prompts to scripts/output/seo-preview.json`);
    return;
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!supabaseUrl || !serviceKey || !openaiKey) {
    console.error("Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY before seeding.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const openai = new OpenAI({ apiKey: openaiKey });
  const { error: calculatorError } = await supabase.from("calculators").upsert(
    calculators.map((row) => ({ ...row, formula_version: "SSC-2026.1" })),
    { onConflict: "slug" },
  );
  if (calculatorError) throw calculatorError;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  async function withRetry<T>(work: () => Promise<T>): Promise<T> {
    let wait = 1500;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await work();
      } catch (error) {
        const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
        const message = error instanceof Error ? error.message : String(error);
        const limited = status === 429 || message.toLowerCase().includes("rate");
        if (!limited || attempt === 4) throw error;
        await sleep(wait);
        wait *= 2;
      }
    }
    throw new Error("Seed retry failed.");
  }

  let written = 0;
  for (let index = 0; index < seeds.length; index += 3) {
    const batch = seeds.slice(index, index + 3);
    const rows = await withRetry(() =>
      Promise.all(
        batch.map(async (seed) => {
          const copy = await writeCopy(openai, seed);
          return {
            calculator_slug: seed.calculator_slug,
            preset_slug: seed.preset_slug,
            h1_title: seed.h1_title,
            meta_title: copy.meta_title,
            meta_description: copy.meta_description,
            default_inputs: seed.default_inputs,
            engineering_notes_html: copy.engineering_notes_html,
            code_compliance_reference: copy.code_compliance_reference,
            faqs: copy.faqs,
            is_published: true,
            updated_at: new Date().toISOString(),
          };
        }),
      ),
    );
    const { error } = await supabase.from("programmatic_presets").upsert(rows, { onConflict: "preset_slug" });
    if (error) throw error;
    appendGenerated(batch.map((seed, index) => toPreset(seed, {
      meta_title: rows[index].meta_title,
      meta_description: rows[index].meta_description,
      engineering_notes_html: rows[index].engineering_notes_html,
      code_compliance_reference: rows[index].code_compliance_reference,
      faqs: rows[index].faqs,
    })));
    written += rows.length;
    console.log(`Upserted ${written} / ${seeds.length}`);
    await sleep(1500);
  }
  console.log(`Finished ${written} programmatic presets.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
