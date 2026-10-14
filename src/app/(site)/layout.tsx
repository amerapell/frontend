import { Providers } from "@/context/Providers";
import { getCollections, getSettings } from "@/lib/server-data";
import { CookieNotice } from "@/components/chrome/CookieNotice";
import { SearchOverlay } from "@/components/chrome/SearchOverlay";
import { MobileMenu } from "@/components/chrome/MobileMenu";
import { BagDrawer } from "@/components/cart/BagDrawer";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, collections] = await Promise.all([getSettings(), getCollections()]);
  return (
    <Providers settings={settings} collections={collections}>
      {children}
      <SearchOverlay />
      <MobileMenu />
      <BagDrawer />
      <SizeGuideModal />
      <CookieNotice />
    </Providers>
  );
}
