"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type UnitSystem = "imperial" | "metric";
export type Currency = "USD" | "EUR" | "GBP" | "INR";

const STORAGE_KEY = "sitespeccalc-units";
const CURRENCY_KEY = "sitespeccalc-currency";

export const FX_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84,
};

interface UnitContextValue {
  system: UnitSystem;
  setSystem: (system: UnitSystem) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  activeCurrency: Currency;
  feetToDisplay: (feet: number) => number;
  displayToFeet: (value: number) => number;
  inchesToDisplay: (inches: number) => number;
  displayToInches: (value: number) => number;
  formatMoney: (usd: number) => string;
  moneyToDisplay: (usd: number) => number;
  displayToMoney: (value: number) => number;
}

const UnitContext = createContext<UnitContextValue | null>(null);

function isSystem(value: string | null): value is UnitSystem {
  return value === "imperial" || value === "metric";
}

function isCurrency(value: string | null): value is Currency {
  return value === "USD" || value === "EUR" || value === "GBP" || value === "INR";
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

export function UnitProvider({ children }: { children: ReactNode }) {
  const system = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot, systemStore.getServerSnapshot);
  const currency = useSyncExternalStore(
    currencyStore.subscribe,
    currencyStore.getSnapshot,
    currencyStore.getServerSnapshot,
  );
  const setSystem = systemStore.set;
  const setCurrency = currencyStore.set;

  const value = useMemo<UnitContextValue>(() => {
    const activeCurrency: Currency = system === "metric" ? currency : "USD";
    const rate = FX_RATES[activeCurrency];
    return {
      system,
      setSystem,
      currency,
      setCurrency,
      activeCurrency,
      feetToDisplay: (feet) => (system === "imperial" ? feet : feet * 0.3048),
      displayToFeet: (display) => (system === "imperial" ? display : display / 0.3048),
      inchesToDisplay: (inches) => (system === "imperial" ? inches : inches * 25.4),
      displayToInches: (display) => (system === "imperial" ? display : display / 25.4),
      formatMoney: (usd) =>
        new Intl.NumberFormat(
          activeCurrency === "INR"
            ? "en-IN"
            : activeCurrency === "EUR"
              ? "de-DE"
              : activeCurrency === "GBP"
                ? "en-GB"
                : "en-US",
          { style: "currency", currency: activeCurrency, maximumFractionDigits: 2 },
        ).format(usd * rate),
      moneyToDisplay: (usd) => usd * rate,
      displayToMoney: (display) => display / rate,
    };
  }, [currency, setCurrency, setSystem, system]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnits() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnits must be used within UnitProvider");
  }
  return context;
}
