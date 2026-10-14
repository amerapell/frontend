"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StepIndicator } from "@/components/chrome/CheckoutHeader";
import { CheckRow, FieldBox, SelectBox, TextAreaBox } from "@/components/ui/Field";
import { ProviderCard } from "@/components/ui/ProviderCard";
import { RadioRow } from "@/components/ui/RadioRow";
import { ProductImage } from "@/components/product/ProductImage";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { accountApi, checkoutApi } from "@/lib/api";
import { apiMessage, arrivalFromEta, localPhoneDisplay, naira, toE164NG, upper } from "@/lib/format";
import { useNgStates } from "@/lib/useNgStates";
import { iconKind } from "@/lib/product";
import type { Address, CheckoutQuote, DeliveryZone, PaymentProviderCode, ZoneCode } from "@/lib/types";

const PROVIDERS: { code: PaymentProviderCode; name: string; tag: string; desc: string; short: string }[] = [
  { code: "PAYSTACK", name: "Paystack", tag: "IN NAIRA", desc: "Card, bank transfer or USSD.", short: "Card · transfer · USSD" },
  { code: "BACHS", name: "Bachs", tag: "FROM ABROAD", desc: "Card in your own currency, bank transfer or USDT / USDC.", short: "Your currency · USDT/USDC" },
];

const SHORT: Record<ZoneCode, string> = {
  LAGOS_ISLAND: "Island",
  LAGOS_MAINLAND: "Mainland",
  LEKKI_AJAH: "Lekki–Ajah",
  OTHER_STATES: "Other states",
  PICKUP: "Pickup",
};

type Errors = Partial<Record<"email" | "phone" | "fullName" | "state" | "lga" | "area" | "street" | "landmark" | "provider" | "zone", string>>;

const emptyAddress: Address = { fullName: "", phone: "", state: "Lagos", lga: "", area: "", street: "", landmark: "", note: "" };

