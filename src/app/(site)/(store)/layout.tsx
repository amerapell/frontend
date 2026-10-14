import { Ticker } from "@/components/chrome/Ticker";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Header />
      <main id="main" tabIndex={-1} className="store-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
