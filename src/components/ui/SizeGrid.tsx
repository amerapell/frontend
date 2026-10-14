"use client";

export type SizeCell = { label: string; available: number };

/** 5 equal cells, 48px (44 mobile). Selected = ink fill; sold out = faint + disabled; low stock = red dot. */
export function SizeGrid({
  sizes,
  value,
  onChange,
  lowAt = 2,
  height,
  cols = 5,
}: {
  sizes: SizeCell[];
  value: string | null;
  onChange: (s: string) => void;
  lowAt?: number;
  height?: number;
  cols?: number;
}) {
  return (
    <div className="size-grid" role="radiogroup" aria-label="Size" style={{ gridTemplateColumns: `repeat(${Math.max(cols, 1)}, minmax(0, 1fr))` }}>
      {sizes.map((s) => {
        const out = s.available <= 0;
        const on = value === s.label;
        const low = !out && s.available <= lowAt;
        return (
          <button
            key={s.label}
            type="button"
            role="radio"
            aria-checked={on}
            aria-disabled={out}
            aria-label={out ? `${s.label}, sold out` : low ? `${s.label}, only ${s.available} left` : s.label}
            className={`size-cell${on ? " is-on" : ""}${out ? " is-out" : ""}`}
            style={height ? { height } : undefined}
            onClick={() => !out && onChange(s.label)}
          >
            {s.label}
            {low && <span className="size-cell__low" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
