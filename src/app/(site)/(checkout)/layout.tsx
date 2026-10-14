import { CheckoutHeader } from "@/components/chrome/CheckoutHeader";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CheckoutHeader />
      <main id="main" tabIndex={-1} className="checkout-main">
        {children}
      </main>
    </>
  );
}
