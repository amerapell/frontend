"use client";
import type { Colour } from "@/lib/types";

/** 30px round swatch; selected = 1px ink ring offset 3. Unavailable colours get a diagonal strike. */
export function Swatches({
  colours,
  value,
  onChange,
  size = 30,
  isAvailable,
  label = "Colour",
}: {
  colours: Colour[];
  value: string | null;
  onChange: (name: string) => void;
  size?: number;
  isAvailable?: (c: Colour) => boolean;
  label?: string;
}) {
  return (
    <div className="swatches" role="radiogroup" aria-label={label}>
      {colours.map((c) => {
        const on = value === c.name;
        const avail = isAvailable ? isAvailable(c) : true;
        return (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`${c.name}${avail ? "" : ", sold out"}`}
            className={`swatch${on ? " is-on" : ""}${avail ? "" : " is-out"}`}
            style={{ width: size, height: size, background: c.hex }}
            onClick={() => onChange(c.name)}
          />
        );
      })}
    </div>
  );
}
