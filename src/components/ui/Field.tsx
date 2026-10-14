"use client";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type Common = { label: string; error?: string | null; full?: boolean; hint?: ReactNode; className?: string };

/** 58px box, mono label inside top-left, border turns ink on focus. */
export const FieldBox = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(function FieldBox(
  { label, error, full, hint, className = "", id, type, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const input = (
    <label className={`field${error ? " field--error" : ""}${isPassword ? " field--password" : ""}`} htmlFor={fid}>
      <span className="field__label">{label}</span>
      <input ref={ref} id={fid} type={isPassword && visible ? "text" : type} aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined} {...rest} />
    </label>
  );
  return (
    <div className={`field-wrap ${full ? "field-wrap--full" : ""} ${className}`}>
      {isPassword ? (
        <div className="field-pw">
          {input}
          <button
            type="button"
            className="field-pw__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            aria-controls={fid}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      ) : (
        input
      )}
      {error && <span id={`${fid}-err`} className="field__error" role="alert">{error}</span>}
      {!error && hint && <span className="field__hint">{hint}</span>}
    </div>
  );
});

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.2 1.6M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.2-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

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
