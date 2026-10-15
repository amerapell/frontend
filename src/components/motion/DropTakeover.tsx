"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdirePattern } from "@/components/patterns/Patterns";
import { useCountdown, splitClock } from "@/components/ui/Countdown";
import { ProductImage } from "@/components/product/ProductImage";
import { CloseIcon } from "@/components/chrome/Icons";
import { catalogApi, contentApi } from "@/lib/api";
import { apiMessage, italicWord, naira, pad2 } from "@/lib/format";
import { iconKind } from "@/lib/product";
import { prefersReducedMotion } from "@/lib/motion";
import type { Collection, ProductCard } from "@/lib/types";
import { Logo } from "@/components/brand/Logo";

export type DropPiece = ProductCard & { left: number };

type Props = {
  collection: Collection;
  title: string;
  pieces: DropPiece[];
  mode?: "page" | "overlay";
  onClose?: () => void;
};

function NotifyForm({ slug }: { slug: string }) {
  const [v, setV] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.trim()) return;
    setState("busy");
    try {
      await contentApi.notifyDrop(v.trim(), slug);
      setState("ok");
      setMsg("You're on the list — we'll message you the minute it opens.");
    } catch (err) {
      setState("err");
      setMsg(apiMessage(err));
    }
  };
  return (
    <form onSubmit={submit} className="stack gap-8">
      <div className="line-input">
        <label htmlFor="notify" className="sr-only">Email or WhatsApp number</label>
        <input id="notify" type="text" inputMode="email" autoComplete="email" placeholder="Email or WhatsApp number" value={v} onChange={(e) => setV(e.target.value)} />
        <button type="submit" disabled={state === "busy"} className="notify-btn">Notify me →</button>
      </div>
      {msg && <span className={state === "err" ? "form-error" : "form-ok"} role="status">{msg}</span>}
    </form>
  );
}

/**
 * Drop launch takeover (DropLaunchV2): drifting Adire curtain in two halves + frosted countdown
 * card. At go-live the halves slide apart, the headline rises from a mask, cards fade up
 * staggered and stock counters tick.
 */
