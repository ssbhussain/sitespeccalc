import { config as loadEnv } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { PRESETS } from "../src/data/presets";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const existing = new Set(PRESETS.map((preset) => preset.slug));
const limit = Number(process.env.SEO_SEED_LIMIT ?? "200");
const dryRun = process.argv.includes("--dry-run");

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
];

function buildSeeds(): Seed[] {
  const seeds: Seed[] = [];
  for (const lengthFt of [10, 12, 14, 16, 18, 20, 24, 28, 30, 36, 40]) {
    for (const widthFt of [10, 12, 14, 16, 20, 24, 30]) {
      for (const thicknessIn of [4, 5, 6]) {
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
  return seeds.filter((seed) => !existing.has(seed.preset_slug)).slice(0, limit);
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

async function main() {
  const seeds = buildSeeds();
  if (dryRun) {
    mkdirSync("scripts/output", { recursive: true });
    writeFileSync("scripts/output/seo-preview.json", JSON.stringify(seeds, null, 2));
    console.log(`Dry run wrote ${seeds.length} seed prompts to scripts/output/seo-preview.json`);
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!supabaseUrl || !serviceKey || !openaiKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY before seeding.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const openai = new OpenAI({ apiKey: openaiKey });
  const { error: calculatorError } = await supabase.from("calculators").upsert(
    calculators.map((row) => ({ ...row, formula_version: "SSC-2026.1" })),
    { onConflict: "slug" },
  );
  if (calculatorError) throw calculatorError;

  let written = 0;
  for (let index = 0; index < seeds.length; index += 5) {
    const batch = seeds.slice(index, index + 5);
    const rows = await Promise.all(
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
    );
    const { error } = await supabase.from("programmatic_presets").upsert(rows, { onConflict: "preset_slug" });
    if (error) throw error;
    written += rows.length;
    console.log(`Upserted ${written} / ${seeds.length}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  console.log(`Finished ${written} programmatic presets.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
