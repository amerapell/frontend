"use client";
import { useEffect, type ReactNode } from "react";
import type { Collection, StoreSettings } from "@/lib/types";
import { captureUtm } from "@/lib/utm";
import { SettingsProvider } from "./SettingsContext";
import { ToastProvider } from "./ToastContext";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { UIProvider } from "./UIContext";

export function Providers({ settings, collections, children }: { settings: StoreSettings; collections: Collection[]; children: ReactNode }) {
  useEffect(() => {
    captureUtm();
  }, []);
  return (
    <SettingsProvider settings={settings} collections={collections}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <UIProvider>{children}</UIProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
