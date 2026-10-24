import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { UnitProvider } from "@/context/UnitContext";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SiteSpecCalc | Jobsite Engineering Calculators",
    template: "%s | SiteSpecCalc",
  },
  description:
    "Deterministic visual calculators for concrete slabs, wire size, stair stringers, and roof rafters. Imperial and metric, with printable material lists.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "SiteSpecCalc",
    description: "Jobsite calculators with live blueprint diagrams and bill-of-materials lists.",
  },
  robots: { index: true, follow: true },
};

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "ca-pub-3430684260439635";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${display.variable} ${mono.variable} h-full antialiased`}>
      <head>
        {adsenseClient ? (
          <>
            <meta name="google-adsense-account" content={adsenseClient} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
              crossOrigin="anonymous"
            />
          </>
        ) : null}
        <script
          data-grow-initializer=""
          dangerouslySetInnerHTML={{
            __html: `!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo1YWJhNTIwMS00YWQwLTRlMTgtOWIzYi0yZTM5NGI2NjQzOTY=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-ink text-foam">
        <UnitProvider>{children}</UnitProvider>
      </body>
    </html>
  );
}
