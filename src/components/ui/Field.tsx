"use client";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type Common = { label: string; error?: string | null; full?: boolean; hint?: ReactNode; className?: string };

/** 58px box, mono label inside top-left, border turns ink on focus. */
export const FieldBox = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(function FieldBox(
  { label, error, full, hint, className = "", id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={`field-wrap ${full ? "field-wrap--full" : ""} ${className}`}>
      <label className={`field${error ? " field--error" : ""}`} htmlFor={fid}>
        <span className="field__label">{label}</span>
        <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined} {...rest} />
      </label>
      {error && <span id={`${fid}-err`} className="field__error" role="alert">{error}</span>}
      {!error && hint && <span className="field__hint">{hint}</span>}
    </div>
  );
});

export function SelectBox({ label, error, full, className = "", id, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={`field-wrap ${full ? "field-wrap--full" : ""} ${className}`}>
      <label className={`field field--select${error ? " field--error" : ""}`} htmlFor={fid}>
        <span className="field__label">{label}</span>
        <select id={fid} aria-invalid={!!error} {...rest}>
          {children}
        </select>
      </label>
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  );
}

export function TextAreaBox({ label, error, full, className = "", id, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={`field-wrap ${full ? "field-wrap--full" : ""} ${className}`}>
      <label className={`field field--area${error ? " field--error" : ""}`} htmlFor={fid}>
        <span className="field__label">{label}</span>
        <textarea id={fid} aria-invalid={!!error} {...rest} />
      </label>
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  );
}

/** Square ink checkbox row (marketing consent, save address, credit). */
export function CheckRow({ checked, onChange, children, sub, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; sub?: ReactNode; id?: string }) {
  return (
    <label className="check-row" htmlFor={id}>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`check-box${checked ? " is-on" : ""}`} aria-hidden>{checked ? "✓" : ""}</span>
      <span className="stack">
        <span>{children}</span>
        {sub && <span className="mono-xs">{sub}</span>}
      </span>
    </label>
  );
}
