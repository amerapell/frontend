"use client";
import { Fragment } from "react";
import { useSettings } from "@/context/SettingsContext";

/** 34px ink bar, mono cloth text, red ✦ separators, 38s marquee — text from settings.tickerText. */
export function Ticker() {
  const { settings } = useSettings();
  const items = settings.tickerText.filter(Boolean);
  if (!items.length) return null;
  const run = (
    <span className="ticker__run">
      {items.map((t, i) => (
        <Fragment key={i}>
          {t} <span className="ticker__star">✦</span>{" "}
        </Fragment>
      ))}
    </span>
  );
  return (
    <div className="ticker" role="region" aria-label="Announcements">
      <span className="sr-only">{items.join(". ")}</span>
      <div className="ticker__track ap-marquee" aria-hidden>
        {run}
        {run}
      </div>
    </div>
  );
}
