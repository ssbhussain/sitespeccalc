import type { MetadataRoute } from "next";
import { MASTERS } from "@/data/catalog";
import { getPresetCatalog } from "@/lib/content";
import { CLUSTER_META, SITE_URL } from "@/lib/site";

const LAUNCH = new Date("2026-10-24T00:00:00.000Z");
const ORIGIN = SITE_URL.replace(/\/$/, "");

function canonical(path: string) {
  if (!path || path === "/") return ORIGIN;
  return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/+$/, "");
}

function lastmod(value?: string) {
  if (!value) return LAUNCH;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? LAUNCH : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const presets = await getPresetCatalog();
  const rows: MetadataRoute.Sitemap = [
    { url: canonical("/"), lastModified: LAUNCH, changeFrequency: "weekly", priority: 1 },
    { url: canonical("/calculators"), lastModified: LAUNCH, changeFrequency: "weekly", priority: 0.6 },
    { url: canonical("/directory"), lastModified: LAUNCH, changeFrequency: "weekly", priority: 0.6 },
    { url: canonical("/about"), lastModified: LAUNCH, changeFrequency: "monthly", priority: 0.5 },
    { url: canonical("/privacy-policy"), lastModified: LAUNCH, changeFrequency: "monthly", priority: 0.4 },
    { url: canonical("/terms-of-service"), lastModified: LAUNCH, changeFrequency: "monthly", priority: 0.4 },
    { url: canonical("/engineering-disclaimer"), lastModified: LAUNCH, changeFrequency: "monthly", priority: 0.4 },
    { url: canonical("/contact"), lastModified: LAUNCH, changeFrequency: "monthly", priority: 0.5 },
  ];

  for (const cluster of Object.keys(CLUSTER_META)) {
    rows.push({
      url: canonical(`/calculators/${cluster}`),
      lastModified: LAUNCH,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const seen = new Set(rows.map((row) => row.url));

  for (const item of MASTERS) {
    const url = canonical(`/calculators/${item.cluster}/${item.slug}`);
    if (seen.has(url)) continue;
    seen.add(url);
    rows.push({
      url,
      lastModified: lastmod(item.updatedAt),
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  for (const item of presets) {
    const url = canonical(`/calculators/${item.cluster}/${item.slug}`);
    if (seen.has(url)) continue;
    seen.add(url);
    rows.push({
      url,
      lastModified: lastmod(item.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return rows;
}
