import { AdirePattern } from "@/components/patterns/Patterns";
import { naira } from "@/lib/format";

/** Exchange-credit card: 1.586 aspect, Adire at 55% motifs, serif balance. */
export function CreditCard({ balanceKobo, state = "AVAILABLE", reference }: { balanceKobo: number; state?: string; reference?: string | null }) {
  return (
    <div className="credit-card on-dark" role="img" aria-label={`Exchange credit ${naira(balanceKobo)}, ${state.toLowerCase()}`}>
      <AdirePattern muted className="credit-card__bg" />
      <div className="credit-card__top">
        <span className="serif credit-card__mark">Amerapelle</span>
        <span className="credit-card__label">EXCHANGE CREDIT</span>
      </div>
      <div className="credit-card__bottom">
        <div className="serif tnum credit-card__amount">{naira(balanceKobo)}</div>
        <div className="credit-card__meta">
          <span>{state}</span>
          {reference && <span>{reference.replace("-", " — ")}</span>}
        </div>
      </div>
    </div>
  );
}
