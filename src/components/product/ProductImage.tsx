import Image from "next/image";
import type { CSSProperties } from "react";
import { ICON_PATHS, iconKind, type IconKind } from "@/lib/product";
import type { ProductCard } from "@/lib/types";

/** Drawn placeholder (the designs' line icon on --img) */
export function ImagePlaceholder({ kind = "garment", size = 64, stroke = 0.8, className = "", style }: { kind?: IconKind; size?: number; stroke?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`img-ph ${className}`} style={style}>
      <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c9c9c4" strokeWidth={stroke}>
        <path d={ICON_PATHS[kind]} />
      </svg>
    </div>
  );
}

function isOptimisable(src: string) {
  return src.startsWith("/") || src.includes("res.cloudinary.com") || src.includes("placehold.co");
}

/** next/image (fill) when we have a URL; drawn placeholder otherwise. */
export function ProductImage({
  src,
  alt,
  kind = "garment",
  sizes = "(max-width: 767px) 50vw, 25vw",
  priority,
  iconSize = 64,
  iconStroke = 0.8,
  className = "",
  style,
}: {
  src: string | null | undefined;
  alt: string;
  kind?: IconKind;
  sizes?: string;
  priority?: boolean;
  iconSize?: number;
  iconStroke?: number;
  className?: string;
  style?: CSSProperties;
}) {
  if (!src) return <ImagePlaceholder kind={kind} size={iconSize} stroke={iconStroke} className={className} style={style} />;
  return (
    <div className={`img-fill ${className}`} style={style}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!isOptimisable(src)} style={{ objectFit: "cover" }} />
    </div>
  );
}

export function ProductThumb({ product, className = "" }: { product: Pick<ProductCard, "images" | "name" | "material" | "number">; className?: string }) {
  return (
    <div className={`thumb ${className}`}>
      <ProductImage src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} kind={iconKind(product)} sizes="80px" iconSize={28} />
    </div>
  );
}
