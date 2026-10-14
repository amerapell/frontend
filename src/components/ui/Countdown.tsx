"use client";
import { useEffect, useState } from "react";
import { pad2 } from "@/lib/format";

/** Seconds remaining until `target`; ticks every second; null target → null. */
export function useCountdown(target: string | number | null | undefined) {
  const t = target == null ? null : typeof target === "number" ? target : new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (t == null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [t]);
  if (t == null) return null;
  if (now == null) return null; // SSR / first paint: unknown yet
  return Math.max(0, Math.floor((t - now) / 1000));
}

export function splitClock(secs: number) {
  return { h: Math.floor(secs / 3600), m: Math.floor((secs % 3600) / 60), s: secs % 60 };
}

export function clockText(secs: number | null) {
  if (secs == null) return "--:--:--";
  const { h, m, s } = splitClock(secs);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/** Inline serif HH:MM:SS clock with tabular numerals. */
export function Countdown({ target, className = "", onDone }: { target: string | number | null; className?: string; onDone?: () => void }) {
  const secs = useCountdown(target);
  useEffect(() => {
    if (secs === 0) onDone?.();
  }, [secs, onDone]);
  return (
    <span className={`tnum ${className}`} role="timer" aria-live="off" suppressHydrationWarning>
      {clockText(secs)}
    </span>
  );
}
