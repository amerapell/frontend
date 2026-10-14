/**
 * next/image loader for Cloudinary. Active only when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
 * (see next.config.ts). Cloudinary URLs get width/quality/format transforms injected;
 * other URLs are fetched through Cloudinary's fetch delivery type.
 */
type LoaderArgs = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const params = `f_auto,q_${quality || "auto"},w_${width},c_limit`;
  if (!cloud || src.startsWith("data:") || src.startsWith("blob:")) return src;
  const marker = "/image/upload/";
  if (src.includes("res.cloudinary.com") && src.includes(marker)) {
    const [head, tail] = src.split(marker);
    return `${head}${marker}${params}/${tail}`;
  }
  if (src.startsWith("/")) return src;
  return `https://res.cloudinary.com/${cloud}/image/fetch/${params}/${encodeURIComponent(src)}`;
}
