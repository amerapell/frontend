"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { checkoutApi } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiMessage, arrivalFromEta, upper } from "@/lib/format";
import type { DeliveryZone, Order } from "@/lib/types";
import { StepTracker } from "@/components/ui/StepTracker";
import { OrderItems, OrderTotals } from "@/components/account/OrderParts";

const PROVIDER_NAME: Record<string, string> = { PAYSTACK: "Paystack", BACHS: "Bachs", CREDIT: "exchange credit" };

/** Black confirmation bar from ExchangeV2: "● Order AP-10511 confirmed — paid with Paystack…" */
export function ConfirmedBar({ order, arrives }: { order: Order; arrives: string | null }) {
  return (
    <div className="confirmed-bar" role="status">
      <div className="container confirmed-bar__inner">
        <span>
          <span className="confirmed-bar__dot">●</span>&nbsp; Order {order.number} confirmed — paid with {PROVIDER_NAME[order.payment?.provider ?? ""] ?? "card"}. A receipt is on its way to {order.email}.
        </span>
        {arrives && <span className="mono-label confirmed-bar__eta">{arrives}</span>}
      </div>
    </div>
  );
}

export function CheckoutComplete({ reference, zones }: { reference: string | null; zones: DeliveryZone[] }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const { reload } = useCart();
  const { status } = useAuth();
  const reloaded = useRef(false);

  useEffect(() => {
    if (!reference) {
      setError("We couldn't find a payment reference.");
      return;
    }
    let alive = true;
    checkoutApi
      .verify(reference)
      .then(({ order: o }) => {
        if (!alive) return;
        setOrder(o);
        if (!reloaded.current) {
          reloaded.current = true;
          void reload();
        }
        // webhook is the source of truth — poll briefly while still pending
        if (o.status === "PENDING_PAYMENT" && tries < 6) window.setTimeout(() => alive && setTries((t) => t + 1), 2500);
      })
      .catch((e) => alive && setError(apiMessage(e, "We couldn't confirm this payment yet.")));
    return () => {
      alive = false;
    };
  }, [reference, tries, reload]);

  if (error) {
    return (
      <div className="container empty empty--page">
        <span className="serif empty__title">Hold <em>on.</em></span>
        <p className="body-copy">{error} If money left your account, don&apos;t pay again — we&apos;ll confirm by email as soon as the payment clears.</p>
        <div className="row gap-24 wrap">
          <Link href="/orders/lookup" className="ap-link">Look up an order</Link>
          <Link href="/contact" className="ap-link">Contact us</Link>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="container empty empty--page" aria-busy="true">
        <span className="mono-label">CONFIRMING PAYMENT…</span>
        <span className="serif empty__title">One <em>moment.</em></span>
      </div>
    );
  }

  const failed = order.payment?.status === "FAILED" || order.payment?.status === "EXPIRED";
  const pending = order.status === "PENDING_PAYMENT" && !failed;
  const zone = zones.find((z) => z.code === order.delivery.zone);
  const eta = zone && zone.code !== "PICKUP" ? arrivalFromEta(zone.etaText, new Date(order.paidAt ?? order.createdAt)) : null;
  const arrives = order.delivery.zone === "PICKUP" ? "READY FOR PICKUP SAME DAY" : eta ? `ARRIVES ${upper(eta)}` : null;

  return (
    <>
      {!pending && !failed && <ConfirmedBar order={order} arrives={arrives} />}
      <div className="container confirm">
        <div className="confirm__head">
          <div className="mono-label">ORDER {order.number}</div>
          <h1 className="serif confirm__title">
            {failed ? <>Payment <em>didn&apos;t go through</em></> : pending ? <>Waiting for <em>payment</em></> : <>Thank <em>you.</em></>}
          </h1>
          <p className="body-copy">
            {failed
              ? "Your bag is still saved. You can try again with Paystack or Bachs."
              : pending
                ? "We're waiting for your bank to confirm. This page updates automatically — no need to pay again."
                : "We've started packing. You'll get an email when it's on the way, with your rider's details."}
          </p>
        </div>
        {!failed && (
          <StepTracker
            reached={pending ? 0 : 1}
            steps={[
              { label: "Paid", desc: "Payment confirmed" },
              { label: "Packing", desc: "Wrapped in Lagos" },
              { label: order.delivery.zone === "PICKUP" ? "Ready" : "Dispatched", desc: order.delivery.zone === "PICKUP" ? "Collect from the store" : "Rider on the way" },
              { label: order.delivery.zone === "PICKUP" ? "Collected" : "Delivered", desc: arrives ? arrives.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "Enjoy it" },
            ]}
          />
        )}
        <div className="split confirm__body">
          <div className="split__main">
            <OrderItems order={order} />
          </div>
          <aside className="split__aside">
            <OrderTotals order={order} />
            <div className="stack gap-12 confirm__links">
              {failed ? (
                <Link href="/bag" className="btn btn--block"><span>Back to bag</span><span aria-hidden>→</span></Link>
              ) : status === "authed" ? (
                <Link href={`/account/orders/${order.number}`} className="btn btn--block"><span>View order</span><span aria-hidden>→</span></Link>
              ) : (
                <Link href={`/account?view=register&email=${encodeURIComponent(order.email)}`} className="btn btn--block"><span>Create an account to track it</span><span aria-hidden>→</span></Link>
              )}
              <Link href="/c/new-in" className="ap-link small-link">Continue shopping</Link>
              <p className="mono-xs">NO REFUNDS · UNWORN PIECES CAN BE EXCHANGED FOR CREDIT. <Link href="/policies/exchanges" className="ap-link">POLICY</Link></p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
