import type { ReactNode } from "react";

/** <details> accordion; the + rotates 45° when open. */
export function Accordion({ items, className = "" }: { items: { title: ReactNode; body: ReactNode; open?: boolean; id?: string }[]; className?: string }) {
  return (
    <div className={`accordion ${className}`}>
      {items.map((it, i) => (
        <details key={it.id ?? i} open={it.open} id={it.id}>
          <summary>
            {it.title}
            <span className="accordion__plus" aria-hidden>+</span>
          </summary>
          <div className="accordion__body">{it.body}</div>
        </details>
      ))}
    </div>
  );
}
