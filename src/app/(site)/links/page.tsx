import type { Metadata } from "next";
import Link from "next/link";
import { AdirePattern, AsookeStripe } from "@/components/patterns/Patterns";
import { Countdown } from "@/components/ui/Countdown";
import { dropPhase } from "@/lib/drop";
import { catalogApi, safe } from "@/lib/api";
import { getCollections, getSettings } from "@/lib/server-data";
import { whatsappLink } from "@/lib/product";
import { naira, italicWord } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { iconKind } from "@/lib/product";
import { Logo } from "@/components/brand/Logo";

export const revalidate = 60;
export const metadata: Metadata = { title: "Links", description: "The current drop, new in and the Amerapelle collections — all in one place." };

/** SOC-4: link-in-bio, phone-sized. */
export default async function LinksPage() {
  const [s, cols] = await Promise.all([getSettings(), getCollections()]);
  const newIn = await safe(catalogApi.collection("new-in", { pageSize: 4 }).then((r) => r.products.items), []);
  const { phase, target } = dropPhase(s.drop);
  const dropCol = s.drop ? cols.find((c) => c.slug === s.drop!.collectionSlug) : undefined;
  const [a, b, c] = italicWord(s.drop?.title ?? "");
  const count = (slug: string) => cols.find((x) => x.slug === slug)?.count;

  return (
    <main id="main" tabIndex={-1} className="links">
      <div className="links__phone">
        <header className="links__head">
          <span className="links__mark"><Logo variant="stacked" size={72} /></span>
          <span className="mono-xs">LAGOS · LUXURY · LIMITED RUNS</span>
        </header>

        {s.drop && (
          <Link href={`/drop/${s.drop.collectionSlug}`} className="links__drop on-dark">
            <AdirePattern tile={120} redStars className="tile__pattern" />
            <span className="links__dropcard">
              <span className="row between mono-xs">
                <span>{(dropCol?.name ?? "DROP").toUpperCase()}</span>
                <span className="red">{phase === "upcoming" ? "OPENS IN" : phase === "live" ? "● LIVE NOW" : ""}</span>
              </span>
              <span className="serif links__droptitle">{a}<em>{b}</em>{c}</span>
              {target && <span className="serif tnum links__clock"><Countdown target={target} /></span>}
              <span className="links__cta">{phase === "upcoming" ? "Get notified →" : "Shop the drop →"}</span>
            </span>
          </Link>
        )}

        <div className="links__section">
          <div className="row between">
            <span className="serif links__h">New <em>in</em></span>
            <Link href="/c/new-in" className="mono-xs">{count("new-in") ?? ""} PIECES →</Link>
          </div>
          <div className="links__grid">
            {newIn.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/p/${p.slug}`} className="links__tile">
                <span className="links__img">
                  <ProductImage src={p.images[0]?.url} alt={p.name} kind={iconKind(p)} iconSize={36} sizes="180px" />
                  <span className="card__no">{p.number}</span>
                </span>
                <span className="links__name">{p.name}</span>
                <span className="tnum meta">{naira(p.priceKobo)}</span>
              </Link>
            ))}
          </div>
        </div>

        <nav className="links__list" aria-label="Collections">
          {[
            ["women", "Women"],
            ["men", "Men"],
            ["bags-accessories", "Bags & Accessories"],
            ["shoes", "Shoes"],
            ["sale", "Sale"],
          ].map(([slug, label]) => (
            <Link key={slug} href={`/c/${slug}`} className="links__row">
              <span>{label}</span>
              <span className="mono-xs">{count(slug) != null ? String(count(slug)).padStart(2, "0") : ""} →</span>
            </Link>
          ))}
          <Link href="/reel" className="links__row"><span>Shop the reel</span><span className="mono-xs">VIDEO →</span></Link>
          <a href={whatsappLink(s.whatsappNumber, "Hi Amerapelle, ")} className="links__row" target="_blank" rel="noopener noreferrer"><span>Ask a stylist on WhatsApp</span><span className="mono-xs">↗</span></a>
          <Link href="/orders/lookup" className="links__row"><span>Track an order</span><span className="mono-xs">→</span></Link>
        </nav>
        <AsookeStripe height={24} />
        <p className="mono-xs links__foot">DELIVERY ACROSS NIGERIA · EXCHANGE, NOT REFUND</p>
      </div>
    </main>
  );
}
