import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-slate-800 bg-[#0b1220]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Deterministic jobsite calculators for concrete, conductors, stairs, and rafters. Quantities update in the browser. No design seal is implied.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Calculators</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-amber-300" href="/calculators/concrete-masonry/concrete-slab-rebar-calculator">Slab and rebar</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/electrical-solar/wire-size-voltage-drop-calculator">Wire and voltage drop</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/framing-roofing/stair-stringer-layout-calculator">Stair stringers</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/framing-roofing/roof-pitch-rafter-calculator">Roof pitch and rafters</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/freight-logistics/container-pallet-weight-calculator">Container and pallet load</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Clusters</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-amber-300" href="/calculators/concrete-masonry">Concrete and masonry</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/electrical-solar">Electrical, EV, and solar</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/framing-roofing">Framing and roofing</Link></li>
            <li><Link className="hover:text-amber-300" href="/calculators/freight-logistics">Freight and logistics</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Trust</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-amber-300" href="/about">About the formulas</Link></li>
            <li><Link className="hover:text-amber-300" href="/engineering-disclaimer">Engineering disclaimer</Link></li>
            <li><Link className="hover:text-amber-300" href="/privacy-policy">Privacy policy</Link></li>
            <li><Link className="hover:text-amber-300" href="/terms-of-service">Terms of service</Link></li>
            <li><Link className="hover:text-amber-300" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
        © 2026 SiteSpecCalc. Estimates only. Verify with a licensed local professional and the inspector.
      </div>
    </footer>
  );
}
