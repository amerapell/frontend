"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StepIndicator } from "@/components/chrome/CheckoutHeader";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { ProductImage } from "@/components/product/ProductImage";
import { loadProduct } from "@/components/product/quickAddCache";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { naira, upper } from "@/lib/format";
import { iconKind } from "@/lib/product";
import type { CartLine, Product } from "@/lib/types";
import { CreditToggle, useCreditSource } from "./CreditToggle";
import { FreeDeliveryBar } from "./FreeDeliveryBar";
import { PromoForm } from "./PromoForm";

function VariantEditor({ line, onDone }: { line: CartLine; onDone: () => void }) {
  const { update, busy } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [colour, setColour] = useState(line.colour);
  const [size, setSize] = useState(line.size);
  useEffect(() => {
    loadProduct(line.productSlug).then(setP).catch(() => onDone());
  }, [line.productSlug, onDone]);
  if (!p) return <span className="mono-xs">LOADING OPTIONS…</span>;
  const pick = p.variants.find((v) => v.colour === colour && v.size === size);
  return (
    <div className="variant-editor">
      {p.options.colours.length > 1 && (
        <label className="mini-select">
          <span className="mono-xs">COLOUR</span>
          <select value={colour ?? ""} onChange={(e) => setColour(e.target.value)}>
            {p.options.colours.map((c) => (
              <option key={c.name} value={c.name} disabled={!p.variants.some((v) => v.colour === c.name && v.available > 0)}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
      {p.options.sizes.length > 0 && (
        <label className="mini-select">
          <span className="mono-xs">SIZE</span>
          <select value={size ?? ""} onChange={(e) => setSize(e.target.value)}>
            {p.options.sizes.map((s) => {
              const v = p.variants.find((x) => x.colour === colour && x.size === s);
              return <option key={s} value={s} disabled={!v || v.available <= 0}>{s}{!v || v.available <= 0 ? " — sold out" : ""}</option>;
            })}
          </select>
        </label>
      )}
      <button
        type="button"
        className="btn btn--ghost"
        disabled={busy || !pick || pick.available <= 0}
        onClick={async () => {
          if (pick && pick.id !== line.variantId) await update(line.id, { variantId: pick.id });
          onDone();
        }}
      >
        Update
      </button>
      <button type="button" className="ap-link small-link" onClick={onDone}>Cancel</button>
    </div>
  );
}

export function BagView() {
  const { cart, ready, update, remove, busy, useCredit, setUseCredit } = useCart();
  const { user, status } = useAuth();
  const { settings } = useSettings();
  const { toggle, has } = useWishlist();
  const toast = useToast();
  const source = useCreditSource();
  const [editing, setEditing] = useState<string | null>(null);
  const lines = cart?.lines ?? [];
  const n = cart?.itemCount ?? 0;
  const credit = user?.creditBalanceKobo ?? 0;
  const afterDisc = (cart?.subtotalKobo ?? 0) - (cart?.discountKobo ?? 0);
  const applied = useCredit && credit > 0 ? Math.min(credit, afterDisc) : 0;
  const total = Math.max(0, afterDisc - applied);
  const soldOut = lines.filter((l) => l.problem === "SOLD_OUT");
  const providers = [settings.paystackEnabled && "PAYSTACK", settings.bachsEnabled && "BACHS"].filter(Boolean).join(" · ");

  const saveForLater = async (l: CartLine) => {
    if (status !== "authed") {
      toast.show({ message: "Sign in to save pieces for later.", action: { label: "Sign in", href: "/account?next=/bag" } });
      return;
    }
    const pid = (await loadProduct(l.productSlug).catch(() => null))?.id;
    if (pid && !has(pid)) await toggle({ id: pid, name: l.name });
    await remove(l.id);
  };

  return (
    <div className="container bag">
      <StepIndicator step={1} />
      <div className="split">
        <section className="split__main" aria-labelledby="bag-title">
          <div className="bag__head">
            <h1 id="bag-title" className="serif bag__title">
              Your <em>bag</em>
            </h1>
            <span className="mono-label">{n} {n === 1 ? "PIECE" : "PIECES"}</span>
          </div>
          {soldOut.length > 0 && (
            <div className="notice notice--red" role="alert">
              {soldOut.length === 1 ? `${soldOut[0].name} has sold out.` : `${soldOut.length} pieces have sold out.`} Remove {soldOut.length === 1 ? "it" : "them"} to continue to checkout.
            </div>
          )}
          {!ready && <div className="bag-line bag-line--loading" aria-busy="true"><span className="mono-xs">LOADING YOUR BAG…</span></div>}
          {lines.map((l) => (
            <div key={l.id} className={`bag-line${l.problem === "SOLD_OUT" ? " is-out" : ""}`}>
              <Link href={`/p/${l.productSlug}`} className="bag-line__img">
                <ProductImage src={l.imageUrl} alt={l.name} kind={iconKind({ material: l.material, name: l.name })} iconSize={40} sizes="132px" />
                <span className="bag-line__no">{l.number}</span>
              </Link>
              <div className="bag-line__info">
                <Link href={`/p/${l.productSlug}`} className="serif bag-line__name">{l.name}</Link>
                <span className="meta">{[l.colour, l.size, l.material].filter(Boolean).map(upper).join(" · ")}</span>
                {l.problem === "SOLD_OUT" && <span className="mono-xs red">● SOLD OUT — REMOVE TO CONTINUE</span>}
                {l.problem === "LOW_STOCK" && <span className="mono-xs red">● ONLY {l.available} LEFT — QUANTITY REDUCED AT CHECKOUT</span>}
                {editing === l.id ? (
                  <VariantEditor line={l} onDone={() => setEditing(null)} />
                ) : (
                  <div className="bag-line__actions">
                    <QtyStepper value={l.quantity} max={Math.max(1, l.available)} disabled={busy || l.problem === "SOLD_OUT"} onChange={(q) => update(l.id, { quantity: q })} />
                    <button type="button" className="ap-link small-link muted" onClick={() => remove(l.id)}>Remove</button>
                    {(l.colour || l.size) && <button type="button" className="ap-link small-link muted" onClick={() => setEditing(l.id)}>Change</button>}
                    <button type="button" className="ap-link small-link muted" onClick={() => saveForLater(l)}>Save for later</button>
                  </div>
                )}
              </div>
              <span className="bag-line__total tnum">{naira(l.lineKobo)}</span>
            </div>
          ))}
          {ready && !lines.length && (
            <div className="empty">
              <span className="serif empty__title">Nothing here <em>yet.</em></span>
              <Link href={settings.drop ? `/c/${settings.drop.collectionSlug}` : "/c/new-in"} className="ap-link">Shop the drop →</Link>
            </div>
          )}
        </section>

        <aside className="split__aside summary" aria-label="Summary">
          <div className="mono-label summary__head">SUMMARY</div>
          <div className="summary__rows">
            <div className="summary__row"><span>Subtotal</span><span className="tnum">{naira(cart?.subtotalKobo ?? 0)}</span></div>
            {!!cart?.discountKobo && <div className="summary__row"><span>Promo · {cart.promoCode}</span><span className="tnum">−{naira(cart.discountKobo)}</span></div>}
            <div className="summary__row muted"><span>Delivery</span><span>At next step</span></div>
            {applied > 0 && <div className="summary__row navy-em"><span>Exchange credit</span><span className="tnum">−{naira(applied)}</span></div>}
          </div>
          {credit > 0 && <CreditToggle amountKobo={Math.min(credit, afterDisc || credit)} on={useCredit} onChange={setUseCredit} source={source} />}
          {status === "guest" && (
            <p className="mono-xs">HAVE EXCHANGE CREDIT? <Link href="/account?next=/bag" className="ap-link">SIGN IN</Link> TO USE IT.</p>
          )}
          <PromoForm />
          <FreeDeliveryBar subtotalKobo={afterDisc} thresholdKobo={cart?.freeDeliveryThresholdKobo ?? settings.freeDeliveryThresholdKobo} />
          <div className="summary__total">
            <span>Total</span>
            <span className="serif tnum summary__amount">{naira(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="btn btn--block"
            aria-disabled={!lines.length || soldOut.length > 0}
            onClick={(e) => (!lines.length || soldOut.length > 0) && e.preventDefault()}
          >
            <span>Checkout</span>
            <span aria-hidden>→</span>
          </Link>
          <div className="summary__fine">
            <span>{providers}</span>
            <Link href="/policies/exchanges">NO REFUNDS · EXCHANGE ONLY</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
