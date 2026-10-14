"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { BagPill } from "./BagPill";
import { BackIcon, MenuIcon, SearchIcon } from "./Icons";

export const NAV = [
  { slug: "women", label: "Women" },
  { slug: "men", label: "Men" },
  { slug: "bags-accessories", label: "Bags & Accessories" },
  { slug: "shoes", label: "Shoes" },
];

export function useNav() {
  const { collection, settings, drop } = useSettings();
  const items = NAV.map((n) => ({ ...n, href: `/c/${n.slug}`, count: collection(n.slug)?.count, label: collection(n.slug)?.name ?? n.label }));
  const dropLink = settings.drop ? { href: `/drop/${settings.drop.collectionSlug}`, label: drop?.name ?? settings.drop.title } : null;
  return { items, dropLink };
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, dropLink } = useNav();
  const { setSearchOpen, setMenuOpen } = useUI();
  const { count } = useCart();
  const onPdp = pathname.startsWith("/p/");

  return (
    <header className="site-header">
      {/* Desktop — 76px */}
      <div className="site-header__inner container hide-mobile">
        <Link href="/" className="wordmark" aria-label="Amerapelle — home">
          Amerapelle
        </Link>
        <nav aria-label="Main" className="site-nav">
          {items.map((n) => (
            <Link key={n.slug} href={n.href} className={pathname === n.href ? "is-active" : undefined} aria-current={pathname === n.href ? "page" : undefined}>
              {n.label}
              {n.count != null && <sup className="nav-count">{n.count}</sup>}
            </Link>
          ))}
          {dropLink && (
            <Link href={dropLink.href} className="site-nav__drop">
              <span className="pulse-dot ap-pulse" aria-hidden />
              {dropLink.label}
            </Link>
          )}
        </nav>
        <div className="site-header__actions">
          <button type="button" className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link href="/account" className={`header-link${pathname.startsWith("/account") ? " is-active" : ""}`}>
            Account
          </Link>
          <Link href="/bag" className="header-link header-link--bag" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}>
            Bag <BagPill />
          </Link>
        </div>
      </div>

      {/* Mobile — 56px: menu (or back on product) / centred wordmark / bag pill */}
      <div className="site-header__mobile show-mobile">
        {onPdp ? (
          <button type="button" className="icon-btn" aria-label="Back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}>
            <BackIcon />
          </button>
        ) : (
          <button type="button" className="icon-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>
        )}
        <Link href="/" className="wordmark wordmark--mobile">
          Amerapelle
        </Link>
        <Link href="/bag" className="icon-btn" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}>
          <BagPill />
        </Link>
      </div>
    </header>
  );
}
