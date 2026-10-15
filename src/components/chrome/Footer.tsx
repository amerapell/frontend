"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AsookeStripe } from "@/components/patterns/Patterns";
import { useSettings } from "@/context/SettingsContext";
import { contentApi } from "@/lib/api";
import { apiMessage } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      setMsg("Enter a valid email address.");
      return;
    }
    setState("busy");
    try {
      await contentApi.newsletter(email);
      setState("ok");
      setMsg("You're on the list. See you at the next drop.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMsg(apiMessage(err));
    }
  };
  return (
    <form className="footer__col" onSubmit={submit} noValidate>
      <label htmlFor="news" className="mono-label footer__head">FIRST TO KNOW ABOUT DROPS</label>
      <div className="line-input">
        <input id="news" type="email" autoComplete="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby="news-note" />
        <button type="submit" disabled={state === "busy"}>Join →</button>
      </div>
      <span id="news-note" className={state === "error" ? "form-error" : state === "ok" ? "form-ok" : "footer__fine"} role={state === "error" ? "alert" : undefined}>
        {msg || "Drop emails only. Unsubscribe any time."}
      </span>
    </form>
  );
}

/** Footer: 40px Aso-oke band. Home = 4 columns + giant cropped wordmark; inner pages = compact row. */
export function Footer({ variant }: { variant?: "home" | "compact" }) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const v = variant ?? (pathname === "/" ? "home" : "compact");
  const year = new Date().getFullYear();

  if (v === "compact") {
    return (
      <footer className="footer footer--compact">
        <AsookeStripe height={40} />
        <div className="container footer__row">
          <Link href="/" className="footer__mark" aria-label="Amerapelle — home"><Logo size={30} /></Link>
          <nav aria-label="Footer" className="footer__links">
            <Link href="/policies/delivery">Delivery</Link>
            <Link href="/policies/exchanges">Exchanges</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
          </nav>
          <span className="mono-label">© {year} AMERAPELLE · LAGOS</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <AsookeStripe height={40} />
      <div className="container footer__grid">
        <div className="footer__col">
          <span className="mono-label footer__head">SHOP</span>
          <Link href="/c/women">Women</Link>
          <Link href="/c/men">Men</Link>
          <Link href="/c/bags-accessories">Bags &amp; Accessories</Link>
          <Link href="/c/shoes">Shoes</Link>
        </div>
        <div className="footer__col">
          <span className="mono-label footer__head">HELP</span>
          <Link href="/policies/delivery">Delivery</Link>
          <Link href="/policies/exchanges">Exchanges</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/orders/lookup">Track an order</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer__col">
          <span className="mono-label footer__head">VISIT</span>
          <span>{settings.pickupAddress || "Lagos, Nigeria"}</span>
          {settings.openingHours && <span>{settings.openingHours}</span>}
          <span className="row gap-16">
            {settings.instagramUrl && <a href={settings.instagramUrl} className="ap-link" target="_blank" rel="noopener noreferrer">Instagram</a>}
            {settings.tiktokUrl && <a href={settings.tiktokUrl} className="ap-link" target="_blank" rel="noopener noreferrer">TikTok</a>}
          </span>
        </div>
        <Newsletter />
      </div>
      <div className="container footer__legal">
        <span className="mono-label">© {year} AMERAPELLE · LAGOS</span>
        <span className="row gap-16">
          <Link href="/about" className="mono-label">ABOUT</Link>
          <Link href="/policies/privacy" className="mono-label">PRIVACY</Link>
          <Link href="/policies/terms" className="mono-label">TERMS</Link>
        </span>
      </div>
      <div className="container footer__giant-wrap" aria-hidden>
        <div className="footer__giant serif">AMERAPELLE</div>
      </div>
    </footer>
  );
}
