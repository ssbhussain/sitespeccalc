"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { formatQty } from "@/lib/engineering/format";
import { publishSearchParams } from "@/hooks/useUrlSyncedState";

export type UnitSystem = "imperial" | "metric";
export type WeightUnit = "lb" | "kg";

/** Exact international avoirdupois pound. Display conversion only. */
export const LB_TO_KG = 0.45359237;

/**
 * Units of local currency for 1 US dollar. Snapshot from the public
 * exchange-rate feed on 24 October 2026, plus the official USD pegs for
 * AED, SAR, QAR, and BHD. Planning display only. Quantities stay in USD.
 */
export const FX_AS_OF = "2026-10-24";

export const CURRENCIES = [
  { code: "USD", rate: 1, name: "US dollar ($)", region: "Americas" },
  { code: "CAD", rate: 1.400438, name: "Canadian dollar (CA$)", region: "Americas" },
  { code: "MXN", rate: 18.69233, name: "Mexican peso", region: "Americas" },
  { code: "BRL", rate: 5.04284, name: "Brazilian real", region: "Americas" },
  { code: "ARS", rate: 1528.263, name: "Argentine peso", region: "Americas" },
  { code: "CLP", rate: 984.682493, name: "Chilean peso", region: "Americas" },
  { code: "COP", rate: 3179.863094, name: "Colombian peso", region: "Americas" },
  { code: "PEN", rate: 3.444776, name: "Peruvian sol", region: "Americas" },
  { code: "EUR", rate: 0.892784, name: "Euro (€)", region: "Europe" },
  { code: "GBP", rate: 0.747655, name: "British pound (£)", region: "Europe" },
  { code: "CHF", rate: 0.824739, name: "Swiss franc", region: "Europe" },
  { code: "SEK", rate: 9.933568, name: "Swedish krona", region: "Europe" },
  { code: "NOK", rate: 9.332701, name: "Norwegian krone", region: "Europe" },
  { code: "DKK", rate: 6.675921, name: "Danish krone", region: "Europe" },
  { code: "PLN", rate: 3.926013, name: "Polish zloty", region: "Europe" },
  { code: "CZK", rate: 21.695014, name: "Czech koruna", region: "Europe" },
  { code: "HUF", rate: 326.937579, name: "Hungarian forint", region: "Europe" },
  { code: "RON", rate: 4.775277, name: "Romanian leu", region: "Europe" },
  { code: "TRY", rate: 49.733342, name: "Turkish lira", region: "Europe" },
  { code: "AED", rate: 3.6725, name: "UAE dirham", region: "Middle East" },
  { code: "SAR", rate: 3.75, name: "Saudi riyal", region: "Middle East" },
  { code: "QAR", rate: 3.64, name: "Qatari riyal", region: "Middle East" },
  { code: "KWD", rate: 0.310314, name: "Kuwaiti dinar", region: "Middle East" },
  { code: "BHD", rate: 0.376, name: "Bahraini dinar", region: "Middle East" },
  { code: "OMR", rate: 0.384497, name: "Omani rial", region: "Middle East" },
  { code: "ILS", rate: 3.109125, name: "Israeli shekel", region: "Middle East" },
  { code: "EGP", rate: 55.288734, name: "Egyptian pound", region: "Middle East" },
  { code: "ZAR", rate: 16.578102, name: "South African rand", region: "Africa" },
  { code: "NGN", rate: 1329.799836, name: "Nigerian naira", region: "Africa" },
  { code: "KES", rate: 129.84786, name: "Kenyan shilling", region: "Africa" },
  { code: "GHS", rate: 11.671489, name: "Ghanaian cedi", region: "Africa" },
  { code: "MAD", rate: 9.814731, name: "Moroccan dirham", region: "Africa" },
  { code: "INR", rate: 95.036492, name: "Indian rupee (₹)", region: "Asia-Pacific" },
  { code: "PKR", rate: 276.726135, name: "Pakistani rupee", region: "Asia-Pacific" },
  { code: "BDT", rate: 123.714253, name: "Bangladeshi taka", region: "Asia-Pacific" },
  { code: "LKR", rate: 332.010293, name: "Sri Lankan rupee", region: "Asia-Pacific" },
  { code: "NPR", rate: 152.057506, name: "Nepalese rupee", region: "Asia-Pacific" },
  { code: "CNY", rate: 6.684864, name: "Chinese yuan", region: "Asia-Pacific" },
  { code: "JPY", rate: 156.839696, name: "Japanese yen", region: "Asia-Pacific" },
  { code: "KRW", rate: 1324.702169, name: "South Korean won", region: "Asia-Pacific" },
  { code: "HKD", rate: 7.842579, name: "Hong Kong dollar", region: "Asia-Pacific" },
  { code: "TWD", rate: 32.587187, name: "New Taiwan dollar", region: "Asia-Pacific" },
  { code: "SGD", rate: 1.278163, name: "Singapore dollar", region: "Asia-Pacific" },
  { code: "MYR", rate: 4.084687, name: "Malaysian ringgit", region: "Asia-Pacific" },
  { code: "THB", rate: 33.758724, name: "Thai baht", region: "Asia-Pacific" },
  { code: "IDR", rate: 18089.973852, name: "Indonesian rupiah", region: "Asia-Pacific" },
  { code: "PHP", rate: 63.647803, name: "Philippine peso", region: "Asia-Pacific" },
  { code: "VND", rate: 25822.177479, name: "Vietnamese dong", region: "Asia-Pacific" },
  { code: "AUD", rate: 1.422888, name: "Australian dollar (A$)", region: "Asia-Pacific" },
  { code: "NZD", rate: 1.755137, name: "New Zealand dollar", region: "Asia-Pacific" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["code"];
export type CurrencyRegion = (typeof CURRENCIES)[number]["region"];

const STORAGE_KEY = "sitespeccalc-units";
const CURRENCY_KEY = "sitespeccalc-currency";
const WEIGHT_KEY = "sitespeccalc-weight";
const WEIGHT_EXPLICIT_KEY = "sitespeccalc-weight-explicit";
const LOCALE_APPLIED_KEY = "sitespeccalc-locale-applied";

const EURO_LANGUAGES = new Set(["de", "fr", "es", "nl", "it", "pt", "pl", "sv", "da", "fi", "el", "cs", "sk", "hu", "ro", "bg", "hr", "sl", "et", "lv", "lt", "ga", "mt"]);

export interface LocaleDefaults {
  system: UnitSystem;
  weight: WeightUnit;
  currency: Currency;
}

export function detectVisitorLocale(language: string, timeZone: string): LocaleDefaults {
  const lang = language.toLowerCase();
  const zone = timeZone;
  if (lang.startsWith("en-in") || lang.startsWith("hi") || zone === "Asia/Kolkata" || zone === "Asia/Calcutta") {
    return { system: "metric", weight: "kg", currency: "INR" };
  }
  if (lang.startsWith("en-gb") || zone === "Europe/London") {
    return { system: "imperial", weight: "kg", currency: "GBP" };
  }
  if (
    lang.startsWith("en-ca") ||
    lang.startsWith("fr-ca") ||
    zone.startsWith("America/Toronto") ||
    zone.startsWith("America/Vancouver") ||
    zone.startsWith("America/Edmonton") ||
    zone.startsWith("America/Winnipeg") ||
    zone.startsWith("America/Halifax") ||
    zone.startsWith("America/St_Johns") ||
    zone === "America/Regina" ||
    zone === "America/Moncton"
  ) {
    return { system: "imperial", weight: "lb", currency: "CAD" };
  }
  if (lang.startsWith("en-au") || zone.startsWith("Australia/")) {
    return { system: "metric", weight: "kg", currency: "AUD" };
  }
  if (
    lang.startsWith("en-us") ||
    zone.startsWith("America/New_York") ||
    zone.startsWith("America/Chicago") ||
    zone.startsWith("America/Denver") ||
    zone.startsWith("America/Los_Angeles") ||
    zone.startsWith("America/Phoenix") ||
    zone.startsWith("Pacific/Honolulu") ||
    zone.startsWith("America/Anchorage")
  ) {
    return { system: "imperial", weight: "lb", currency: "USD" };
  }
  const primary = lang.split("-")[0] ?? "";
  if (EURO_LANGUAGES.has(primary) || zone.startsWith("Europe/")) {
    return { system: "metric", weight: "kg", currency: "EUR" };
  }
  return { system: "imperial", weight: "lb", currency: "USD" };
}

function markLocaleApplied() {
  window.localStorage.setItem(LOCALE_APPLIED_KEY, "1");
}

const CURRENCY_BY_CODE = new Map<string, (typeof CURRENCIES)[number]>(CURRENCIES.map((entry) => [entry.code, entry]));
const CURRENCY_REGIONS: CurrencyRegion[] = ["Americas", "Europe", "Middle East", "Africa", "Asia-Pacific"];

export function currenciesInRegion(region: CurrencyRegion) {
  return CURRENCIES.filter((entry) => entry.region === region);
}

export { CURRENCY_REGIONS };

interface UnitContextValue {
  system: UnitSystem;
  setSystem: (system: UnitSystem) => void;
  weight: WeightUnit;
  setWeight: (weight: WeightUnit) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  activeCurrency: Currency;
  fractionDigits: number;
  feetToDisplay: (feet: number) => number;
  displayToFeet: (value: number) => number;
  inchesToDisplay: (inches: number) => number;
  displayToInches: (value: number) => number;
  formatWeight: (pounds: number, digits?: number) => string;
  formatWeightOther: (pounds: number, digits?: number) => string;
  formatMoney: (usd: number) => string;
  moneyToDisplay: (usd: number) => number;
  displayToMoney: (value: number) => number;
}

const UnitContext = createContext<UnitContextValue | null>(null);

function isSystem(value: string | null): value is UnitSystem {
  return value === "imperial" || value === "metric";
}

function isCurrency(value: string | null): value is Currency {
  return value !== null && CURRENCY_BY_CODE.has(value);
}

function isWeight(value: string | null): value is WeightUnit {
  return value === "lb" || value === "kg";
}

function createPersistedStore<T extends string>(
  fallback: T,
  key: string,
  guard: (value: string | null) => value is T,
) {
  let current = fallback;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      const stored = window.localStorage.getItem(key);
      if (guard(stored)) current = stored;
      return current;
    },
    getServerSnapshot() {
      return fallback;
    },
    set(next: T) {
      current = next;
      window.localStorage.setItem(key, next);
      emit();
    },
  };
}

