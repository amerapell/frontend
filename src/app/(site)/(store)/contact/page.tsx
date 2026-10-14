import type { Metadata } from "next";
import { ContentHead } from "@/components/home/ContentHead";
import { ContactForm } from "@/components/home/ContactForm";
import { getSettings } from "@/lib/server-data";
import { whatsappLink } from "@/lib/product";
import { SITE_URL } from "@/lib/env";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contact", description: "WhatsApp, phone, email or visit the Amerapelle store in Lagos.", alternates: { canonical: `${SITE_URL}/contact` } };

export default async function ContactPage() {
  const s = await getSettings();
  const map = s.pickupAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.pickupAddress)}` : null;
  const ig = s.instagramUrl ? "@" + s.instagramUrl.replace(/\/$/, "").split("/").pop() : null;
  return (
    <>
      <ContentHead crumb="CONTACT" title={<>Talk to <em className="navy-em">us</em></>} lede="A stylist answers on WhatsApp, usually within minutes during opening hours." />
      <section className="container contact">
        <div className="contact__channels">
          <a href={whatsappLink(s.whatsappNumber, "Hi Amerapelle, ")} className="channel" target="_blank" rel="noopener noreferrer">
            <span className="mono-label">WHATSAPP · FASTEST</span>
            <span className="serif channel__value">Message a stylist →</span>
          </a>
          {s.contactPhone && (
            <a href={`tel:${s.contactPhone}`} className="channel">
              <span className="mono-label">PHONE</span>
              <span className="serif channel__value">{s.contactPhone}</span>
            </a>
          )}
          {s.contactEmail && (
            <a href={`mailto:${s.contactEmail}`} className="channel">
              <span className="mono-label">EMAIL</span>
              <span className="serif channel__value">{s.contactEmail}</span>
            </a>
          )}
          {s.instagramUrl && (
            <a href={s.instagramUrl} className="channel" target="_blank" rel="noopener noreferrer">
              <span className="mono-label">INSTAGRAM</span>
              <span className="serif channel__value">{ig}</span>
            </a>
          )}
          <div className="channel channel--static">
            <span className="mono-label">VISIT</span>
            <span className="channel__text">{s.pickupAddress || "Lagos, Nigeria"}</span>
            {s.openingHours && <span className="channel__text muted">{s.openingHours}</span>}
            {map && <a href={map} className="ap-link small-link" target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>}
          </div>
        </div>
        <div className="contact__form">
          <div className="mono-label rule-head">SEND A MESSAGE</div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
