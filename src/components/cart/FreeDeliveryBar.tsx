import { naira } from "@/lib/format";

/** CRT-6: progress toward the free-delivery threshold (admin setting). */
export function FreeDeliveryBar({ subtotalKobo, thresholdKobo }: { subtotalKobo: number; thresholdKobo: number | null }) {
  if (!thresholdKobo) return null;
  const left = Math.max(0, thresholdKobo - subtotalKobo);
  const pct = Math.min(100, Math.round((subtotalKobo / thresholdKobo) * 100));
  return (
    <div className="free-bar">
      <div className="free-bar__text">
        {left > 0 ? (
          <>
            <span>{naira(left)} away from free delivery</span>
            <span className="mono-xs">{pct}%</span>
          </>
        ) : (
          <>
            <span>Free delivery unlocked</span>
            <span className="mono-xs">✓</span>
          </>
        )}
      </div>
      <div className="free-bar__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Free delivery progress">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}
