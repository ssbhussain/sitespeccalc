"use client";

import { ConcreteSlabRebarCalculator } from "@/components/calculators/ConcreteSlabRebarCalculator";
import { ContainerPalletWeightCalculator } from "@/components/calculators/ContainerPalletWeightCalculator";
import { RoofPitchRafterCalculator } from "@/components/calculators/RoofPitchRafterCalculator";
import { StairStringerLayoutCalculator } from "@/components/calculators/StairStringerLayoutCalculator";
import { WireSizeVoltageDropCalculator } from "@/components/calculators/WireSizeVoltageDropCalculator";
import { EmbedCalculatorModal } from "@/components/EmbedCalculatorModal";
import type { Preset } from "@/lib/types";

export function CalculatorEngine({ page, embed = false }: { page: Preset; embed?: boolean }) {
  const calculator = (() => {
    if (page.calculator === "concrete-slab") {
      return (
        <ConcreteSlabRebarCalculator
          initial={page.defaultInputs}
          comparison={page.comparison}
          project={page.h1}
        />
      );
    }
    if (page.calculator === "wire-size") {
      return (
        <WireSizeVoltageDropCalculator
          initial={page.defaultInputs}
          comparison={page.comparison}
          project={page.h1}
        />
      );
    }
    if (page.calculator === "stair-stringer") {
      return (
        <StairStringerLayoutCalculator
          initial={page.defaultInputs}
          comparison={page.comparison}
          project={page.h1}
        />
      );
    }
    if (page.calculator === "container-pallet") {
      return (
        <ContainerPalletWeightCalculator
          initial={page.defaultInputs}
          comparison={page.comparison}
          project={page.h1}
        />
      );
    }
    return (
      <RoofPitchRafterCalculator
        initial={page.defaultInputs}
        comparison={page.comparison}
        project={page.h1}
      />
    );
  })();

  return (
    <div>
      {calculator}
      {embed ? null : <EmbedCalculatorModal calculatorSlug={page.calculatorSlug} />}
    </div>
  );
}