const systemStore = createPersistedStore<UnitSystem>("imperial", STORAGE_KEY, isSystem);
const currencyStore = createPersistedStore<Currency>("USD", CURRENCY_KEY, isCurrency);

const weightListeners = new Set<() => void>();
let weightCurrent: WeightUnit = "lb";

function readWeight(): WeightUnit {
  const stored = window.localStorage.getItem(WEIGHT_KEY);
  if (isWeight(stored)) return stored;
  return window.localStorage.getItem(STORAGE_KEY) === "metric" ? "kg" : "lb";
}

const weightStore = {
  subscribe(listener: () => void) {
    weightListeners.add(listener);
    return () => weightListeners.delete(listener);
  },
  getSnapshot() {
    weightCurrent = readWeight();
    return weightCurrent;
  },
  getServerSnapshot(): WeightUnit {
    return "lb";
  },
  set(next: WeightUnit) {
    weightCurrent = next;
    window.localStorage.setItem(WEIGHT_KEY, next);
    for (const listener of weightListeners) listener();
  },
};

function setSystem(next: UnitSystem) {
  markLocaleApplied();
  systemStore.set(next);
  if (window.localStorage.getItem(WEIGHT_EXPLICIT_KEY) !== "1") {
    weightStore.set(next === "metric" ? "kg" : "lb");
  }
}

