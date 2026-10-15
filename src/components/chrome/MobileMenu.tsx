"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "./Header";
import { CloseIcon, SearchIcon } from "./Icons";
import { useDialog } from "./useDialog";
import { Logo } from "@/components/brand/Logo";

export function MobileMenu() {
  const { menuOpen, setMenuOpen, setSearchOpen } = useUI();
  const { items, dropLink } = useNav();
  const { user } = useAuth();
  const pathname = usePathname();
  const close = () => setMenuOpen(false);
  const ref = useDialog(menuOpen, close);
  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);
  if (!menuOpen) return null;
  return (
    <div className="overlay" onClick={close}>
      <div ref={ref} className="menu-panel" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
        <div className="menu-panel__head">
          <span className="wordmark wordmark--mobile"><Logo size={26} /></span>
          <button className="icon-btn" aria-label="Close menu" onClick={close}><CloseIcon /></button>
        </div>
        <button className="menu-panel__search" onClick={() => { close(); setSearchOpen(true); }}>
          <SearchIcon /> <span>Search the store</span>
        </button>
        <nav aria-label="Mobile" className="menu-panel__nav">
          {dropLink && (
            <Link href={dropLink.href} className="menu-panel__link">
              <span className="row gap-8"><span className="pulse-dot ap-pulse" aria-hidden />{dropLink.label}</span>
              <span className="mono-xs red">LIVE</span>
            </Link>
          )}
          <Link href="/c/new-in" className="menu-panel__link"><span>New in</span></Link>
          {items.map((n) => (
            <Link key={n.slug} href={n.href} className="menu-panel__link">
              <span>{n.label}</span>
              {n.count != null && <span className="mono-xs">{String(n.count).padStart(2, "0")}</span>}
            </Link>
          ))}
          <Link href="/c/sale" className="menu-panel__link"><span>Sale</span></Link>
          <Link href="/reel" className="menu-panel__link"><span>Shop the reel</span><span className="mono-xs">→</span></Link>
        </nav>
        <div className="menu-panel__foot">
          <Link href="/account" className="ap-link">{user ? `Account · ${user.firstName}` : "Sign in"}</Link>
          <Link href="/orders/lookup" className="ap-link">Track an order</Link>
          <Link href="/faq" className="ap-link">Help</Link>
          <Link href="/contact" className="ap-link">Contact</Link>
        </div>
      </div>
    </div>
  );
}
