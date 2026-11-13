import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { fullAddress, site } from "@/config/site";
import "./globals.css";
import "./decor.css";

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const body = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Seared Vegas | Cajun Food Truck in Las Vegas — Order Online",
  description:
    "Tycoon Cajun tacos, loaded plates, and surf & turf from Seared Vegas, a Cajun food truck in Las Vegas. Start your order online.",
  openGraph: {
    title: "Seared Vegas — Big Flavor. Vegas Heat.",
    description: `Tycoon Cajun tacos, loaded plates, and surf & turf. ${fullAddress}.`,
    type: "website",
  },
  // Icons and the share image come from the file conventions in src/app
  // (icon.svg, favicon.ico, apple-icon.png, opengraph-image.jpg, twitter-image.jpg).
  // TODO(owner): set `metadataBase` to the production URL once the domain is known,
  // so the share image resolves to an absolute address.
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#120e0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <CartProvider>{children}</CartProvider>
        <script
          type="application/ld+json"
          // Structured data for local search. Address/phone pending owner confirmation.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              name: site.name,
              servesCuisine: "Cajun",
              telephone: site.phone.display,
              address: {
                "@type": "PostalAddress",
                streetAddress: site.location.street,
                addressLocality: site.location.city,
                addressRegion: site.location.region,
                addressCountry: "US",
              },
              sameAs: [site.instagram.url],
            }),
          }}
        />
      </body>
    </html>
  );
}
