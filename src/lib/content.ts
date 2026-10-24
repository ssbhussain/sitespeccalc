import { cacheLife } from "next/cache";
import type { Preset } from "@/lib/types";
import { PRESETS } from "@/data/presets";
import { MASTERS } from "@/data/catalog";

const CALCULATOR_CLUSTER = {
  "concrete-slab-rebar-calculator": "concrete-masonry",
  "wire-size-voltage-drop-calculator": "electrical-solar",
  "stair-stringer-layout-calculator": "framing-roofing",
  "roof-pitch-rafter-calculator": "framing-roofing",
} as const;

type CalculatorSlug = keyof typeof CALCULATOR_CLUSTER;

const CALCULATOR_ID = {
  "concrete-slab-rebar-calculator": "concrete-slab",
  "wire-size-voltage-drop-calculator": "wire-size",
  "stair-stringer-layout-calculator": "stair-stringer",
  "roof-pitch-rafter-calculator": "roof-pitch",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapRemote(row: Record<string, unknown>): Preset | null {
  const calculatorSlug = row.calculator_slug;
  const presetSlug = row.preset_slug;
  if (typeof calculatorSlug !== "string" || typeof presetSlug !== "string") return null;
  if (!(calculatorSlug in CALCULATOR_ID)) return null;
  const slug = calculatorSlug as CalculatorSlug;
  const faqsRaw = Array.isArray(row.faqs) ? row.faqs : [];
  const faqs = faqsRaw
    .map((item) => {
      if (!isRecord(item)) return null;
      if (typeof item.question !== "string" || typeof item.answer !== "string") return null;
      return { question: item.question, answer: item.answer };
    })
    .filter((item): item is { question: string; answer: string } => item !== null);
  const inputs = isRecord(row.default_inputs) ? row.default_inputs : null;
  if (!inputs) return null;
  const comparison = isRecord(inputs.comparison) ? inputs.comparison : { kind: "conductor" };
  const { comparison: _ignored, ...defaultInputs } = inputs;
  void _ignored;

  const base = {
    cluster: CALCULATOR_CLUSTER[slug],
    slug: presetSlug,
    h1: String(row.h1_title ?? presetSlug),
    metaTitle: String(row.meta_title ?? row.h1_title ?? presetSlug),
    metaDescription: String(row.meta_description ?? ""),
    summary: String(row.meta_description ?? ""),
    engineeringNotesHtml: String(row.engineering_notes_html ?? ""),
    codeReference: String(row.code_compliance_reference ?? ""),
    faqs,
    formulaVersion: "SSC-2026.1",
    calculatorSlug,
    comparison: comparison as Preset["comparison"],
    defaultInputs: defaultInputs as never,
  };

  const calculator = CALCULATOR_ID[slug];
  return { ...base, calculator } as Preset;
}

async function loadRemotePresets(): Promise<Preset[]> {
  "use cache";
  cacheLife("hours");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return [];
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("programmatic_presets")
      .select(
        "calculator_slug,preset_slug,h1_title,meta_title,meta_description,default_inputs,engineering_notes_html,code_compliance_reference,faqs,is_published",
      )
      .eq("is_published", true);
    if (error || !data) return [];
    return data
      .map((row) => mapRemote(row as Record<string, unknown>))
      .filter((row): row is Preset => row !== null);
  } catch {
    return [];
  }
}

export async function getPresetCatalog(): Promise<Preset[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return PRESETS;
  try {
    const remote = await loadRemotePresets();
    if (!remote.length) return PRESETS;
    const merged = new Map<string, Preset>();
    for (const preset of remote) merged.set(preset.slug, preset);
    for (const preset of PRESETS) merged.set(preset.slug, preset);
    return [...merged.values()];
  } catch {
    return PRESETS;
  }
}

export function findCalculatorPage(cluster: string, slug: string, presets: Preset[]) {
  return (
    MASTERS.find((item) => item.cluster === cluster && item.slug === slug) ??
    presets.find((item) => item.cluster === cluster && item.slug === slug)
  );
}

const ALLOWED_TAGS = new Set(["p", "ul", "ol", "li", "strong", "em", "b", "i", "br", "h2", "h3", "a"]);

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag: string, attrs: string) => {
      const name = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (match.startsWith("</")) return `</${name}>`;
      if (name === "br") return "<br />";
      if (name === "a") {
        const href = /href\s*=\s*"(https?:\/\/[^"]+)"/i.exec(attrs);
        return href ? `<a href="${href[1]}" rel="nofollow noopener noreferrer">` : "<a>";
      }
      return `<${name}>`;
    });
}
