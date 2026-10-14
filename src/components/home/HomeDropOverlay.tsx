"use client";
import { useEffect, useState } from "react";
import { DropTakeover, type DropPiece } from "@/components/motion/DropTakeover";
import type { Collection } from "@/lib/types";

const KEY = "ap_drop_overlay_seen";

/** Home takeover while a drop is upcoming — shown once per session, dismissible. */
export function HomeDropOverlay({ collection, title, pieces }: { collection: Collection; title: string; pieces: DropPiece[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(KEY) !== collection.slug) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [collection.slug]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  });
  const close = () => {
    try {
      window.sessionStorage.setItem(KEY, collection.slug);
    } catch {
      /* ignore */
    }
    setOpen(false);
  };
  if (!open) return null;
  return <DropTakeover collection={collection} title={title} pieces={pieces} mode="overlay" onClose={close} />;
}
