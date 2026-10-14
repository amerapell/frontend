import type { Utm } from "./types";

const KEY = "ap_utm";

/** SOC-5: capture utm_* (or a known referrer) on landing; first touch wins for 30 days. */
export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    const p = new URLSearchParams(window.location.search);
    const source = p.get("utm_source");
    const existing = readUtm();
    if (source) {
      const utm: Utm = { source, medium: p.get("utm_medium") || undefined, campaign: p.get("utm_campaign") || undefined };
      window.localStorage.setItem(KEY, JSON.stringify({ ...utm, at: Date.now() }));
      document.cookie = `${KEY}=${encodeURIComponent(JSON.stringify(utm))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      return;
    }
    if (!existing && document.referrer) {
      const host = new URL(document.referrer).hostname;
      const known = /instagram/.test(host) ? "instagram" : /tiktok/.test(host) ? "tiktok" : /whatsapp|wa\.me/.test(host) ? "whatsapp" : null;
      if (known) window.localStorage.setItem(KEY, JSON.stringify({ source: known, medium: "referral", at: Date.now() }));
    }
  } catch {
    /* ignore */
  }
}

export function readUtm(): Utm | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return undefined;
    const v = JSON.parse(raw) as Utm & { at?: number };
    if (v.at && Date.now() - v.at > 30 * 24 * 3600_000) return undefined;
    return { source: v.source, medium: v.medium, campaign: v.campaign };
  } catch {
    return undefined;
  }
}
