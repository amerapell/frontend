"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "./AccountShell";
import { canExchange } from "./AccountPages";
import { ExchangeHistory, ExchangeRequestForm } from "./ExchangeRequest";
import { useSettings } from "@/context/SettingsContext";
import { creditReasonLabel, longDate, naira, upper } from "@/lib/format";

export function ExchangesPage() {
  const { orders, exchanges, credit, reload, setPendingCredit } = useAccount();
  const { settings } = useSettings();
  const params = useSearchParams();
  const router = useRouter();
  if (!orders) return <p className="mono-label">LOADING…</p>;
  const eligible = orders.filter(canExchange);
  const wanted = params.get("order");
  const order = eligible.find((o) => o.number === wanted) ?? orders.find((o) => o.number === wanted) ?? eligible[0];

  return (
    <div className="stack gap-40">
      {order ? (
        <ExchangeRequestForm
          order={order}
          orders={eligible.length > 1 ? eligible : undefined}
          onPickOrder={(n) => router.replace(`/account/exchanges?order=${n}`, { scroll: false })}
          onCreated={(ex) => {
            setPendingCredit({ amountKobo: ex.creditKobo, ref: ex.number });
            void reload();
          }}
        />
      ) : (
        <div className="exchange__head">
          <div className="mono-label">EXCHANGES · {settings.exchangeWindowDays}-DAY WINDOW</div>
          <h1 className="serif exchange__title">
            Request an <em>exchange</em>
          </h1>
          <p className="body-copy exchange__lede">
            None of your orders are within the {settings.exchangeWindowDays}-day exchange window right now. Exchanges open when an order is delivered. We don&apos;t offer refunds — exchanged pieces become credit to spend on anything in the store.
          </p>
          <Link href="/account/orders" className="ap-link">View your orders →</Link>
        </div>
      )}
      <ExchangeHistory exchanges={exchanges ?? []} />
      {credit && credit.entries.length > 0 && (
        <div className="exchange__block">
          <div className="section-head section-head--ink">
            <h2 className="serif section-head__title account__h2">Credit <em>history</em></h2>
            <span className="serif tnum">{naira(credit.balanceKobo)}</span>
          </div>
          <ul className="credit-history">
            {[...credit.entries].reverse().map((e) => (
              <li key={e.id}>
                <span>{creditReasonLabel(e.reason)}</span>
                <span className="mono-xs">
                  {upper(longDate(e.createdAt))}
                  {e.expiresAt && e.amountKobo > 0 ? ` · EXPIRES ${upper(longDate(e.expiresAt))}` : ""}
                </span>
                <span className={`tnum${e.amountKobo < 0 ? " muted" : " navy-em"}`}>{e.amountKobo < 0 ? "−" : "+"}{naira(Math.abs(e.amountKobo))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