export function CheckoutView({ zones }: { zones: DeliveryZone[] }) {
  const router = useRouter();
  const { settings } = useSettings();
  const { user, status } = useAuth();
  const { cart, ready, useCredit, setUseCredit } = useCart();
  const enabled = PROVIDERS.filter((p) => (p.code === "PAYSTACK" ? settings.paystackEnabled : settings.bachsEnabled));

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState<ZoneCode | null>(null);
  const [addr, setAddr] = useState<Address>(emptyAddress);
  const [saved, setSaved] = useState<Address[]>([]);
  const [savedId, setSavedId] = useState<string | "new">("new");
  const [saveAddress, setSaveAddress] = useState(true);
  const [provider, setProvider] = useState<PaymentProviderCode | null>(enabled[0]?.code ?? null);
  const [consent, setConsent] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // default zone: Lekki–Ajah if present (design), else first
  useEffect(() => {
    if (zone || !zones.length) return;
    setZone((zones.find((z) => z.code === "LEKKI_AJAH") ?? zones[0]).code);
  }, [zones, zone]);

  // prefill for signed-in customers + saved addresses (CHK-3)
  useEffect(() => {
    if (status !== "authed" || !user) return;
    setEmail((e) => e || user.email);
    setPhone((p) => p || localPhoneDisplay(user.phone));
    accountApi
      .addresses()
      .then((list) => {
        setSaved(list);
        if (list[0]?.id) {
          setSavedId(list[0].id);
          setAddr({ ...emptyAddress, ...list[0] });
        }
      })
      .catch(() => {});
  }, [status, user]);

  const chosenZone = zones.find((z) => z.code === zone);
  const pickup = zone === "PICKUP";
  const lines = cart?.lines ?? [];

  // live quote (delivery fee, credit, problems)
  useEffect(() => {
    if (!zone || !lines.length) return;
    let alive = true;
    checkoutApi
      .quote(zone, useCredit)
      .then((q) => alive && setQuote(q))
      .catch(() => alive && setQuote(null));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone, useCredit, cart?.subtotalKobo, cart?.discountKobo, cart?.itemCount, status]);

  const ng = useNgStates();
  const lgas = useMemo(() => ng.lgasFor(addr.state), [ng, addr.state]);
  const set = (k: keyof Address, v: string) => {
    setAddr((a) => ({ ...a, [k]: v, ...(k === "state" ? { lga: "" } : {}) }));
    setSavedId("new");
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (!toE164NG(phone)) e.phone = "Enter a Nigerian number, e.g. 0803 000 0000 or +234 803 000 0000.";
    if (!zone) e.zone = "Choose a delivery method.";
    if (!pickup) {
      if (!addr.fullName.trim()) e.fullName = "Enter the recipient's full name.";
      if (!addr.state) e.state = "Choose a state.";
      if (!addr.lga) e.lga = "Choose an LGA.";
      if (!addr.area.trim()) e.area = "Enter the city or area.";
      if (!addr.street.trim()) e.street = "Enter the street address.";
      if (!addr.landmark.trim()) e.landmark = "A nearby landmark helps the rider find you.";
    }
    if (!provider && (quote?.amountDueKobo ?? 1) > 0) e.provider = "Choose how you'd like to pay.";
    return e;
  };

  const problems = quote?.problems ?? lines.filter((l) => l.problem);
  const blocked = problems.some((p) => p.problem === "SOLD_OUT");
  const sub = quote?.subtotalKobo ?? cart?.subtotalKobo ?? 0;
  const discount = quote?.discountKobo ?? cart?.discountKobo ?? 0;
  const delivery = quote?.deliveryKobo ?? chosenZone?.feeKobo ?? 0;
  const creditAvail = quote?.creditAvailableKobo ?? user?.creditBalanceKobo ?? 0;
  const creditApplied = quote?.creditAppliedKobo ?? 0;
  const due = quote?.amountDueKobo ?? Math.max(0, sub - discount + delivery);
  const providerName = enabled.find((p) => p.code === provider)?.name ?? "card";
  const payLabel = due === 0 && lines.length ? "Place order — paid with credit" : `Pay with ${providerName}`;
  const n = cart?.itemCount ?? 0;
  const arrival = chosenZone && !pickup ? arrivalFromEta(chosenZone.etaText) : null;
  const letter = (i: number) => String.fromCharCode(65 + i);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    if (blocked) {
      setFormError("Some pieces in your bag have sold out. Remove them from your bag to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const e164 = toE164NG(phone)!;
      const address: Address | null = pickup
        ? null
        : { ...addr, phone: toE164NG(addr.phone || phone) ?? e164, note: addr.note?.trim() || null, id: savedId !== "new" ? savedId : undefined };
      const res = await checkoutApi.create({
        email: email.trim(),
        phone: e164,
        zoneCode: zone!,
        address,
        provider: provider ?? "PAYSTACK",
        useCredit: useCredit && creditAvail > 0,
        marketingConsent: consent,
        saveAddress: status === "authed" && !pickup && savedId === "new" ? saveAddress : undefined,
      });
      if (res.payment.authorizationUrl) {
        // hosted page (Paystack / Bachs); confirmation happens on /checkout/complete via server verification
        window.location.assign(res.payment.authorizationUrl);
      } else {
        router.push(`/checkout/complete?reference=${encodeURIComponent(res.payment.reference)}`);
      }
    } catch (err) {
      setFormError(apiMessage(err, "We couldn't start your payment. Please try again."));
      setSubmitting(false);
    }
  };

  if (ready && !lines.length && !submitting) {
    return (
      <div className="container checkout">
        <StepIndicator step={2} />
        <div className="empty">
          <span className="serif empty__title">Your bag is <em>empty.</em></span>
          <Link href="/c/new-in" className="ap-link">Shop new in →</Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} className="container checkout" onSubmit={submit} noValidate>
      <div className="hide-mobile">
        <StepIndicator step={2} />
      </div>
      <div className="m-steps show-mobile">
        <span>
          <span className="faint">01 BAG ✓</span> &nbsp; <span>02 DETAILS</span> &nbsp; <span className="faint">03 PAY</span>
        </span>
        <span>
          {n} {n === 1 ? "PIECE" : "PIECES"} · {naira(sub - discount)}
        </span>
      </div>

      <div className="split">
        <div className="split__main checkout__sections">
          <h1 className="serif checkout__mtitle show-mobile">
            Where <em>to?</em>
          </h1>
          <h1 className="sr-only">Checkout</h1>

          <section className="co-section" aria-labelledby="co-contact">
            <div className="co-section__head">
              <span className="mono-label">A.</span>
              <h2 id="co-contact" className="serif">Contact</h2>
            </div>
            <div className="field-grid field-grid--240">
              <FieldBox label="EMAIL" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} error={errors.email} required />
              <FieldBox label="PHONE · +234" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="803 000 0000" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: undefined })); }} error={errors.phone} required />
            </div>
            {status === "guest" && (
              <p className="mono-xs">
                HAVE AN ACCOUNT? <Link href="/account?next=/checkout" className="ap-link">SIGN IN</Link> FOR SAVED ADDRESSES AND EXCHANGE CREDIT.
              </p>
            )}
          </section>

          <section className="co-section co-section--flush" aria-labelledby="co-delivery">
            <div className="co-section__head">
              <span className="mono-label">B.</span>
              <h2 id="co-delivery" className="serif">Delivery</h2>
            </div>
            <div role="radiogroup" aria-labelledby="co-delivery" aria-invalid={!!errors.zone}>
              {zones.map((z) => {
                const eta = z.code !== "PICKUP" && z.code === zone ? arrivalFromEta(z.etaText) : null;
                const meta = z.code === "PICKUP" ? `${upper(settings.pickupAddress || "STORE")} · ${z.etaText}` : `${z.etaText}${eta ? ` · ARRIVES ${upper(eta)}` : ""}`;
                return (
                  <RadioRow
                    key={z.id}
                    name="zone"
                    value={z.code}
                    checked={zone === z.code}
                    onChange={(v) => { setZone(v as ZoneCode); setErrors((x) => ({ ...x, zone: undefined })); }}
                    title={z.name}
                    meta={meta}
                    aside={z.feeKobo ? naira(z.feeKobo) : "Free"}
                  />
                );
              })}
            </div>
            {errors.zone && <span className="field__error" role="alert">{errors.zone}</span>}
            {!zones.length && <p className="form-error">Delivery options are unavailable right now. Please refresh.</p>}
          </section>

          {!pickup && (
            <section className="co-section" aria-labelledby="co-address">
              <div className="co-section__head">
                <span className="mono-label">C.</span>
                <h2 id="co-address" className="serif">Address</h2>
              </div>
              {saved.length > 0 && (
                <div className="saved-addr" role="radiogroup" aria-label="Saved addresses">
                  {saved.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={savedId === a.id}
                      className={`saved-addr__item${savedId === a.id ? " is-on" : ""}`}
                      onClick={() => { setSavedId(a.id!); setAddr({ ...emptyAddress, ...a }); setErrors({}); }}
                    >
                      <span className="mono-xs">{upper(a.lga)} · {upper(a.state)}</span>
                      <span>{a.street}, {a.area}</span>
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={savedId === "new"} className={`saved-addr__item${savedId === "new" ? " is-on" : ""}`} onClick={() => { setSavedId("new"); setAddr({ ...emptyAddress, fullName: addr.fullName }); }}>
                    <span className="mono-xs">NEW</span>
                    <span>Use a new address</span>
                  </button>
                </div>
              )}
              <div className="field-grid field-grid--3">
                <FieldBox full label="FULL NAME" autoComplete="name" value={addr.fullName} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} />
                <SelectBox label="STATE" autoComplete="address-level1" value={addr.state} onChange={(e) => set("state", e.target.value)} error={errors.state}>
                  {ng.names.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </SelectBox>
                <SelectBox label="LGA" value={addr.lga} onChange={(e) => set("lga", e.target.value)} error={errors.lga}>
                  <option value="">Choose…</option>
                  {lgas.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </SelectBox>
                <FieldBox label="CITY / AREA" autoComplete="address-level2" value={addr.area} onChange={(e) => set("area", e.target.value)} error={errors.area} placeholder="Lekki Phase 1" />
                <FieldBox full label="STREET ADDRESS" autoComplete="street-address" value={addr.street} onChange={(e) => set("street", e.target.value)} error={errors.street} />
                <FieldBox full label="NEAREST LANDMARK · HELPS THE RIDER" value={addr.landmark} onChange={(e) => set("landmark", e.target.value)} error={errors.landmark} placeholder="Opposite the filling station" />
                <TextAreaBox full label="DELIVERY NOTE · OPTIONAL" rows={2} value={addr.note ?? ""} onChange={(e) => set("note", e.target.value)} placeholder="Gate code, best time to call…" />
              </div>
              {status === "authed" && savedId === "new" && (
                <CheckRow checked={saveAddress} onChange={setSaveAddress} id="save-addr">Save this address to my account</CheckRow>
              )}
            </section>
          )}

          <section className="co-section" aria-labelledby="co-pay">
            <div className="co-section__head">
              <span className="mono-label">{letter(pickup ? 2 : 3)}.</span>
              <h2 id="co-pay" className="serif">Payment</h2>
            </div>
            {enabled.length ? (
              <div className="provider-grid" role="radiogroup" aria-labelledby="co-pay">
                {enabled.map((p) => (
                  <ProviderCard key={p.code} name={p.name} tag={p.tag} desc={p.desc} selected={provider === p.code} onSelect={() => { setProvider(p.code); setErrors((x) => ({ ...x, provider: undefined })); }} />
                ))}
              </div>
            ) : (
              <p className="form-error">Online payment is paused right now. Message us on WhatsApp to order.</p>
            )}
            {errors.provider && <span className="field__error" role="alert">{errors.provider}</span>}
            <CheckRow checked={consent} onChange={setConsent} id="consent" sub="OPTIONAL · UNSUBSCRIBE ANY TIME">
              Email me about new drops and private sales
            </CheckRow>
          </section>
        </div>

        <aside className="split__aside summary summary--checkout" aria-label="Order summary">
          <div className="mono-label summary__head">ORDER · {n} {n === 1 ? "PIECE" : "PIECES"}</div>
          <ul className="summary__lines">
            {lines.map((l) => (
              <li key={l.id} className="summary-line">
                <span className="summary-line__img">
                  <ProductImage src={l.imageUrl} alt="" kind={iconKind({ material: l.material, name: l.name })} iconSize={20} sizes="56px" />
                </span>
                <span>
                  {l.name}
                  {l.quantity > 1 ? ` × ${l.quantity}` : ""}
                  <span className="meta summary-line__meta">{[l.colour, l.size].filter(Boolean).map(upper).join(" · ")}</span>
                  {l.problem && <span className="mono-xs red summary-line__meta">{l.problem === "SOLD_OUT" ? "● SOLD OUT" : `● ONLY ${l.available} LEFT`}</span>}
                </span>
                <span className="tnum">{naira(l.lineKobo)}</span>
              </li>
            ))}
          </ul>
          {problems.length > 0 && (
            <div className="notice notice--red" role="alert">
              {blocked ? "Some pieces sold out while you were shopping." : "Stock changed on some pieces."} <Link href="/bag" className="ap-link">Review your bag</Link>
            </div>
          )}
          <div className="summary__rows summary__rows--rule">
            <div className="summary__row"><span>Subtotal</span><span className="tnum">{naira(sub)}</span></div>
            {discount > 0 && <div className="summary__row"><span>Promo · {cart?.promoCode}</span><span className="tnum">−{naira(discount)}</span></div>}
            <div className="summary__row">
              <span>Delivery · {zone ? SHORT[zone] : "—"}</span>
              <span className="tnum">{delivery ? naira(delivery) : "Free"}</span>
            </div>
            {creditAvail > 0 && (
              <button type="button" role="switch" aria-checked={useCredit} className={`credit-line${useCredit ? " is-on" : ""}`} onClick={() => setUseCredit(!useCredit)}>
                <span className="row gap-12">
                  <span className={`check-box check-box--sm${useCredit ? " is-on" : ""}`} aria-hidden />
                  Exchange credit
                </span>
                <span className="tnum">−{naira(useCredit ? creditApplied : Math.min(creditAvail, sub - discount + delivery))}</span>
              </button>
            )}
          </div>
          <div className="summary__total">
            <span>
              Total
              <span className="mono-xs summary__note">{pickup ? "NOTHING ELSE TO PAY" : arrival ? `ARRIVES ${upper(arrival)}` : "INCL. DELIVERY"}</span>
            </span>
            <span className="serif tnum summary__amount">{naira(due)}</span>
          </div>
          <p className="exchange-line">
            <span className="mono-xs">NO REFUNDS ·</span> Unworn pieces can be exchanged for credit. <Link href="/policies/exchanges" className="ap-link">Exchange policy</Link>
          </p>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button type="submit" className="btn btn--block hide-mobile" disabled={submitting || !lines.length || blocked || (!enabled.length && due > 0)}>
            <span>{submitting ? "Opening secure payment…" : payLabel}</span>
            <span aria-hidden>→</span>
          </button>
          <p className="summary__small hide-mobile">
            {due === 0 && lines.length
              ? "Your exchange credit covers this order — no payment needed."
              : `You'll finish on ${providerName}'s secure page. Your order is confirmed once payment clears. No refunds; unworn pieces can be exchanged for credit.`}
          </p>
        </aside>
      </div>

      {/* Mobile pay bar (MobileCheckoutV2) */}
      <div className="paybar show-mobile">
        <div className="paybar__fine">
          <span>{pickup ? "PICKUP · FREE" : `+ DELIVERY · ${upper(zone ? SHORT[zone] : "")}`}</span>
          <Link href="/policies/exchanges">NO REFUNDS · EXCHANGE ONLY</Link>
        </div>
        <button type="submit" className="btn btn--block paybar__btn" disabled={submitting || !lines.length || blocked}>
          <span>{submitting ? "Opening…" : payLabel}</span>
          <span className="tnum">{naira(due)} →</span>
        </button>
      </div>
    </form>
  );
}
