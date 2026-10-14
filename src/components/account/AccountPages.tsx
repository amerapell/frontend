"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { CheckRow, FieldBox, SelectBox, TextAreaBox } from "@/components/ui/Field";
import { StepTracker } from "@/components/ui/StepTracker";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { accountApi, ApiError } from "@/lib/api";
import { ORDER_STATUS_LABEL, apiMessage, localPhoneDisplay, longDate, naira, toE164NG, upper } from "@/lib/format";
import { useNgStates } from "@/lib/useNgStates";
import { iconKind } from "@/lib/product";
import type { Address, Order } from "@/lib/types";
import { useAccount } from "./AccountShell";
import { OrderItems, OrderTotals } from "./OrderParts";

function PageHead({ index, title, sub }: { index: string; title: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="account__head">
      <div className="mono-label">{index}</div>
      <h1 className="serif account__title">{title}</h1>
      {sub && <p className="body-copy account__sub">{sub}</p>}
    </div>
  );
}

export function canExchange(o: Order) {
  return o.status === "DELIVERED" && !!o.exchangeableUntil && new Date(o.exchangeableUntil).getTime() > Date.now() && o.items.some((i) => i.exchangeable);
}

/* ---------------- Orders ---------------- */

export function OrdersList({ compact }: { compact?: boolean }) {
  const { orders } = useAccount();
  if (!orders) return <p className="mono-label">LOADING ORDERS…</p>;
  if (!orders.length)
    return (
      <div className="empty">
        <span className="serif empty__title">No orders <em>yet.</em></span>
        <Link href="/c/new-in" className="ap-link">Shop new in →</Link>
      </div>
    );
  return (
    <ul className="order-list">
      {(compact ? orders.slice(0, 3) : orders).map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.number}`} className="order-row">
            <span className="order-row__thumbs" aria-hidden>
              {o.items.slice(0, 3).map((i) => (
                <span key={i.id} className="order-row__thumb">
                  <ProductImage src={i.imageUrl} alt="" kind={iconKind({ material: null, name: i.name })} iconSize={18} sizes="48px" />
                </span>
              ))}
            </span>
            <span className="stack">
              <span className="serif order-row__no">{o.number}</span>
              <span className="meta">
                {longDate(o.createdAt).toUpperCase()} · {o.items.reduce((s, i) => s + i.quantity, 0)} PIECES
              </span>
            </span>
            <span className={`status-pill status-pill--${o.status.toLowerCase()}`}>{ORDER_STATUS_LABEL[o.status]}</span>
            <span className="tnum">{naira(o.totalKobo)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** PATCH /me — name, phone, marketing consent. */
function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: localPhoneDisplay(user?.phone) });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="stack gap-12"
      onSubmit={async (e) => {
        e.preventDefault();
        const phone = f.phone.trim() ? toE164NG(f.phone) : null;
        if (f.phone.trim() && !phone) return setErr("Enter a Nigerian phone number, e.g. 0803 000 0000.");
        setBusy(true);
        setErr(null);
        try {
          await accountApi.updateMe({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone, marketingConsent: consent });
          await refreshUser();
          toast.show({ message: "Profile saved." });
        } catch (x) {
          setErr(apiMessage(x));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field-grid field-grid--200">
        <FieldBox label="FIRST NAME" autoComplete="given-name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
        <FieldBox label="LAST NAME" autoComplete="family-name" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
        <FieldBox label="PHONE · +234" type="tel" autoComplete="tel-national" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      </div>
      <CheckRow checked={consent} onChange={setConsent} id="me-consent" sub="NDPA · UNSUBSCRIBE ANY TIME">Email me about new drops and private sales</CheckRow>
      {err && <p className="form-error" role="alert">{err}</p>}
      <button className="btn btn--outline btn--short" disabled={busy} style={{ alignSelf: "flex-start" }}>{busy ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function AccountOverview() {
  const { user } = useAuth();
  const { orders } = useAccount();
  const eligible = orders?.filter(canExchange) ?? [];
  return (
    <>
      <PageHead index="OVERVIEW" title={<>Your <em>account</em></>} sub={user ? `Signed in as ${user.email}.` : undefined} />
      {eligible.length > 0 && (
        <div className="notice">
          {eligible[0].number} can be exchanged until {longDate(eligible[0].exchangeableUntil)}. <Link href={`/account/exchanges?order=${eligible[0].number}`} className="ap-link">Request an exchange</Link>
        </div>
      )}
      <div className="section-head section-head--ink">
        <h2 className="serif section-head__title account__h2">Recent <em>orders</em></h2>
        <Link href="/account/orders" className="ap-link small-link">All orders →</Link>
      </div>
      <OrdersList compact />
      <div className="section-head section-head--ink">
        <h2 className="serif section-head__title account__h2">Your <em>details</em></h2>
      </div>
      <ProfileForm />
    </>
  );
}

export function OrdersPage() {
  return (
    <>
      <PageHead index="ORDERS" title={<>Your <em>orders</em></>} />
      <OrdersList />
    </>
  );
}

const ORDER_STEPS = (pickup: boolean) => [
  { label: "Paid", desc: "Payment confirmed", s: ["PAID"] },
  { label: "Processing", desc: "Packed in Lagos", s: ["PROCESSING"] },
  pickup ? { label: "Ready", desc: "Collect from the store", s: ["READY_FOR_PICKUP"] } : { label: "Dispatched", desc: "Rider on the way", s: ["DISPATCHED"] },
  { label: pickup ? "Collected" : "Delivered", desc: "Enjoy it", s: ["DELIVERED", "EXCHANGE_REQUESTED", "EXCHANGED"] },
];

export function OrderDetail({ order }: { order: Order }) {
  const pickup = order.delivery.zone === "PICKUP";
  const steps = ORDER_STEPS(pickup);
  const reached = order.status === "PENDING_PAYMENT" || order.status === "CANCELLED" ? 0 : steps.findIndex((s) => s.s.includes(order.status)) + 1;
  return (
    <div className="stack gap-28">
      <PageHead
        index={`ORDER ${order.number} · ${upper(ORDER_STATUS_LABEL[order.status])}`}
        title={<>Order <em>{order.number.replace("AP-", "")}</em></>}
        sub={`Placed ${longDate(order.createdAt)}${order.deliveredAt ? ` · delivered ${longDate(order.deliveredAt)}` : ""}.`}
      />
      {order.status === "CANCELLED" ? <div className="notice notice--red">This order was cancelled.</div> : <StepTracker steps={steps} reached={reached} />}
      {canExchange(order) && (
        <div className="notice">
          Exchangeable until {longDate(order.exchangeableUntil)}. <Link href={`/account/exchanges?order=${order.number}`} className="ap-link">Request an exchange</Link>
        </div>
      )}
      <div className="split split--tight">
        <div className="split__main">
          <OrderItems order={order} />
        </div>
        <aside className="split__aside">
          <OrderTotals order={order} />
        </aside>
      </div>
    </div>
  );
}

export function AccountOrderDetail({ number }: { number: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    accountApi
      .order(number)
      .then(setOrder)
      .catch((e) => setErr(e instanceof ApiError && e.status === 404 ? "We couldn't find that order on your account." : apiMessage(e)));
  }, [number]);
  if (err)
    return (
      <div className="empty">
        <p className="body-copy">{err}</p>
        <Link href="/account/orders" className="ap-link">← All orders</Link>
      </div>
    );
  if (!order) return <p className="mono-label">LOADING ORDER…</p>;
  return (
    <>
      <Link href="/account/orders" className="ap-link small-link">← All orders</Link>
      <OrderDetail order={order} />
    </>
  );
}

/* ---------------- Addresses ---------------- */

const blank: Address = { fullName: "", phone: "", state: "Lagos", lga: "", area: "", street: "", landmark: "", note: "" };

function AddressForm({ initial, onSave, onCancel }: { initial: Address; onSave: (a: Address) => Promise<void>; onCancel: () => void }) {
  const ng = useNgStates();
  const [a, setA] = useState<Address>({ ...initial, phone: localPhoneDisplay(initial.phone) || initial.phone });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Address, v: string) => setA((x) => ({ ...x, [k]: v, ...(k === "state" ? { lga: "" } : {}) }));
  return (
    <form
      className="address-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const phone = toE164NG(a.phone);
        if (!a.fullName || !phone || !a.lga || !a.area || !a.street || !a.landmark) return setErr("Fill in every field (note is optional). Phone must be Nigerian.");
        setBusy(true);
        try {
          await onSave({ ...a, phone });
        } catch (x) {
          setErr(apiMessage(x));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field-grid field-grid--200">
        <FieldBox full label="FULL NAME" value={a.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
        <FieldBox label="PHONE · +234" type="tel" value={a.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel-national" />
        <SelectBox label="STATE" value={a.state} onChange={(e) => set("state", e.target.value)}>
          {ng.names.map((s) => <option key={s}>{s}</option>)}
        </SelectBox>
        <SelectBox label="LGA" value={a.lga} onChange={(e) => set("lga", e.target.value)}>
          <option value="">Choose…</option>
          {ng.lgasFor(a.state).map((l) => <option key={l}>{l}</option>)}
        </SelectBox>
        <FieldBox label="CITY / AREA" value={a.area} onChange={(e) => set("area", e.target.value)} />
        <FieldBox full label="STREET ADDRESS" value={a.street} onChange={(e) => set("street", e.target.value)} autoComplete="street-address" />
        <FieldBox full label="NEAREST LANDMARK" value={a.landmark} onChange={(e) => set("landmark", e.target.value)} />
        <TextAreaBox full label="DELIVERY NOTE · OPTIONAL" rows={2} value={a.note ?? ""} onChange={(e) => set("note", e.target.value)} />
      </div>
      {err && <p className="form-error" role="alert">{err}</p>}
      <div className="row gap-16">
        <button className="btn btn--short" disabled={busy}>Save address</button>
        <button type="button" className="ap-link small-link" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function AddressesPage() {
  const { addresses, setAddresses } = useAccount();
  const toast = useToast();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const list = addresses ?? [];
  return (
    <>
      <PageHead index="ADDRESSES" title={<>Saved <em>addresses</em></>} sub="Used to fill checkout faster. No postcode needed — a landmark helps the rider." />
      {editing === "new" ? (
        <AddressForm
          initial={blank}
          onCancel={() => setEditing(null)}
          onSave={async (a) => {
            const created = await accountApi.addAddress(a);
            setAddresses([...list, created]);
            setEditing(null);
            toast.show({ message: "Address saved." });
          }}
        />
      ) : (
        <button className="btn btn--outline btn--short" onClick={() => setEditing("new")}>Add an address +</button>
      )}
      <ul className="address-list">
        {list.map((a) =>
          editing === a.id ? (
            <li key={a.id}>
              <AddressForm
                initial={a}
                onCancel={() => setEditing(null)}
                onSave={async (x) => {
                  const updated = await accountApi.updateAddress(a.id!, x);
                  setAddresses(list.map((y) => (y.id === a.id ? updated : y)));
                  setEditing(null);
                }}
              />
            </li>
          ) : (
            <li key={a.id} className="address-card">
              <span className="mono-xs">{upper(a.lga)} · {upper(a.state)}</span>
              <span className="serif address-card__name">{a.fullName}</span>
              <span>{a.street}, {a.area}</span>
              <span className="muted">Near {a.landmark}</span>
              <span className="muted">{localPhoneDisplay(a.phone) ? `+234 ${localPhoneDisplay(a.phone)}` : a.phone}</span>
              <span className="row gap-16">
                <button className="ap-link small-link" onClick={() => setEditing(a.id!)}>Edit</button>
                <button
                  className="ap-link small-link muted"
                  onClick={async () => {
                    await accountApi.deleteAddress(a.id!);
                    setAddresses(list.filter((y) => y.id !== a.id));
                  }}
                >
                  Delete
                </button>
              </span>
            </li>
          ),
        )}
      </ul>
    </>
  );
}

/* ---------------- Wishlist ---------------- */

export function WishlistPage() {
  const { items, reload } = useWishlist();
  useEffect(() => {
    void reload();
  }, [reload]);
  return (
    <>
      <PageHead index="SAVED" title={<>Saved <em>pieces</em></>} />
      {items.length ? (
        <div className="product-grid product-grid--3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <span className="serif empty__title">Nothing saved <em>yet.</em></span>
          <p className="body-copy">Tap the heart on any piece to keep it here.</p>
          <Link href="/c/new-in" className="ap-link">Shop new in →</Link>
        </div>
      )}
    </>
  );
}

/* ---------------- Privacy (NDPA) ---------------- */

export function PrivacyPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const exportData = async () => {
    setBusy("export");
    setErr(null);
    try {
      const data = await accountApi.dataExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amerapelle-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(apiMessage(e));
    } finally {
      setBusy(null);
    }
  };
  const del = async () => {
    setBusy("delete");
    setErr(null);
    try {
      await accountApi.deleteAccount();
      await logout();
      router.push("/");
    } catch (e) {
      setErr(apiMessage(e));
      setBusy(null);
    }
  };
  return (
    <>
      <PageHead index="PRIVACY · NDPA 2023" title={<>Your <em>data</em></>} sub="Download everything we hold about you, or delete your account. Order records we must keep for tax are anonymised." />
      <div className="privacy-block">
        <div>
          <h2 className="privacy-block__title">Download your data</h2>
          <p className="body-copy">A JSON file with your profile, addresses, orders, exchanges, credit and saved pieces.</p>
        </div>
        <button className="btn btn--outline btn--short" onClick={exportData} disabled={busy !== null}>{busy === "export" ? "Preparing…" : "Download JSON"}</button>
      </div>
      <div className="privacy-block privacy-block--danger">
        <div>
          <h2 className="privacy-block__title">Delete your account</h2>
          <p className="body-copy">This signs you out everywhere and anonymises your personal data. Unspent exchange credit is forfeited. This can&apos;t be undone.</p>
          <FieldBox label='TYPE "DELETE" TO CONFIRM' value={confirm} onChange={(e) => setConfirm(e.target.value)} className="privacy-block__confirm" />
        </div>
        <button className="btn btn--danger btn--short" disabled={confirm !== "DELETE" || busy !== null} onClick={del}>{busy === "delete" ? "Deleting…" : "Delete account"}</button>
      </div>
      {err && <p className="form-error" role="alert">{err}</p>}
      <p className="mono-xs">
        SEE OUR <Link href="/policies/privacy" className="ap-link">PRIVACY POLICY</Link> FOR HOW WE USE YOUR DATA.
      </p>
    </>
  );
}

export function useEligibleOrders(orders: Order[] | null) {
  return useMemo(() => (orders ?? []).filter(canExchange), [orders]);
}
