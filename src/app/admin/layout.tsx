import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Amerapelle" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Admin is entirely client-rendered behind the admin JWT. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </ToastProvider>
  );
}
