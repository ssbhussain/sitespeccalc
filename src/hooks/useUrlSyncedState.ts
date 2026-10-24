"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function numberParam(params: URLSearchParams, key: string, fallback: number) {
  const raw = params.get(key);
  if (raw == null || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function choiceParam<T extends string>(params: URLSearchParams, key: string, fallback: T, allowed: readonly T[]): T {
  const raw = params.get(key);
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function numberChoice<T extends number>(params: URLSearchParams, key: string, fallback: T, allowed: readonly T[]): T {
  const value = Number(params.get(key));
  return (allowed as readonly number[]).includes(value) ? (value as T) : fallback;
}

export function flagParam(params: URLSearchParams, key: string, fallback: boolean) {
  const raw = params.get(key);
  if (raw == null || raw === "") return fallback;
  return raw === "1" || raw === "true";
}

export function publishSearchParams(updates: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    url.searchParams.set(key, String(value));
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState(window.history.state, "", next);
}

export function useApplyQuery(apply: (params: URLSearchParams) => void) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const [ready, setReady] = useState(false);
  useIsoLayoutEffect(() => {
    applyRef.current(new URLSearchParams(window.location.search));
    setReady(true);
  }, []);
  return ready;
}

export function usePublishSearchParams(updates: Record<string, string | number | boolean>, enabled: boolean) {
  const json = JSON.stringify(updates);
  useEffect(() => {
    if (!enabled) return;
    publishSearchParams(JSON.parse(json) as Record<string, string | number | boolean>);
  }, [enabled, json]);
}
