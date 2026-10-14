"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ChatIcon, HeartIcon } from "@/components/chrome/Icons";
import { Accordion } from "@/components/ui/Accordion";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { SizeGrid } from "@/components/ui/SizeGrid";
import { Swatches } from "@/components/ui/Swatch";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useUI } from "@/context/UIContext";
import { useWishlist } from "@/context/WishlistContext";
import { arrivalFromEta, etaMaxDays, italicWord, naira, upper } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, availableFor, categoryOf, colourAvailable, fabricOf, iconKind, productUrl, tagFor, variantFor, whatsappLink } from "@/lib/product";
import type { DeliveryZone, Product } from "@/lib/types";
import { Gallery } from "./Gallery";

export function ProductView({ product: p, zones }: { product: Product; zones: DeliveryZone[] }) {
  const { settings } = useSettings();
  const { add, busy } = useCart();
  const { openSizeGuide } = useUI();
  const { has, toggle } = useWishlist();
  const hasColours = p.options.colours.length > 0;
  const hasSizes = p.options.sizes.length > 0;
  const firstColour = p.options.colours.find((c) => colourAvailable(p, c))?.name ?? p.options.colours[0]?.name ?? null;
  const [colour, setColour] = useState<string | null>(firstColour);
  const [size, setSize] = useState<string | null>(() => {
    if (!hasSizes) return null;
    if (p.options.sizes.length === 1) return p.options.sizes[0];
    return null;
  });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wipe, setWipe] = useState({ key: 0, hex: "#f2f2ef" });
  const addBtn = useRef<HTMLButtonElement>(null);
  const addBtnM = useRef<HTMLButtonElement>(null);

  const variant = variantFor(p, colour, size);
  const ready = (!hasColours || !!colour) && (!hasSizes || !!size);
  const maxQty = Math.max(1, variant?.available ?? 1);
  const soldOutAll = !p.inStock;
  const variantOut = ready && (!variant || variant.available <= 0);
  const price = variant?.priceKobo ?? p.priceKobo;
  const compareAt = variant?.compareAtKobo ?? p.compareAtKobo;
  const sale = compareAt != null && compareAt > price;
  const tag = tagFor(p);
  const kind = iconKind(p);

  const images = useMemo(() => {
    const v = p.variants.find((x) => x.colour === colour && x.imageUrls.length);
    if (v) return v.imageUrls.map((url, i) => ({ url, alt: i === 0 ? `${p.name} in ${colour}` : p.images[i]?.alt || `${p.name} — view ${i + 1}` }));
    return p.images;
  }, [p, colour]);

  const sizeCells = p.options.sizes.map((s) => ({ label: s, available: availableFor(p, colour, s) }));
  const lowSizes = sizeCells.filter((s) => s.available > 0 && s.available <= LOW_STOCK_THRESHOLD);
  const fastest = zones
    .filter((z) => z.code !== "PICKUP")
    .sort((a, b) => (etaMaxDays(a.etaText) ?? 99) - (etaMaxDays(b.etaText) ?? 99))[0];
  const arrival = fastest ? arrivalFromEta(fastest.etaText) : null;
  const providers = [settings.paystackEnabled && "Paystack", settings.bachsEnabled && "Bachs"].filter(Boolean).join(" · ");
  const collection = p.collections.find((c) => !["new-in", "sale"].includes(c.slug)) ?? p.collections[0];
  const [t1, t2, t3] = italicWord(p.name);
  const saved = has(p.id);

  const label = soldOutAll
    ? "Sold out"
    : added
      ? "Added to bag ✓"
      : hasColours && !colour
        ? "Select a colour"
        : hasSizes && !size
          ? "Select a size"
          : variantOut
            ? "Sold out in this size"
            : "Add to bag";
  const canAdd = !soldOutAll && ready && !variantOut && !busy && !added;

  const pickColour = (name: string) => {
    if (name === colour) return;
    const c = p.options.colours.find((x) => x.name === name);
    setColour(name);
    setAdded(false);
    setQty(1);
    setWipe((w) => ({ key: w.key + 1, hex: c?.hex ?? "#f2f2ef" }));
    if (size && availableFor(p, name, size) <= 0) setSize(null);
  };

  const onAdd = async (el: HTMLButtonElement | null) => {
    if (!canAdd || !variant) return;
    const ok = await add(variant.id, qty, { origin: el, label: p.name });
    if (ok) setAdded(true);
  };

  const waText = `Hi Amerapelle, I'd like styling advice on the ${p.name}${colour ? ` (${colour}${size ? `, ${size}` : ""})` : ""}: ${productUrl(p.slug)}`;

  return (
    <div className="pdp container">
      <div className="mono-label pdp__crumbs hide-mobile">
        <Link href="/" className="crumb">INDEX</Link>
        {collection && (
          <>
            {" / "}
            <Link href={`/c/${collection.slug}`} className="crumb">{upper(collection.name)}</Link>
          </>
        )}
        {categoryOf(p.material) && <> / {upper(categoryOf(p.material))}</>} / {upper(p.number)}
      </div>

      <div className="pdp__layout">
        <div className="pdp__gallery">
          <Gallery slug={p.slug} name={p.name} images={images} colourName={colour} kind={kind} tag={tag} wipe={wipe} />
        </div>

        <aside className="pdp__aside" aria-label="Product options">
          <div>
            <div className="pdp__head mono-label">
              <span>
                {upper(p.number)}
                {categoryOf(p.material) ? ` — ${upper(categoryOf(p.material))}` : ""}
              </span>
              {tag && (
                <span className="pdp__badge hide-mobile">
                  <span className="tag__dot" style={{ background: tag.dot }} />
                  {upper(tag.label)}
                </span>
              )}
            </div>
            <div className="pdp__titlerow">
              <h1 className="serif pdp__title">
                {t1}
                <em>{t2}</em>
                {t3}
              </h1>
              <span className={`pdp__price-m tnum show-mobile${sale ? " red" : ""}`}>{naira(price)}</span>
            </div>
            <div className="pdp__price hide-mobile">
              <span className={`tnum${sale ? " red" : ""}`}>
                {sale && <span className="sr-only">Sale price </span>}
                {naira(price)}
                {sale && (
                  <s className="price__was">
                    <span className="sr-only">was </span>
                    {naira(compareAt)}
                  </s>
                )}
              </span>
              <span className="mono-label">{upper(fabricOf(p.material))}</span>
            </div>
          </div>

          {hasColours && (
            <div className="pdp__opt">
              <div className="pdp__optrow hide-mobile">
                <span>Colour</span>
                <span className="muted">{colour}</span>
              </div>
              <div className="pdp__swatchrow">
                <Swatches colours={p.options.colours} value={colour} onChange={pickColour} isAvailable={(c) => colourAvailable(p, c)} />
                <span className="muted show-mobile">{colour}</span>
              </div>
            </div>
          )}

          {hasSizes && (
            <div className="pdp__opt">
              <div className="pdp__optrow hide-mobile">
                <span>Size</span>
                {p.sizeGuide !== "NONE" && (
                  <button type="button" className="ap-link small-link" onClick={() => openSizeGuide(p.sizeGuide)}>Size guide</button>
                )}
              </div>
              <SizeGrid sizes={sizeCells} value={size} onChange={(s) => { setSize(s); setAdded(false); setQty(1); }} cols={Math.min(5, Math.max(4, sizeCells.length))} />
              <div className="pdp__fit">
                <span>
                  {p.sizeGuide === "SHOES" ? "EU sizing." : "Fits true to size."}
                  {lowSizes.length > 0 && (
                    <span className="hide-mobile">
                      {" "}
                      <span className="red">●</span> {lowSizes.map((s) => `${s.available} left in ${s.label}`).join(", ")}.
                    </span>
                  )}
                </span>
                {p.sizeGuide !== "NONE" && (
                  <button type="button" className="ap-link small-link show-mobile" onClick={() => openSizeGuide(p.sizeGuide)}>Size guide</button>
                )}
              </div>
            </div>
          )}

          {ready && !variantOut && !soldOutAll && maxQty > 1 && (
            <div className="pdp__optrow pdp__qty">
              <span>Quantity</span>
              <QtyStepper value={Math.min(qty, maxQty)} max={maxQty} onChange={(n) => { setQty(n); setAdded(false); }} />
            </div>
          )}

          <div className="pdp__buy hide-mobile">
            <button ref={addBtn} type="button" className={`btn pdp__add${added ? " btn--done" : ""}`} disabled={!canAdd && !added} aria-disabled={!canAdd} onClick={() => onAdd(addBtn.current)}>
              <span>{label}</span>
              <span className="tnum">{naira(price * (ready ? qty : 1))}</span>
            </button>
            <button type="button" className={`pdp__save${saved ? " is-on" : ""}`} aria-label={saved ? "Remove from saved" : "Save"} aria-pressed={saved} onClick={() => toggle(p)}>
              <HeartIcon width={18} height={18} filled={saved} />
            </button>
          </div>
          {!p.exchangeable && <p className="mono-xs red pdp__final">● FINAL SALE — THIS PIECE CAN&apos;T BE EXCHANGED</p>}

          <div className="pdp__facts">
            <div>
              <div className="mono-xs">
                <span className="hide-mobile">DELIVERY TO </span>
                <span className="show-mobile">TO </span>
                {fastest ? upper(fastest.name.replace(/–|-/g, "–").split(" – ")[0]) : "LAGOS"}
              </div>
              <div className="pdp__fact">{arrival ?? "1–3 working days"}</div>
            </div>
            <div>
              <div className="mono-xs hide-mobile">PAY WITH</div>
              <div className="pdp__fact hide-mobile">{providers || "Paystack · Bachs"}</div>
              <div className="mono-xs show-mobile">RETURNS</div>
              <div className="pdp__fact show-mobile">{p.exchangeable ? "Exchange for credit" : "Final sale"}</div>
            </div>
          </div>

          <a href={whatsappLink(settings.whatsappNumber, waText)} className="pdp__wa" target="_blank" rel="noopener noreferrer">
            <ChatIcon />
            <span className="ap-link">Ask a stylist on WhatsApp</span>
          </a>

          <Accordion
            className="pdp__acc"
            items={[
              {
                title: "Details",
                open: true,
                body: (
                  <>
                    <p>{p.description}</p>
                    {p.details && <p>{p.details}</p>}
                  </>
                ),
              },
              { title: "Material & care", body: <p>{p.care ?? `${fabricOf(p.material)}. Care instructions are on the label inside.`}</p> },
              {
                title: "Delivery & exchanges",
                id: "exchanges",
                body: (
                  <>
                    <p>
                      {p.exchangeable ? (
                        <>No refunds. Exchange any unworn piece with its tags for credit within {settings.exchangeWindowDays} days of delivery. </>
                      ) : (
                        <>This piece is final sale and can&apos;t be exchanged. </>
                      )}
                      <Link href="/policies/exchanges" className="ap-link">Exchange policy</Link>
                    </p>
                    {zones.length > 0 && (
                      <ul className="pdp__zones">
                        {zones.map((z) => (
                          <li key={z.id}>
                            <span>{z.name}</span>
                            <span className="mono-xs">{z.etaText}</span>
                            <span className="tnum">{z.feeKobo ? naira(z.feeKobo) : "Free"}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ),
              },
            ]}
          />
        </aside>
      </div>

      {/* Mobile sticky buy bar (MobileProductV2) */}
      <div className="buybar show-mobile">
        <button type="button" className={`buybar__save${saved ? " is-on" : ""}`} aria-label={saved ? "Remove from saved" : "Save"} aria-pressed={saved} onClick={() => toggle(p)}>
          <HeartIcon width={18} height={18} filled={saved} />
        </button>
        <span className="buybar__wrap">
          <button ref={addBtnM} type="button" className={`btn buybar__add${added ? " btn--done" : ""}`} disabled={!canAdd && !added} aria-disabled={!canAdd} onClick={() => onAdd(addBtnM.current)}>
            <span>{added ? "Added ✓" : label}</span>
            <span className="tnum">{naira(price * (ready ? qty : 1))}</span>
          </button>
          {added && <BurstStar />}
        </span>
      </div>
    </div>
  );
}

function BurstStar() {
  return (
    <svg className="ap-burst burst-star" aria-hidden width="56" height="56" viewBox="0 0 100 100">
      <path d="M50 2 Q50 50 98 50 Q50 50 50 98 Q50 50 2 50 Q50 50 50 2Z" fill="#d3262c" />
    </svg>
  );
}
