import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">That sheet is not on the drawing set.</h1>
      <p className="mt-3 text-sm text-slate-400">The calculator or preset URL does not exist. Start from the cluster hubs.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">
        Back to SiteSpecCalc
      </Link>
    </div>
  );
}