export function DropTakeover({ collection, title, pieces, mode = "page", onClose }: Props) {
  const goLive = collection.goLiveAt ? new Date(collection.goLiveAt).getTime() : null;
  const secs = useCountdown(goLive);
  const [stage, setStage] = useState<"curtain" | "opening" | "live">(() => (goLive && goLive > Date.now() ? "curtain" : "opening"));
  const [stock, setStock] = useState<Record<string, number>>(() => Object.fromEntries(pieces.map((p) => [p.id, p.left])));
  const timer = useRef<number | null>(null);

  const launch = useCallback(() => {
    setStage("opening");
  }, []);

  // when the countdown hits zero, open the curtain
  useEffect(() => {
    if (stage === "curtain" && secs === 0) launch();
  }, [secs, stage, launch]);

  // the curtain unmounts once the halves are gone
  useEffect(() => {
    if (stage !== "opening") return;
    timer.current = window.setTimeout(() => setStage("live"), prefersReducedMotion() ? 0 : 1400);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [stage]);

  // stock counters: refresh from the API while the drop is open
  useEffect(() => {
    if (stage === "curtain") return;
    const id = window.setInterval(async () => {
      const next: Record<string, number> = {};
      await Promise.all(
        pieces.map(async (p) => {
          try {
            const full = await catalogApi.product(p.slug);
            next[p.id] = full.variants.reduce((s, v) => s + v.available, 0);
          } catch {
            /* keep previous */
          }
        }),
      );
      setStock((s) => ({ ...s, ...next }));
    }, 15000);
    return () => window.clearInterval(id);
  }, [stage, pieces]);

  const clock = secs != null ? splitClock(secs) : null;
  const [a, b, c] = italicWord(title);
  const dropName = collection.name.toUpperCase();
  const curtainVisible = stage !== "live";
  const showLive = stage !== "curtain";
  const total = collection.count;

  return (
    <div className={`drop drop--${mode}`} role={mode === "overlay" ? "dialog" : undefined} aria-modal={mode === "overlay" ? true : undefined} aria-label={`${collection.name} — ${title}`}>
      {showLive && (
        <div className="drop__live">
          <div className="drop__bar">
            <Link href="/" className="drop__mark" aria-label="Amerapelle — home"><Logo size={30} /></Link>
            <span className="drop__status">
              <span className="pulse-dot pulse-dot--7 ap-pulse" aria-hidden />
              {dropName} · LIVE NOW
            </span>
          </div>
          <div className="drop__headrow">
            <div className="drop__mask">
              <h1 className="serif drop__headline ap-rise" style={{ animationDelay: "900ms" }}>
                {a}<em className="navy-em">{b}</em>{c}
              </h1>
            </div>
            <span className="mono-label ap-fadeup" style={{ animationDelay: "1200ms" }}>{total} PIECES · NO RESTOCKS</span>
          </div>
          <ul className="drop__grid">
            {pieces.slice(0, 4).map((p, i) => (
              <li key={p.id} className="ap-fadeup" style={{ animationDelay: `${1050 + i * 110}ms` }}>
                <Link href={`/p/${p.slug}`} className="drop-piece">
                  <div className="drop-piece__img">
                    <ProductImage src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} kind={iconKind(p)} sizes="(max-width: 767px) 50vw, 25vw" />
                    <span className="card__no">{p.number}</span>
                    <span className="tag drop-piece__tag"><span className="tag__dot" style={{ background: "var(--red)" }} />Drop</span>
                  </div>
                  <span className="card__row">
                    <span className="card__name">{p.name}</span>
                    <span className="tnum">{naira(p.priceKobo)}</span>
                  </span>
                  <span key={stock[p.id]} className="mono-xs red ap-tick">● {stock[p.id] > 0 ? `${stock[p.id]} LEFT` : "SOLD OUT"}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="drop__more ap-fadeup" style={{ animationDelay: "1500ms" }}>
            <Link href={`/c/${collection.slug}`} className="btn btn--short">Shop all {total} pieces <span aria-hidden>→</span></Link>
            {mode === "overlay" && <button className="ap-link small-link" onClick={onClose}>Enter the store</button>}
          </div>
        </div>
      )}

      {curtainVisible && (
        <div className="drop__curtain" aria-hidden={stage === "opening"}>
          <div className={`drop__half drop__half--l on-dark${stage === "opening" ? " ap-splitL" : ""}`}>
            <AdirePattern drift redStars width={1440} height={1200} />
          </div>
          <div className={`drop__half drop__half--r on-dark${stage === "opening" ? " ap-splitR" : ""}`}>
            <AdirePattern drift redStars width={1440} height={1200} style={{ marginLeft: "-50vw" }} />
          </div>
          {stage === "curtain" && (
            <div className="drop__card">
              <div className="drop__card-top mono-label">
                <span>{dropName} · {title.toUpperCase()}</span>
                <span>OPENS IN</span>
              </div>
              <div className="drop__clock" role="timer" aria-label={clock ? `${clock.h} hours ${clock.m} minutes ${clock.s} seconds` : "Loading countdown"}>
                {[
                  [clock ? pad2(clock.h) : "--", "HOURS"],
                  [clock ? pad2(clock.m) : "--", "MINUTES"],
                  [clock ? pad2(clock.s) : "--", "SECONDS"],
                ].map(([v, l]) => (
                  <div key={l} className="drop__unit">
                    <span className="serif tnum drop__num" suppressHydrationWarning>{v}</span>
                    <span className="mono-xs">{l}</span>
                  </div>
                ))}
              </div>
              <NotifyForm slug={collection.slug} />
              <div className="row between">
                <span className="drop__waiting">{collection.description ?? "Limited run. No restocks."}</span>
                {mode === "overlay" ? (
                  <button type="button" className="btn btn--ghost" onClick={onClose}>Browse the store</button>
                ) : (
                  <Link href="/" className="btn btn--ghost">Browse the store</Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "overlay" && (
        <button type="button" className="icon-btn drop__close on-dark" aria-label="Close drop preview" onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
