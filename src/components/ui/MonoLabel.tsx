import type { ElementType, ReactNode } from "react";

export function MonoLabel({ children, as: As = "span", className = "" }: { children: ReactNode; as?: ElementType; className?: string }) {
  return <As className={`mono-label ${className}`}>{children}</As>;
}

/** Mono index + serif title + 1px rule. */
export function SectionHead({
  index,
  title,
  aside,
  rule = "hair",
  size = 64,
  as: As = "h2",
  id,
}: {
  index?: ReactNode;
  title: ReactNode;
  aside?: ReactNode;
  rule?: "hair" | "ink";
  size?: number;
  as?: ElementType;
  id?: string;
}) {
  return (
    <div className={`section-head section-head--${rule}`}>
      <div>
        {index && <div className="mono-label">{index}</div>}
        <As id={id} className="section-head__title serif" style={{ fontSize: `var(--sh-size, ${size}px)` }}>
          {title}
        </As>
      </div>
      {aside && <div className="section-head__aside">{aside}</div>}
    </div>
  );
}
