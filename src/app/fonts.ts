import type { CSSProperties } from "react";
import localFont from "next/font/local";

/*
 * Self-hosted fonts (fonts.googleapis.com is not reachable at build time).
 * Files are copied from @fontsource/* into ./fonts. Each family is split into a latin
 * face and a latin-ext face (which carries ₦, U+20A6); both are chained in the CSS
 * variable so the naira sign renders in the brand faces.
 */
/** Display face: Montserrat — the typeface of the Amerapelle logo wordmark. */
export const displayLatin = localFont({
  src: [
    { path: "./fonts/montserrat-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/montserrat-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/montserrat-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/montserrat-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/montserrat-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/montserrat-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: false,
  preload: true,
});
export const displayExt = localFont({
  src: [
    { path: "./fonts/montserrat-latin-ext-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/montserrat-latin-ext-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/montserrat-latin-ext-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/montserrat-latin-ext-600-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/montserrat-latin-ext-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/montserrat-latin-ext-700-italic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});
export const sansLatin = localFont({
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: false,
  preload: true,
});
export const sansExt = localFont({
  src: [
    { path: "./fonts/inter-latin-ext-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-ext-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-latin-ext-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});
export const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

/** CSS custom properties exposed on <html>. --font-serif is the display slot (now Montserrat, from the logo). */
export const fontVars = {
  "--font-serif": `${displayLatin.style.fontFamily}, ${displayExt.style.fontFamily}`,
  "--font-sans": `${sansLatin.style.fontFamily}, ${sansExt.style.fontFamily}`,
  "--font-mono": mono.style.fontFamily,
} as CSSProperties;
