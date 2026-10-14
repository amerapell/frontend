import { ProductImage } from "@/components/product/ProductImage";
import { ORDER_STATUS_LABEL, longDate, naira, upper } from "@/lib/format";
import { iconKind } from "@/lib/product";
import type { Order } from "@/lib/types";

export function OrderItems({ order }: { order: Order }) {
  return (
    <div className="order-items">
      <div className="mono-label summary__head">{order.items.reduce((s, i) => s + i.quantity, 0)} PIECES</div>
      {order.items.map((i) => (
        <div key={i.id} className="order-item">
          <span className="order-item__img">
            <ProductImage src={i.imageUrl} alt="" kind={iconKind({ material: null, name: i.name })} iconSize={24} sizes="72px" />
          </span>
          <span className="stack gap-8">
            <span className="serif order-item__name">{i.name}</span>
            <span className="meta">{[i.number, i.colour, i.size, i.quantity > 1 ? `× ${i.quantity}` : null].filter(Boolean).map((x) => upper(String(x))).join(" · ")}</span>
            {!i.exchangeable && <span className="mono-xs red">FINAL SALE</span>}
          </span>
          <span className="tnum">{naira(i.unitKobo * i.quantity)}</span>
        </div>
      ))}
    </div>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <div className="summary">
      <div className="mono-label summary__head">SUMMARY</div>
      <div className="summary__rows">
        <div className="summary__row"><span>Subtotal</span><span className="tnum">{naira(order.subtotalKobo)}</span></div>
        {order.discountKobo > 0 && <div className="summary__row"><span>Promo</span><span className="tnum">−{naira(order.discountKobo)}</span></div>}
        <div className="summary__row"><span>Delivery · {order.delivery.name}</span><span className="tnum">{order.deliveryKobo ? naira(order.deliveryKobo) : "Free"}</span></div>
        {order.creditAppliedKobo > 0 && <div className="summary__row navy-em"><span>Exchange credit</span><span className="tnum">−{naira(order.creditAppliedKobo)}</span></div>}
      </div>
      <div className="summary__total">
        <span>Paid</span>
        <span className="serif tnum summary__amount">{naira(order.amountDueKobo)}</span>
      </div>
      <dl className="order-meta">
        <div><dt className="mono-xs">STATUS</dt><dd>{ORDER_STATUS_LABEL[order.status]}</dd></div>
        <div><dt className="mono-xs">PLACED</dt><dd>{longDate(order.createdAt)}</dd></div>
        {order.payment?.provider && <div><dt className="mono-xs">PAYMENT</dt><dd>{order.payment.provider === "CREDIT" ? "Exchange credit" : order.payment.provider === "BACHS" ? "Bachs" : "Paystack"}{order.payment.reference ? ` · ${order.payment.reference}` : ""}</dd></div>}
        {order.delivery.address && (
          <div>
            <dt className="mono-xs">DELIVER TO</dt>
            <dd>
              {order.delivery.address.fullName}
              <br />
              {order.delivery.address.street}, {order.delivery.address.area}
              <br />
              {order.delivery.address.lga}, {order.delivery.address.state}
              <br />
              <span className="muted">Near {order.delivery.address.landmark}</span>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
