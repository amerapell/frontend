import type { CSSProperties } from "react";

/** White pill with a coloured dot: New=navy, Sale/Drop/Only N left=red, Sold out=faint. */
export function Tag({ label, dot, className = "", style }: { label: string; dot: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`tag ${className}`} style={style}>
      <span className="tag__dot" style={{ background: dot }} aria-hidden />
      {label}
    </span>
  );
}
