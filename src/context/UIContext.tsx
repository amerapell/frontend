"use client";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SizeGuideKind } from "@/lib/types";

type UIValue = {
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  sizeGuide: SizeGuideKind | null;
  openSizeGuide: (k: SizeGuideKind | null) => void;
};

const Ctx = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sizeGuide, openSizeGuide] = useState<SizeGuideKind | null>(null);
  const value = useMemo(() => ({ searchOpen, setSearchOpen, menuOpen, setMenuOpen, sizeGuide, openSizeGuide }), [searchOpen, menuOpen, sizeGuide]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI must be used inside <UIProvider>");
  return v;
}
