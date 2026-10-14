"use client";

export function QtyStepper({ value, min = 1, max, onChange, disabled, label = "Quantity" }: { value: number; min?: number; max: number; onChange: (n: number) => void; disabled?: boolean; label?: string }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="qty__value" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}
