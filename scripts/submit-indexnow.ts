import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import generatedJson from "../src/data/generated-presets.json";
import { MASTERS } from "../src/data/catalog";
import { PRESETS } from "../src/data/presets";
import { INDEXNOW_KEY } from "../src/lib/indexnow";
import { CLUSTER_META, SITE_URL } from "../src/lib/site";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const CALCULATOR_CLUSTER = {
  "concrete-slab-rebar-calculator": "concrete-masonry",
  "wire-size-voltage-drop-calculator": "electrical-solar",
  "stair-stringer-layout-calculator": "framing-roofing",
  "roof-pitch-rafter-calculator": "framing-roofing",
  "container-pallet-weight-calculator": "freight-logistics",
} as const;

const origin = SITE_URL.replace(/\/$/, "");
const host = new URL(origin).host;

function calculatorUrl(cluster: string, slug: string) {
  return `${origin}/calculators/${cluster}/${slug}`;
}

async function remotePresetUrls(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("programmatic_presets")
      .select("calculator_slug,preset_slug")
      .eq("is_published", true);
    if (error || !data) return [];
    return data.flatMap((row) => {
      const calculator = row.calculator_slug;
      const slug = row.preset_slug;
      if (typeof calculator !== "string" || typeof slug !== "string") return [];
      if (!(calculator in CALCULATOR_CLUSTER)) return [];
      const cluster = CALCULATOR_CLUSTER[calculator as keyof typeof CALCULATOR_CLUSTER];
      return [calculatorUrl(cluster, slug)];
    });
  } catch {
    return [];
  }
}

async function collectUrls() {
  const urls = new Set<string>();
  urls.add(origin);
  urls.add(`${origin}/directory`);
  for (const cluster of Object.keys(CLUSTER_META)) {
    urls.add(`${origin}/calculators/${cluster}`);
  }
  for (const master of MASTERS) {
    urls.add(calculatorUrl(master.cluster, master.slug));
    urls.add(`${origin}/embed/${master.calculatorSlug}`);
  }
  for (const preset of PRESETS) {
    urls.add(calculatorUrl(preset.cluster, preset.slug));
  }
  const generatedRows = generatedJson as unknown[];
  if (Array.isArray(generatedRows)) {
    for (const row of generatedRows) {
      if (!row || typeof row !== "object") continue;
      const slug = "slug" in row && typeof row.slug === "string" ? row.slug : "";
      const cluster = "cluster" in row && typeof row.cluster === "string" ? row.cluster : "";
      if (slug && cluster) urls.add(calculatorUrl(cluster, slug));
    }
  }
  for (const remote of await remotePresetUrls()) urls.add(remote);
  return [...urls];
}

async function main() {
  const urlList = await collectUrls();
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${origin}/${INDEXNOW_KEY}.txt`,
    urlList,
  };
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  console.log(`IndexNow ${response.status} for ${urlList.length} URLs on ${host}`);
  if (text) console.log(text);
  if (response.status !== 200 && response.status !== 202) process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
