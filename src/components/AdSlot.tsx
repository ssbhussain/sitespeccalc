"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "ca-pub-3430684260439635";
const PRIMARY_SLOT = "8196980028";
const SIDEBAR_SLOT = "3344112518";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function AdUnit({ slotId, className }: { slotId?: string; className?: string }) {
  useEffect(() => {
    if (!slotId || !ADSENSE_CLIENT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and a pending AdSense review both reject this call.
    }
  }, [slotId]);

  if (!slotId || !ADSENSE_CLIENT) return null;

  return (
    <div className={`ad-slot-wrapper ${className ?? ""}`} data-nosnippet="">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function TopLeaderboardAd() {
  return <AdUnit slotId={PRIMARY_SLOT} className="mb-6" />;
}

export function InContentMidCalculatorAd() {
  return <AdUnit slotId={PRIMARY_SLOT} className="my-6" />;
}

export function StickySidebarAd() {
  return (
    <div className="no-print sticky top-24 hidden w-full lg:block">
      <AdUnit slotId={SIDEBAR_SLOT} />
    </div>
  );
}
