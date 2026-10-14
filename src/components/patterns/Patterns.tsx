/**
 * Pattern system — drawn in code, never images (Patterns.dc.html).
 * Each component owns its <pattern> defs with a unique id from useId().
 */
import { useId, type CSSProperties } from "react";

const DOT_ROWS: [number, number[]][] = [
  [16, [96, 108, 120, 132, 144]],
  [28, [102, 114, 126, 138]],
  [40, [96, 108, 120, 132, 144]],
  [52, [102, 114, 126, 138]],
  [64, [96, 108, 120, 132, 144]],
];
const SPARSE_DOTS: [number, number[]][] = [
  [16, [96, 120, 144]],
  [40, [108, 132]],
  [64, [96, 120, 144]],
];
const COMPACT_DOTS: [number, number[]][] = [
  [12, [72, 84, 96, 108]],
  [24, [78, 90, 102]],
  [36, [72, 84, 96, 108]],
];

type AdireTileProps = { id: string; tile?: 160 | 120; muted?: boolean };

/** The 160px Adire Indigo tile (or the 120px mobile/reel tile). `muted` = 55% motifs (exchange-credit card). */
export function AdireTileDef({ id, tile = 160, muted = false }: AdireTileProps) {
  if (tile === 120) {
    return (
      <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="#0b1c4f" />
        <g fill="none" stroke="#f4f1ea" strokeWidth="1.3" strokeLinecap="round">
          <circle cx="30" cy="30" r="21" />
          <circle cx="30" cy="30" r="14" />
          <circle cx="30" cy="30" r="7" />
          <path d="M9 69h42M9 111h42M14 69v42M22 69v42M30 69v42M38 69v42M46 69v42" />
          <path d="M69 90c0-11 9-20 21-20s21 9 21 20" />
        </g>
        <g fill="#f4f1ea">
          {COMPACT_DOTS.flatMap(([cy, xs]) => xs.map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" />))}
          <path d="M90 96 Q90 105 99 105 Q90 105 90 114 Q90 105 81 105 Q90 105 90 96Z" />
        </g>
      </pattern>
    );
  }
  const dots = muted ? SPARSE_DOTS : DOT_ROWS;
  return (
    <pattern id={id} width="160" height="160" patternUnits="userSpaceOnUse">
      <rect width="160" height="160" fill="#0b1c4f" />
      <g fill="none" stroke="#f4f1ea" strokeWidth="1.6" strokeLinecap="round" opacity={muted ? 0.55 : undefined}>
        <circle cx="40" cy="40" r="28" />
        <circle cx="40" cy="40" r="19" />
        <circle cx="40" cy="40" r="10" />
        <path d="M12 92h56M12 148h56M18 92v56M28 92v56M38 92v56M48 92v56M58 92v56" />
        <path d="M92 120c0-15 12-27 28-27s28 12 28 27" />
        <path d="M100 120c0-11 9-19 20-19s20 8 20 19" />
      </g>
      <g fill="#f4f1ea" opacity={muted ? 0.55 : undefined}>
        {!muted && <circle cx="40" cy="40" r="3" />}
        {dots.flatMap(([cy, xs]) => xs.map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />))}
        <path d="M120 128 Q120 140 132 140 Q120 140 120 152 Q120 140 108 140 Q120 140 120 128Z" />
      </g>
    </pattern>
  );
}

/** The sparse 480px red-star overlay tile: "one in every nine turns red". */
export function AdireRedDef({ id }: { id: string }) {
  return (
    <pattern id={id} width="480" height="480" patternUnits="userSpaceOnUse">
      <path d="M280 268 Q280 280 292 280 Q280 280 280 292 Q280 280 268 280 Q280 280 280 268Z" fill="#d3262c" />
    </pattern>
  );
}

type SvgFillProps = {
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  label?: string;
};

/** Full-bleed Adire Indigo fill. Set `redStars` for the red accent overlay; `drift` for the 40s drift. */
export function AdirePattern({
  className,
  style,
  width = "100%",
  height = "100%",
  label,
  tile = 160,
  muted = false,
  redStars = false,
  drift = false,
}: SvgFillProps & { tile?: 160 | 120; muted?: boolean; redStars?: boolean; drift?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const a = `adire-${uid}`;
  const r = `adire-red-${uid}`;
  return (
    <svg
      className={[drift ? "ap-drift" : "", className].filter(Boolean).join(" ") || undefined}
      width={width}
      height={height}
      style={{ display: "block", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <AdireTileDef id={a} tile={tile} muted={muted} />
        {redStars && <AdireRedDef id={r} />}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${a})`} />
      {redStars && <rect width="100%" height="100%" fill={`url(#${r})`} />}
    </svg>
  );
}

/** Red-star overlay only (to stack over another Adire fill). */
export function AdireRedStars({ className, style, width = "100%", height = "100%" }: SvgFillProps) {
  const uid = useId().replace(/:/g, "");
  const r = `adire-red-${uid}`;
  return (
    <svg className={className} width={width} height={height} style={{ display: "block", ...style }} aria-hidden>
      <defs>
        <AdireRedDef id={r} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${r})`} />
    </svg>
  );
}

/** Aso-oke stripe — the 40px structural repeat (navy, cloth hairlines, 1px red, tan band with ladder). */
export function AsookeStripe({ height = 40, className, style }: { height?: number; className?: string; style?: CSSProperties }) {
  const uid = useId().replace(/:/g, "");
  const id = `asooke-${uid}`;
  return (
    <svg className={className} width="100%" height={height} style={{ display: "block", ...style }} aria-hidden>
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#0b1c4f" />
          <rect y="6" width="40" height="2" fill="#f4f1ea" />
          <rect y="11" width="40" height="1" fill="#d3262c" />
          <rect y="15" width="40" height="12" fill="#b07a4a" />
          <path d="M5 15v12M15 15v12M25 15v12M35 15v12" stroke="#0a0a0f" strokeWidth="2" opacity="0.55" />
          <rect y="31" width="40" height="2" fill="#f4f1ea" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}

/** Cut-paper collage (expressive) — used on the 404 page. Ported from Patterns.dc.html. */
export function CutPaperCollage({ className, style }: { className?: string; style?: CSSProperties }) {
  const uid = useId().replace(/:/g, "");
  const p = (n: string) => `${n}-${uid}`;
  return (
    <svg className={className} style={{ display: "block", background: "#f4f1ea", ...style }} width="100%" height="100%" viewBox="0 0 560 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cut-paper collage pattern">
      <defs>
        <pattern id={p("pin")} width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#0b1c4f" /><path d="M0 0v8" stroke="#f4f1ea" strokeWidth="1" /></pattern>
        <pattern id={p("dots")} width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f4f1ea" /><circle cx="6" cy="6" r="2.4" fill="#0b1c4f" /></pattern>
        <pattern id={p("grid")} width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#b07a4a" /><path d="M0 0h14M0 0v14" stroke="#0a0a0f" strokeWidth="1.2" /></pattern>
        <pattern id={p("stitch")} width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#1e3172" /><path d="M2 6h8" stroke="#f4f1ea" strokeWidth="1.6" strokeLinecap="round" /></pattern>
        <pattern id={p("spots")} width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="#c99a6e" /><ellipse cx="10" cy="9" rx="5" ry="3.5" fill="#0a0a0f" /><ellipse cx="30" cy="24" rx="6" ry="4" fill="#0a0a0f" /><ellipse cx="32" cy="6" rx="2.5" ry="2" fill="#0a0a0f" /><ellipse cx="12" cy="27" rx="3" ry="2.2" fill="#0a0a0f" /></pattern>
        <pattern id={p("ink")} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#0a0a0f" /><path d="M0 5h10" stroke="#3a3b45" strokeWidth="2" /></pattern>
        <pattern id={p("redcheck")} width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#f4f1ea" /><rect width="8" height="8" fill="#d3262c" /><rect x="8" y="8" width="8" height="8" fill="#d3262c" /></pattern>
      </defs>
      <g stroke="#ffffff" strokeWidth="6" strokeLinejoin="round">
        <path d="M-20 40 C40 -10 110 10 130 70 C150 130 90 170 40 160 C-10 150 -40 90 -20 40Z" fill={`url(#${p("pin")})`} />
        <path d="M110 -20 C170 -10 230 30 220 90 C210 140 150 150 120 110 C95 75 70 10 110 -20Z" fill={`url(#${p("spots")})`} />
        <path d="M230 20 C290 -20 360 10 370 70 C380 120 330 160 280 150 C230 140 200 60 230 20Z" fill={`url(#${p("dots")})`} />
        <path d="M360 -10 C430 -30 500 20 490 80 C480 130 410 140 380 100 C350 60 330 0 360 -10Z" fill={`url(#${p("stitch")})`} />
        <path d="M470 40 C540 10 600 60 590 130 C580 190 510 190 490 140 C470 100 440 60 470 40Z" fill={`url(#${p("ink")})`} />
        <path d="M-30 170 C20 130 90 150 110 200 C130 250 80 310 20 310 C-30 310 -60 220 -30 170Z" fill={`url(#${p("grid")})`} />
        <path d="M100 150 C160 120 230 150 240 210 C250 270 190 320 140 300 C90 280 60 180 100 150Z" fill={`url(#${p("ink")})`} />
        <path d="M230 160 C280 120 350 140 370 200 C390 260 340 320 280 310 C220 300 200 200 230 160Z" fill={`url(#${p("pin")})`} />
        <path d="M360 150 C410 120 470 150 470 210 C470 260 420 300 380 280 C340 260 330 180 360 150Z" fill={`url(#${p("redcheck")})`} />
        <path d="M460 160 C520 130 590 170 590 230 C590 290 520 320 480 290 C440 260 420 190 460 160Z" fill={`url(#${p("spots")})`} />
      </g>
    </svg>
  );
}

/** The four-point star from the logo, used by the add-to-bag motion. */
export function FourPointStar({ size = 28, color = "#d3262c", className, style }: { size?: number; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d="M50 2 Q50 50 98 50 Q50 50 50 98 Q50 50 2 50 Q50 50 50 2Z" fill={color} />
    </svg>
  );
}
