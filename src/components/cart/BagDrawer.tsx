"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { CloseIcon } from "@/components/chrome/Icons";
import { useDialog } from "@/components/chrome/useDialog";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { ProductImage } from "@/components/product/ProductImage";
import { naira, upper } from "@/lib/format";
import { iconKind } from "@/lib/product";
import { FreeDeliveryBar } from "./FreeDeliveryBar";

/** CRT-1: slide-out bag drawer, opened when something is added. */
export function BagDrawer() {
  const { cart, drawerOpen, setDrawerOpen, update, remove, lastAdded, busy } = useCart();
  const { settings } = useSettings();
  const pathname = usePathname();
  const close = () => setDrawerOpen(false);
  const ref = useDialog(drawerOpen, close);
  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);
  if (!drawerOpen) return null;
  const lines = cart?.lines ?? [];
  const n = cart?.itemCount ?? 0;
  const threshold = cart?.freeDeliveryThresholdKobo ?? settings.freeDeliveryThresholdKobo;
  const blocked = lines.some((l) => l.problem === "SOLD_OUT");

  return (
    <div className="overlay overlay--drawer" onClick={close}>
      <aside ref={ref} className="drawer" role="dialog" aria-modal="true" aria-label="Your bag" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__head">
          <div>
            <span className="mono-label">{lastAdded ? "ADDED TO YOUR BAG" : "YOUR BAG"}</span>
            <h2 className="serif drawer__title">Your <em>bag</em></h2>
          </div>
          <span className="row gap-8">
            <span className="mono-label">{n} {n === 1 ? "PIECE" : "PIECES"}</span>
            <button className="icon-btn" aria-label="Close bag" onClick={close} data-autofocus><CloseIcon /></button>
          </span>
        </div>
        <FreeDeliveryBar subtotalKobo={(cart?.subtotalKobo ?? 0) - (cart?.discountKobo ?? 0)} thresholdKobo={threshold} />
        <ul className="drawer__lines">
          {lines.map((l) => (
            <li key={l.id} className={`drawer-line${lastAdded?.id === l.id ? " is-new" : ""}`}>
              <Link href={`/p/${l.productSlug}`} className="drawer-line__img">
                <ProductImage src={l.imageUrl} alt={l.name} kind={iconKind({ material: l.material, name: l.name })} iconSize={28} sizes="72px" />
              </Link>
              <div className="stack gap-8">
                <Link href={`/p/${l.productSlug}`} className="serif drawer-line__name">{l.name}</Link>
                <span className="meta">{[l.colour, l.size].filter(Boolean).map(upper).join(" · ")}</span>
                {l.problem && <span className="mono-xs red">{l.problem === "SOLD_OUT" ? "● SOLD OUT" : `● ONLY ${l.available} LEFT`}</span>}
                <div className="row gap-16">
                  <QtyStepper value={l.quantity} max={Math.max(1, l.available)} disabled={busy} onChange={(q) => update(l.id, { quantity: q })} />
                  <button className="ap-link small-link" onClick={() => remove(l.id)}>Remove</button>
                </div>
              </div>
              <span className="tnum">{naira(l.lineKobo)}</span>
            </li>
          ))}
          {!lines.length && <li className="drawer__empty serif">Nothing here <em>yet.</em></li>}
        </ul>
        <div className="drawer__foot">
          <div className="row between">
            <span>Subtotal</span>
            <span className="serif tnum drawer__total">{naira((cart?.subtotalKobo ?? 0) - (cart?.discountKobo ?? 0))}</span>
          </div>
          <Link href="/checkout" className="btn btn--block" aria-disabled={!lines.length || blocked} onClick={(e) => (!lines.length || blocked) && e.preventDefault()}>
            <span>Checkout</span>
            <span aria-hidden>→</span>
          </Link>
          <div className="row between">
            <Link href="/bag" className="ap-link small-link">View bag</Link>
            <span className="mono-xs">NO REFUNDS · EXCHANGE ONLY</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
