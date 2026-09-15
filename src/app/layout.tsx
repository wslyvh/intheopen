import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import PlausibleProvider from "next-plausible";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Providers } from "@/providers";
import { site } from "@/utils/site";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "./fonts/satoshi-variable.woff2", style: "normal" },
    { path: "./fonts/satoshi-variable-italic.woff2", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const jetBrainsMono = localFont({
  src: [
    {
      path: "./fonts/jetbrains-mono-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/jetbrains-mono-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": site.links.feed },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@intheopencc",
    creator: "@intheopencc",
    title: site.title,
    description: site.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: site.themeColor,
  colorScheme: "light",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      description: site.description,
      logo: `${site.url}/icon.svg`,
      sameAs: [site.links.twitter, site.links.newsletter],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: site.language,
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={site.language}
      data-theme="intheopen"
      className={`${satoshi.variable} ${jetBrainsMono.variable} scroll-smooth`}
    >
      <head>
        <PlausibleProvider src={site.analytics.plausibleScript} />
        <JsonLd data={websiteJsonLd} />
      </head>
      <body className="bg-base-100 text-base-content flex min-h-dvh flex-col antialiased">
        <Providers>
          <a
            href="#main-content"
            className="bg-base-content text-base-100 fixed top-3 left-3 z-50 -translate-y-20 px-4 py-2 font-mono text-sm transition-transform focus:translate-y-0"
          >
            Skip to content
          </a>
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
