import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Disclaimer",
  description: "SiteSpecCalc results are estimates and must be verified by a licensed engineer, electrician, or inspector.",
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Engineering disclaimer</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
        <p>
          SiteSpecCalc calculations are for estimation and planning. They are not a substitute for construction documents prepared or reviewed by a licensed professional engineer, a licensed electrician, or the local building official. Verify every quantity before you order, cut, or energize anything.
        </p>
        <p>
          Concrete volume ignores waste you create in the field beyond the factor you select, and it ignores soil, frost, vapor, joints, and structural capacity. Rebar counts are an on-center takeoff, not an ACI development-length design. Bag yields are the common 0.60 and 0.45 cubic foot figures. Read the bag.
        </p>
        <p>
          Voltage drop uses the approximate K method, not a project-specific impedance study. Ampacity is the 75°C column with the small-conductor limits and an optional 125 percent continuous factor. It does not apply correction factors, adjustment factors, or the utility&apos;s service rules. A dwelling service may be allowed a smaller conductor under NEC 310.12 where that section is adopted. The inspector decides.
        </p>
        <p>
          Stair math divides the rise you type into equal risers and checks them against 7.75 inches and 4 inches, and treads against 10 inches. It does not check headroom, guards, handrails, landings, or the stair width required for the occupancy. Roof math returns geometry and a material count. It does not size a rafter for snow, wind, or span.
        </p>
        <p>
          Code sections named on a page are signposts to the published model codes. The edition adopted in your jurisdiction, including local amendments, controls. SiteSpecCalc is not affiliated with NFPA, ICC, or ACI.
        </p>
      </div>
    </article>
  );
}
