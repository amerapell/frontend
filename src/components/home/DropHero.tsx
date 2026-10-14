"use client";
import Link from "next/link";
import { AdirePattern } from "@/components/patterns/Patterns";
import { Countdown, useCountdown } from "@/components/ui/Countdown";
import { ProductImage } from "@/components/product/ProductImage";
import { dotDate } from "@/lib/format";
import { iconKind } from "@/lib/product";
import type { Collection, DropSettings, ProductCard } from "@/lib/types";
import { dropPhase } from "@/lib/drop";

function dropIndex(c: Collection | undefined, d: DropSettings) {
  const name = c?.name ?? d.title;
  return name.toUpperCase();
}

export function DropHero({ drop, collection, pieces }: { drop: DropSettings | null; collection: Collection | undefined; pieces: ProductCard[] }) {
  const { phase, target } = dropPhase(drop);
  const secs = useCountdown(target);
  const href = drop ? `/drop/${drop.collectionSlug}` : "/c/new-in";
  const shopHref = drop ? (phase === "upcoming" ? `/drop/${drop.collectionSlug}` : `/c/${drop.collectionSlug}`) : "/c/new-in";
  const names = pieces.slice(0, 3).map((p, i) => (i === 0 ? p.name : p.name.toLowerCase()));
  const more = Math.max(0, (collection?.count ?? pieces.length) - 3);
  const label = phase === "upcoming" ? "OPENS IN" : "FIRST RUN CLOSES IN";
  const showClock = phase === "upcoming" || phase === "live";

  return (
    <section className="home-hero container" aria-labelledby="hero-title">
      <div className="home-hero__copy">
        <div className="mono-label home-hero__index">
          <span>(01) — {drop ? `${dropIndex(collection, drop)} / ${drop.title.toUpperCase()}` : "NEW SEASON"}</span>
          <span>LAGOS{drop?.goLiveAt ? ` · ${dotDate(drop.goLiveAt)}` : ""}</span>
        </div>
        <h1 id="hero-title" className="serif home-hero__title">
          Quiet <em className="navy-em">luxury,</em>
          <br className="hide-mobile" /> loud entrance.
        </h1>
        <div className="home-hero__foot hide-mobile">
          <p className="body-copy home-hero__lede">Forty-eight pieces cut for Lagos evenings: tailoring, leather and silk in navy, ink and ivory. Limited runs. No restocks.</p>
          <div className="row gap-24 wrap">
            <Link href={shopHref} className="btn btn--short">
              {phase === "upcoming" ? "Preview the drop" : "Shop the drop"} <span aria-hidden>→</span>
            </Link>
            <Link href="/reel" className="ap-link home-hero__alt">Explore lookbook</Link>
          </div>
        </div>
      </div>

      <div className="home-hero__art">
        <div className="home-hero__arch">
          <AdirePattern drift redStars width="140%" height="140%" className="hide-mobile" />
          <AdirePattern drift tile={120} width="160%" height="160%" className="show-mobile" />
        </div>
        {drop && showClock && (
          <Link href={href} className="hero-card">
            <div className="hero-card__top">
              <span>{label}</span>
              <span className="red">
                ● {drop.firstRunLeft} <span className="hide-mobile">OF</span>
                <span className="show-mobile">/</span> {drop.firstRunTotal} LEFT
              </span>
            </div>
            <div className="serif hero-card__clock">
              <Countdown target={target} />
              <span className="sr-only">{secs != null ? `${Math.floor(secs / 3600)} hours ${Math.floor((secs % 3600) / 60)} minutes remaining` : ""}</span>
            </div>
            <div className="hero-card__pieces hide-mobile">
              {pieces.slice(0, 3).map((p) => (
                <span key={p.id} className="hero-card__thumb">
                  <ProductImage src={p.images[0]?.url} alt="" kind={iconKind(p)} iconSize={18} sizes="44px" />
                </span>
              ))}
              {pieces.length > 0 && (
                <span className="hero-card__names">
                  {names.join(", ")}
                  {more > 0 ? ` +${more}` : ""}
                </span>
              )}
            </div>
          </Link>
        )}
      </div>

      <div className="home-hero__mobile-cta show-mobile">
        <Link href={shopHref} className="btn btn--block">
          <span>{phase === "upcoming" ? "Preview the drop" : "Shop the drop"}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
