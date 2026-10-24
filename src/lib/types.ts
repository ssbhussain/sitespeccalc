export const FORMULA_VERSION = "SSC-2026.1";

export type ClusterId =
  | "concrete-masonry"
  | "electrical-solar"
  | "framing-roofing"
  | "freight-logistics";

export type CalculatorId =
  | "concrete-slab"
  | "wire-size"
  | "stair-stringer"
  | "roof-pitch"
  | "container-pallet";

export interface Faq {
  question: string;
  answer: string;
}

export type RebarSize = "3" | "4" | "5";
export type ConcretePsi = 3000 | 3500 | 4000 | 5000;

export interface ConcreteInputs {
  lengthFt: number;
  widthFt: number;
  thicknessIn: number;
  thickenedEdge: boolean;
  footingWidthIn: number;
  footingDepthIn: number;
  rebarSize: RebarSize;
  spacingIn: number;
  psi: ConcretePsi;
  waste: number;
  readyMixPerYd3: number;
  bag80Price: number;
  bag60Price: number;
}

export type WireSystem =
  | "1ph-120"
  | "1ph-240"
  | "1ph-230"
  | "3ph-208"
  | "3ph-400"
  | "3ph-480";

export type ConductorMaterial = "copper" | "aluminum";
export type ConduitType = "EMT" | "PVC" | "RMC" | "LFMC";

export interface WireInputs {
  system: WireSystem;
  material: ConductorMaterial;
  amps: number;
  distanceFt: number;
  maxDropPct: number;
  conduit: ConduitType;
  continuous: boolean;
  loadLabel: string;
}

export type StringerMount = "standard" | "dropped";

export interface StairInputs {
  totalRiseIn: number;
  targetRiseIn: number;
  treadIn: number;
  widthIn: number;
  mount: StringerMount;
  landingThicknessIn: number;
}

export type RoofStyle = "gable" | "shed";

export type ContainerId = "20ft" | "40ft" | "40hc" | "53ft";
export type PalletStandard = "gma" | "epal" | "uk" | "custom";
export type FreightRateBasis = "cbm" | "tonne" | "lb";

export interface ContainerInputs {
  container: ContainerId;
  pallet: PalletStandard;
  customPalletLengthIn: number;
  customPalletWidthIn: number;
  boxLengthIn: number;
  boxWidthIn: number;
  boxHeightIn: number;
  boxWeightLb: number;
  stackable: boolean;
  rateBasis: FreightRateBasis;
  rateUsd: number;
}

export interface RoofInputs {
  spanFt: number;
  lengthFt: number;
  pitchRise: number;
  overhangFt: number;
  ridgeIn: number;
  style: RoofStyle;
}

export type Comparison =
  | { kind: "thickness"; inches: number[] }
  | { kind: "distance"; feet: number[] }
  | { kind: "conductor" }
  | { kind: "total-rise"; inches: number[] }
  | { kind: "target-rise"; inches: number[] }
  | { kind: "pitch"; risePer12: number[] }
  | { kind: "container"; ids: ContainerId[] };

export interface PresetBase {
  cluster: ClusterId;
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  engineeringNotesHtml: string;
  codeReference: string;
  faqs: Faq[];
  formulaVersion: string;
  calculatorSlug: string;
}

export type Preset =
  | (PresetBase & {
      calculator: "concrete-slab";
      defaultInputs: ConcreteInputs;
      comparison: Comparison;
    })
  | (PresetBase & {
      calculator: "wire-size";
      defaultInputs: WireInputs;
      comparison: Comparison;
    })
  | (PresetBase & {
      calculator: "stair-stringer";
      defaultInputs: StairInputs;
      comparison: Comparison;
    })
  | (PresetBase & {
      calculator: "roof-pitch";
      defaultInputs: RoofInputs;
      comparison: Comparison;
    })
  | (PresetBase & {
      calculator: "container-pallet";
      defaultInputs: ContainerInputs;
      comparison: Comparison;
    });
