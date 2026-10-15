"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AsookeStripe } from "@/components/patterns/Patterns";
import { BackIcon } from "./Icons";
import { Logo } from "@/components/brand/Logo";

/** Checkout chrome: 8px Aso-oke strip, 3-col header (back link · centred wordmark · SECURE CHECKOUT). */
export function CheckoutHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const onBag = pathname === "/bag";
  return (
    <>
      <AsookeStripe height={8} />
      <header className="checkout-header">
        <div className="container checkout-header__inner hide-mobile">
          {onBag ? (
            <Link href="/c/new-in" className="ap-link checkout-header__back">← Continue shopping</Link>
          ) : (
            <Link href="/bag" className="ap-link checkout-header__back">← Back to bag</Link>
          )}
          <Link href="/" className="wordmark checkout-header__mark" aria-label="Amerapelle — home"><Logo size={32} /></Link>
          <span className="mono-label checkout-header__secure">SECURE CHECKOUT</span>
        </div>
        <div className="site-header__mobile show-mobile">
          <button type="button" className="icon-btn" aria-label="Back" onClick={() => router.push(onBag ? "/" : "/bag")}>
            <BackIcon />
          </button>
          <Link href="/" className="wordmark wordmark--mobile" aria-label="Amerapelle — home"><Logo size={26} /></Link>
          <span />
        </div>
      </header>
    </>
  );
}

/** Mono step indicator: 01 BAG — 02 DETAILS — 03 PAYMENT with active underline. */
export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["BAG", "DETAILS", "PAYMENT"];
  return (
    <ol className="steps" aria-label="Checkout progress">
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "current" : "todo";
        return (
          <li key={s} className={`steps__item steps__item--${state}`} aria-current={state === "current" ? "step" : undefined}>
            {`0${n} ${s}`}
            {state === "done" ? " ✓" : ""}
          </li>
        );
      })}
    </ol>
  );
}
