import type { DropSettings } from "./types";

/** First run closes this long after go-live (no end time in the contract — see README). */
export const FIRST_RUN_HOURS = 48;

export type DropPhase = "none" | "upcoming" | "live" | "ended";

export function dropPhase(drop: DropSettings | null, now = Date.now()): { phase: DropPhase; target: number | null } {
  if (!drop?.goLiveAt) return { phase: "none", target: null };
  const live = new Date(drop.goLiveAt).getTime();
  if (live > now) return { phase: "upcoming", target: live };
  const close = live + FIRST_RUN_HOURS * 3600_000;
  if (close > now) return { phase: "live", target: close };
  return { phase: "ended", target: null };
}
