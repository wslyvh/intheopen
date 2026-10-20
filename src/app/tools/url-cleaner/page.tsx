import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { UrlCleaner } from "@/components/url-cleaner";
import { site } from "@/utils/site";

const description = "Remove tracking from links before you share them.";
const metaDescription =
  "Remove tracking from links before you share them. Clean supported tracking parameters and redirects locally in your browser, then copy the cleaned URL.";

export const metadata: Metadata = {
  title: "URL cleaner",
  description: metaDescription,
  alternates: { canonical: "/tools/url-cleaner" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: `URL cleaner | ${site.name}`,
    description: metaDescription,
    url: "/tools/url-cleaner",
  },
  twitter: {
    card: "summary_large_image",
    title: `URL cleaner | ${site.name}`,
    description: metaDescription,
  },
};

export default function UrlCleanerPage() {
  return (
    <>
      <PageHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-sm font-bold lowercase"
          >
            <ol className="flex items-center gap-3">
              <li>
                <Link
                  href="/tools"
                  className="text-primary focus-visible:outline-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  tools
                </Link>
              </li>
              <li aria-hidden="true" className="text-base-content/40">
                /
              </li>
              <li aria-current="page" className="text-base-content/55">
                url cleaner
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            url cleaner
          </h1>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            {description}
          </p>
        </div>
        <UrlCleaner />
      </section>
    </>
  );
}
