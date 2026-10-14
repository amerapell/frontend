"use client";
import { useCart } from "@/context/CartContext";

/** Navy count pill; replays the bump keyframe whenever an item lands. */
export function BagPill({ className = "" }: { className?: string }) {
  const { count, bumpKey } = useCart();
  return (
    <span key={bumpKey} data-bag-pill className={`bag-pill ${bumpKey ? "ap-bump" : ""} ${className}`}>
      {count}
    </span>
  );
}