function setWeight(next: WeightUnit) {
  markLocaleApplied();
  window.localStorage.setItem(WEIGHT_EXPLICIT_KEY, "1");
  weightStore.set(next);
}

function setCurrency(next: Currency) {
  markLocaleApplied();
  currencyStore.set(next);
}

function fractionDigitsFor(currency: Currency) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

function formatPounds(pounds: number, unit: WeightUnit, digits: number) {
  const shown = unit === "kg" ? pounds * LB_TO_KG : pounds;
  return `${formatQty(shown, digits)} ${unit}`;
}

export function UnitProvider({ children }: { children: ReactNode }) {
  const system = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot, systemStore.getServerSnapshot);
  const currency = useSyncExternalStore(
    currencyStore.subscribe,
    currencyStore.getSnapshot,
    currencyStore.getServerSnapshot,
  );
  const weight = useSyncExternalStore(weightStore.subscribe, weightStore.getSnapshot, weightStore.getServerSnapshot);
  const [queryReady, setQueryReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unit = params.get("unit");
    const wt = params.get("wt");
    const curr = params.get("curr");
    const hasQuery = unit === "ft" || unit === "m" || isWeight(wt) || isCurrency(curr);
    if (hasQuery) {
      if (unit === "m") systemStore.set("metric");
      if (unit === "ft") systemStore.set("imperial");
      if (isWeight(wt)) {
        window.localStorage.setItem(WEIGHT_EXPLICIT_KEY, "1");
        weightStore.set(wt);
      }
      if (isCurrency(curr)) currencyStore.set(curr);
      markLocaleApplied();
    } else if (window.localStorage.getItem(LOCALE_APPLIED_KEY) !== "1") {
      const hasManualChoice =
        window.localStorage.getItem(STORAGE_KEY) !== null ||
        window.localStorage.getItem(CURRENCY_KEY) !== null ||
        window.localStorage.getItem(WEIGHT_KEY) !== null;
      if (hasManualChoice) {
        markLocaleApplied();
      } else {
        const detected = detectVisitorLocale(
          navigator.language || "en-US",
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        );
        systemStore.set(detected.system);
        window.localStorage.setItem(WEIGHT_EXPLICIT_KEY, "1");
        weightStore.set(detected.weight);
        currencyStore.set(detected.currency);
        markLocaleApplied();
      }
    }
    setQueryReady(true);
  }, []);

  useEffect(() => {
    if (!queryReady) return;
    publishSearchParams({
      unit: system === "metric" ? "m" : "ft",
      wt: weight,
      curr: currency,
    });
  }, [currency, queryReady, system, weight]);

  const value = useMemo<UnitContextValue>(() => {
    const entry = CURRENCY_BY_CODE.get(currency) ?? CURRENCIES[0];
    const rate = entry.rate;
    const fractionDigits = fractionDigitsFor(entry.code);
    const other: WeightUnit = weight === "kg" ? "lb" : "kg";
    return {
      system,
      setSystem,
      weight,
      setWeight,
      currency: entry.code,
      setCurrency,
      activeCurrency: entry.code,
      fractionDigits,
      feetToDisplay: (feet) => (system === "imperial" ? feet : feet * 0.3048),
      displayToFeet: (display) => (system === "imperial" ? display : display / 0.3048),
      inchesToDisplay: (inches) => (system === "imperial" ? inches : inches * 25.4),
      displayToInches: (display) => (system === "imperial" ? display : display / 25.4),
      formatWeight: (pounds, digits = 0) => formatPounds(pounds, weight, digits),
      formatWeightOther: (pounds, digits = 0) => formatPounds(pounds, other, digits),
      formatMoney: (usd) =>
        new Intl.NumberFormat("en", {
          style: "currency",
          currency: entry.code,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(usd * rate),
      moneyToDisplay: (usd) => usd * rate,
      displayToMoney: (display) => display / rate,
    };
  }, [currency, system, weight]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnits() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnits must be used within UnitProvider");
  }
  return context;
}
