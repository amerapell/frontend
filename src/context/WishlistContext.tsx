"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { accountApi } from "@/lib/api";
import type { ProductCard } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type WishlistValue = {
  ids: Set<string>;
  items: ProductCard[];
  has: (productId: string) => boolean;
  toggle: (p: Pick<ProductCard, "id" | "name">) => Promise<void>;
  reload: () => Promise<void>;
};

const Ctx = createContext<WishlistValue | null>(null);
const LOCAL = "ap_wishlist";

function readLocal(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL) || "[]") as string[];
  } catch {
    return [];
  }
}
function writeLocal(ids: string[]) {
  try {
    window.localStorage.setItem(LOCAL, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/** ACC-3 wishlist. Guests save locally; on sign-in local saves merge into the account. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const toast = useToast();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<ProductCard[]>([]);

  const reload = useCallback(async () => {
    if (status === "authed") {
      try {
        let list = await accountApi.wishlist();
        const local = readLocal().filter((id) => !list.some((p) => p.id === id));
        for (const id of local) list = await accountApi.addWish(id);
        writeLocal([]);
        setItems(list);
        setIds(new Set(list.map((p) => p.id)));
      } catch {
        /* ignore */
      }
    } else if (status === "guest") {
      setItems([]);
      setIds(new Set(readLocal()));
    }
  }, [status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggle = useCallback<WishlistValue["toggle"]>(
    async (p) => {
      const on = ids.has(p.id);
      const next = new Set(ids);
      if (on) next.delete(p.id);
      else next.add(p.id);
      setIds(next);
      try {
        if (status === "authed") {
          const list = on ? await accountApi.removeWish(p.id) : await accountApi.addWish(p.id);
          setItems(list);
        } else {
          writeLocal(Array.from(next));
        }
        if (!on) toast.show({ message: `Saved · ${p.name}`, action: { label: "View saved", href: "/account/wishlist" } });
      } catch {
        setIds(ids);
        toast.show({ message: "Couldn't update your saved pieces.", tone: "error" });
      }
    },
    [ids, status, toast],
  );

  const value = useMemo(() => ({ ids, items, has: (id: string) => ids.has(id), toggle, reload }), [ids, items, toggle, reload]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return v;
}
