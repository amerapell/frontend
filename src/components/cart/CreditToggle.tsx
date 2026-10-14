"use client";
import { useEffect, useState } from "react";
import { exchangesApi } from "@/lib/api";
import { naira } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

/** Latest exchange that produced credit, e.g. "Exchange EX-2031" — for the mono sub-label. */
export function useCreditSource() {
  const { status } = useAuth();
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => {
    if (status !== "authed") return;
    // credit entry reasons are codes (EXCHANGE_CREDIT …); the exchange number comes from /me/exchanges
    exchangesApi
      .mine()
      .then((list) => {
        const e = list.find((x) => x.status === "CREDIT_ISSUED" || x.status === "COMPLETED");
        setSource(e ? `Exchange ${e.number}` : null);
      })
      .catch(() => {});
  }, [status]);
  return source;
}

/** Bordered toggle: "Use ₦62,500 exchange credit / FROM EXCHANGE EX-2031". */
export function CreditToggle({ amountKobo, on, onChange, source }: { amountKobo: number; on: boolean; onChange: (v: boolean) => void; source?: string | null }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`credit-toggle${on ? " is-on" : ""}`} onClick={() => onChange(!on)}>
      <span className={`check-box${on ? " is-on" : ""}`} aria-hidden>{on ? "✓" : ""}</span>
      <span className="stack">
        <span className="credit-toggle__title">Use {naira(amountKobo)} exchange credit</span>
        {source && <span className="mono-xs">FROM {source.toUpperCase()}</span>}
      </span>
    </button>
  );
}
