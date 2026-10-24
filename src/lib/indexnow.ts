/** Public IndexNow key. The matching file is public/{key}.txt. */
export const INDEXNOW_KEY = "c046087266320d136fbdc8d58da6a056";

export const EMBED_CALCULATOR_SLUGS = [
  "concrete-slab-rebar-calculator",
  "wire-size-voltage-drop-calculator",
  "stair-stringer-layout-calculator",
  "roof-pitch-rafter-calculator",
  "container-pallet-weight-calculator",
] as const;

export type EmbedCalculatorSlug = (typeof EMBED_CALCULATOR_SLUGS)[number];

export function isEmbedCalculatorSlug(value: string): value is EmbedCalculatorSlug {
  return (EMBED_CALCULATOR_SLUGS as readonly string[]).includes(value);
}
