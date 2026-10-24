import type { MetadataRoute } from "next";
import { MASTERS } from "@/data/catalog";
import { getPresetCatalog } from "@/lib/content";
import { CLUSTER_META, SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const presets = await getPresetCatalog();
  const lastModified = "2026-10-24";
  const staticRoutes = [
    "",
    "/calculators",
    "/about",
    "/privacy-policy",
    "/terms-of-service",
    "/engineering-disclaimer",
    "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path || "/"}`.replace(/\/$/, "") || SITE_URL,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const clusters = Object.keys(CLUSTER_META).map((cluster) => ({
    url: `${SITE_URL}/calculators/${cluster}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const masters = MASTERS.map((item) => ({
    url: `${SITE_URL}/calculators/${item.cluster}/${item.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const pages = presets.map((item) => ({
    url: `${SITE_URL}/calculators/${item.cluster}/${item.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...clusters, ...masters, ...pages];
}
