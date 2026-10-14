import type { SVGProps } from "react";

const base = { fill: "none", stroke: "currentColor", "aria-hidden": true } as const;

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.4" {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
);
export const HeartIcon = ({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" strokeWidth="1.5" {...base} fill={filled ? "currentColor" : "none"} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
);
export const MenuIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.4" {...base} {...p}><path d="M4 9h16M4 15h10" /></svg>
);
export const BackIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.4" {...base} {...p}><path d="M15 5l-7 7 7 7" /></svg>
);
export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.5" {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const ChatIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.4" {...base} {...p}><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.5-5.4A8.5 8.5 0 1 1 21 12z" /></svg>
);
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg width="10" height="10" viewBox="0 0 10 10" strokeWidth="1.2" {...base} {...p}><path d="M2 3.5l3 3 3-3" /></svg>
);
export const ChevronUp = (p: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.5" {...base} {...p}><path d="M6 15l6-6 6 6" /></svg>
);
export const ChevronDownLg = (p: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.5" {...base} {...p}><path d="M6 9l6 6 6-6" /></svg>
);
