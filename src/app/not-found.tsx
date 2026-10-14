import Link from "next/link";
import { Providers } from "@/context/Providers";
import { getCollections, getSettings } from "@/lib/server-data";
import { Ticker } from "@/components/chrome/Ticker";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CutPaperCollage } from "@/components/patterns/Patterns";
import { SearchOverlay } from "@/components/chrome/SearchOverlay";
import { MobileMenu } from "@/components/chrome/MobileMenu";

export default async function NotFound() {
  const [settings, collections] = await Promise.all([getSettings(), getCollections()]);
  return (
    <Providers settings={settings} collections={collections}>
      <Ticker />
      <Header />
      <main id="main" tabIndex={-1} className="container nf">
        <div className="nf__art" aria-hidden>
          <CutPaperCollage />
        </div>
        <div className="nf__copy">
          <div className="mono-label">404 — NOT FOUND</div>
          <h1 className="serif nf__title">
            This piece has <em className="navy-em">sold out</em>
            <span className="red">.</span>
          </h1>
          <p className="body-copy">Or it never existed. Either way, there&apos;s plenty more in the store.</p>
          <div className="row gap-24 wrap">
            <Link href="/" className="btn btn--short">Back to the index <span aria-hidden>→</span></Link>
            <Link href="/c/new-in" className="ap-link">Shop new in</Link>
          </div>
        </div>
      </main>
      <Footer variant="compact" />
      <SearchOverlay />
      <MobileMenu />
    </Providers>
  );
}
