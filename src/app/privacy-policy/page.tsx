import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for SiteSpecCalc, including Google AdSense, cookies, CCPA, and GDPR disclosures.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Privacy policy</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">Effective 24 October 2026</p>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
        <p>
          SiteSpecCalc publishes calculators and reference pages. This policy explains what the site stores, what advertising partners may collect, and the choices available to visitors in the EEA, the UK, and California.
        </p>
        <h2 className="font-display text-2xl text-slate-50">Information the site itself handles</h2>
        <p>
          Calculator inputs stay in your browser. On a first visit the site reads the browser language and time zone only to choose a starting length system, weight unit, and currency. The imperial or metric choice, the pound or kilogram choice, and the display currency are then saved in localStorage on your device. A later manual change replaces that starting choice. The contact form does not post to a SiteSpecCalc database. It opens your email program addressed to hello@sitespeccalc.com. If you send that email, we receive whatever you chose to include and use it only to reply.
        </p>
        <p>
          Server logs kept by the host can include IP address, user agent, and the URL requested. Those logs are used to operate and secure the site.
        </p>
        <h2 className="font-display text-2xl text-slate-50">Google AdSense and the DART cookie</h2>
        <p>
          Pages may show ads from Google AdSense. Google, as a third-party vendor, uses cookies to serve ads based on a visit to this site and, where allowed, other sites. The DoubleClick DART cookie lets Google and its partners serve ads based on visits. You can opt out of the DART cookie by visiting the Google advertising opt-out at https://adssettings.google.com and the industry page at https://optout.aboutads.info. Third-party vendors and ad networks may also use cookies. SiteSpecCalc has no control over those cookies.
        </p>
        <p>
          The current publisher placeholder is ca-pub-0000000000000000 until a live AdSense client ID is configured. Reserved ad containers keep a fixed minimum height so an ad load does not shift the calculator.
        </p>
        <h2 className="font-display text-2xl text-slate-50">Journey by Mediavine and Raptive</h2>
        <p>
          If a Journey by Mediavine or Raptive site ID is added to the deployment, that network may set cookies and collect device and usage data to measure and display advertising. Their policy then applies in addition to this one. Until that ID is configured, the site does not load their script.
        </p>
        <h2 className="font-display text-2xl text-slate-50">GDPR</h2>
        <p>
          If you are in the European Economic Area or the United Kingdom, the legal bases we rely on are consent, where a cookie banner or the browser controls it, and legitimate interests in keeping the site secure and understanding aggregate traffic. You may request access, correction, deletion, restriction, or a copy of personal data we hold, and you may object to processing based on legitimate interests. You may also lodge a complaint with your supervisory authority. Contact hello@sitespeccalc.com. We do not knowingly sell personal information.
        </p>
        <h2 className="font-display text-2xl text-slate-50">CCPA and CPRA</h2>
        <p>
          California residents can ask for the categories of personal information collected, the sources, the business purpose, and the categories of third parties. SiteSpecCalc does not sell personal information for money and does not share it for cross-context behavioral advertising except as an advertising partner such as Google may do under its own tools, which you can opt out of at the links above. You may designate an authorized agent. We will not discriminate against you for exercising these rights. Send requests to hello@sitespeccalc.com.
        </p>
        <h2 className="font-display text-2xl text-slate-50">Children</h2>
        <p>
          The calculators are written for adults in construction and the trades. We do not knowingly collect personal information from children under 16.
        </p>
        <h2 className="font-display text-2xl text-slate-50">Changes</h2>
        <p>
          When this policy changes, the effective date at the top of the page changes with it.
        </p>
      </div>
    </article>
  );
}
