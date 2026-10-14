"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CreditCard } from "@/components/ui/CreditCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { accountApi, exchangesApi } from "@/lib/api";
import type { Address, CreditLedger, Exchange, Order } from "@/lib/types";
import { AuthForms } from "./AuthForms";
import { CreditLocked, VerifyEmailView, VerifyNoticeBar } from "./EmailVerification";

type AccountData = {
  orders: Order[] | null;
  addresses: Address[] | null;
  credit: CreditLedger | null;
  exchanges: Exchange[] | null;
  reload: () => Promise<void>;
  setAddresses: (a: Address[]) => void;
  pendingCredit: { amountKobo: number; ref: string } | null;
  setPendingCredit: (p: { amountKobo: number; ref: string } | null) => void;
};

const Ctx = createContext<AccountData | null>(null);
export const useAccount = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAccount must be used inside <AccountShell>");
  return v;
};

const NAV = [
  { href: "/account/orders", label: "Orders", key: "orders" },
  { href: "/account/exchanges", label: "Exchanges", key: "exchanges" },
  { href: "/account/addresses", label: "Addresses", key: "addresses" },
  { href: "/account/wishlist", label: "Saved", key: "saved" },
  { href: "/account/privacy", label: "Privacy", key: "privacy" },
] as const;

const two = (n: number | undefined) => (n == null ? "" : String(n).padStart(2, "0"));

/** Signed-in account layout (ExchangeV2 left column): greeting, nav with mono counts, exchange-credit card. */
export function AccountShell({ children, topBar }: { children: ReactNode; topBar?: ReactNode }) {
  const { user, status, logout } = useAuth();
  const { ids } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [credit, setCredit] = useState<CreditLedger | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[] | null>(null);
  const [pendingCredit, setPendingCredit] = useState<{ amountKobo: number; ref: string } | null>(null);

  const reload = useCallback(async () => {
    const [o, a, c, x] = await Promise.allSettled([accountApi.orders(), accountApi.addresses(), accountApi.credit(), exchangesApi.mine()]);
    if (o.status === "fulfilled") setOrders(o.value);
    if (a.status === "fulfilled") setAddresses(a.value);
    if (c.status === "fulfilled") setCredit(c.value);
    if (x.status === "fulfilled") setExchanges(x.value);
  }, []);

  useEffect(() => {
    if (status === "authed") void reload();
  }, [status, reload]);

  useEffect(() => {
    const next = params.get("next");
    if (status === "authed" && next && next.startsWith("/") && !next.startsWith("/account")) router.replace(next);
  }, [status, params, router]);

  // /account?view=verify&token=… (link from the "Confirm your email" email) works signed in or not.
  if (params.get("view") === "verify") return <VerifyEmailView token={params.get("token") ?? ""} onVerified={reload} />;

  if (status === "loading") {
    return (
      <div className="container empty empty--page" aria-busy="true">
        <span className="mono-label">LOADING YOUR ACCOUNT…</span>
      </div>
    );
  }
  if (status === "guest" || !user) return <AuthForms />;

  const counts: Record<string, string> = {
    orders: two(orders?.length),
    exchanges: exchanges?.some((e) => !["COMPLETED", "DECLINED"].includes(e.status)) ? "●" : two(exchanges?.length),
    addresses: two(addresses?.length),
    saved: two(ids.size),
    privacy: "",
  };
  const latestCreditRef = exchanges?.find((e) => e.status === "CREDIT_ISSUED" || e.status === "COMPLETED")?.number ?? null;

  return (
    <Ctx.Provider value={{ orders, addresses, credit, exchanges, reload, setAddresses, pendingCredit, setPendingCredit }}>
      {topBar}
      {user.emailVerified === false && <VerifyNoticeBar />}
      <div className="container account">
        <aside className="account__aside">
          <div>
            <div className="mono-label">ACCOUNT</div>
            <div className="serif account__hello">
              Hello, <em>{user.firstName || "there"}</em>
            </div>
          </div>
          <nav aria-label="Account" className="account__nav">
            {NAV.map((n) => {
              const on = pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={`account__link${on ? " is-on" : ""}`} aria-current={on ? "page" : undefined}>
                  <span>{n.label}</span>
                  <span className={`mono-xs${counts[n.key] === "●" ? " ink" : ""}`}>{counts[n.key]}</span>
                </Link>
              );
            })}
            <button type="button" className="account__link account__signout" onClick={() => logout().then(() => router.push("/account"))}>
              <span>Sign out</span>
              <span className="mono-xs">→</span>
            </button>
          </nav>
          {user.emailVerified === false ? (
            <CreditLocked />
          ) : (
            <CreditCard
              balanceKobo={pendingCredit ? pendingCredit.amountKobo : credit?.balanceKobo ?? user.creditBalanceKobo}
              state={pendingCredit ? "PENDING · ADDED ON RECEIPT" : "AVAILABLE"}
              reference={pendingCredit?.ref ?? latestCreditRef}
            />
          )}
          {credit && credit.entries.some((e) => e.expiresAt) && !pendingCredit && (
            <p className="mono-xs">
              CREDIT NEVER PAID OUT AS CASH ·{" "}
              {(() => {
                const exp = credit.entries.filter((e) => e.amountKobo > 0 && e.expiresAt).map((e) => e.expiresAt!).sort()[0];
                return exp ? `EARLIEST EXPIRES ${new Date(exp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}` : "";
              })()}
            </p>
          )}
        </aside>
        <section className="account__main">{children}</section>
      </div>
    </Ctx.Provider>
  );
}
